const mongoose = require('mongoose');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const City = require('../models/City');
const ShowSeat = require('../models/ShowSeat');
const { escapeRegex } = require('../utils/escapeRegex');
const { deepTrust } = require('../utils/deepTrust');
const { resolveShowCancellability } = require('../utils/cancellationPolicy');
const { getShowStartDate, isShowBookable, getISTCalendarDateString } = require('../utils/showTime');

class ShowRepository {
  async findByMovie({ movieId, cityId, location, date, isActive = true, includePast = false } = {}) {
    if (!movieId) {
      throw new Error('Movie ID is required');
    }

    let resolvedMovieId = movieId;
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      const foundMovie = await Movie.findOne({ slug: movieId });
      if (foundMovie) {
        resolvedMovieId = foundMovie._id;
      }
    }

    let showFilter = { movie: resolvedMovieId, isActive };

    if (date) {
      const dateStr = String(date).split('T')[0];
      const istStart = new Date(`${dateStr}T00:00:00+05:30`);
      const istEnd = new Date(`${dateStr}T23:59:59.999+05:30`);

      showFilter.$or = [
        { startsAt: { $gte: istStart, $lte: istEnd } },
        { date: { $gte: istStart, $lte: istEnd } }
      ];
    }

    if (cityId || location) {
      let resolvedCityId = cityId;
      if (!resolvedCityId && location) {
        const city = await City.findOne({ name: new RegExp(`^${escapeRegex(location)}$`, 'i') });
        resolvedCityId = city?._id;
      }

      if (resolvedCityId) {
        const theatres = await Theatre.find({ city: resolvedCityId, isActive: true }).select('_id');
        showFilter.theatre = { $in: theatres.map(t => t._id) };
      } else if (location) {
        const theatres = await Theatre.find({ location: new RegExp(escapeRegex(location), 'i') }).select('_id');
        showFilter.theatre = { $in: theatres.map(t => t._id) };
      }
    }

    const shows = await Show.find(deepTrust(showFilter))
      .populate('movie', 'title poster duration durationMinutes')
      .populate('theatre', 'name location address city cancellationAllowed cancellationFeePercent cancellationCutoffMinutes')
      .populate('screen', 'name screenNumber formatCapabilities capacity')
      .sort({ startsAt: 1, startTime: 1 });

    const now = new Date();
    const grouped = {};
    for (const show of shows) {
      const showStartDate = getShowStartDate(show);

      if (date) {
        const targetDateStr = String(date).split('T')[0];
        const showCalendarDate = getISTCalendarDateString(showStartDate);
        if (showCalendarDate && showCalendarDate !== targetDateStr) {
          continue;
        }
      }

      const bookable = isShowBookable(show, now);

      if (!includePast && !bookable) {
        continue;
      }

      const theatreId = show.theatre._id.toString();

      if (!grouped[theatreId]) {
        const tObj = show.theatre.toObject ? show.theatre.toObject() : show.theatre;
        grouped[theatreId] = {
          theatre: {
            ...tObj,
            cancellationAllowed: show.theatre.cancellationAllowed,
            cancellationFeePercent: show.theatre.cancellationFeePercent ?? 20,
            cancellationCutoffMinutes: show.theatre.cancellationCutoffMinutes ?? 120
          },
          shows: []
        };
      }

      const showSeatCount = await ShowSeat.countDocuments({ show: show._id, status: 'available' });
      let availableSeats;
      if (showSeatCount > 0 || await ShowSeat.exists({ show: show._id })) {
        availableSeats = showSeatCount;
      } else {
        const screenCapacity = show.screen?.capacity || 48;
        availableSeats = screenCapacity - (show.bookedSeats?.length || 0);
      }

      const cancellability = resolveShowCancellability({
        isCancellable: show.isCancellable,
        theatre: show.theatre
      });

      grouped[theatreId].shows.push({
        _id: show._id,
        startsAt: showStartDate.toISOString(),
        endsAt: show.endsAt || new Date(showStartDate.getTime() + 150 * 60 * 1000).toISOString(),
        startTime: show.startTime,
        date: show.date,
        format: show.format,
        language: show.language,
        screenName: show.screenName || show.screen?.name,
        screen: show.screen,
        pricing: show.pricing || show.seatPrices,
        seatPrices: show.seatPrices,
        availableSeats,
        isBookable: bookable,
        isCancellable: cancellability.isCancellable,
        cancellationFeePercent: cancellability.feePercent,
        cancellationCutoffMinutes: cancellability.cutoffMinutes
      });
    }

    return Object.values(grouped).filter(group => group.shows && group.shows.length > 0);
  }

  async findById(id, { includeSeats = false } = {}) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;

    const populateOptions = [
      'movie',
      {
        path: 'theatre',
        select: 'name location address city cancellationAllowed cancellationFeePercent cancellationCutoffMinutes'
      },
      'screen'
    ];

    const show = await Show.findById(id).populate(populateOptions);

    if (!show) return null;

    const cancellability = resolveShowCancellability(show);
    const startDate = getShowStartDate(show);
    const bookable = isShowBookable(show);

    const showObj = show.toObject ? show.toObject() : { ...show };
    showObj.startsAt = startDate;
    showObj.isExpired = !bookable;
    showObj.isBookable = bookable;
    showObj.isCancellable = cancellability.isCancellable;
    showObj.cancellationFeePercent = cancellability.feePercent;
    showObj.cancellationCutoffMinutes = cancellability.cutoffMinutes;

    if (includeSeats) {
      const showSeats = await ShowSeat.find({ show: show._id })
        .populate('seat', 'row number label type position')
        .sort({ label: 1 })
        .lean();

      if (showSeats.length === 0) {
        return { ...showObj, source: 'legacy', data: null };
      }

      return { ...showObj, source: 'v2', data: showSeats };
    }

    return showObj;
  }

  async create(data) {
    return Show.create(data);
  }

  async update(id, data) {
    return Show.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async delete(id, { hasConfirmedBookings = false } = {}) {
    if (hasConfirmedBookings) {
      throw new Error('Cannot delete show with confirmed bookings. Mark it as cancelled instead.');
    }

    const show = await Show.findByIdAndUpdate(
      id,
      { isActive: false, status: 'cancelled' },
      { new: true }
    );

    if (show) {
      await ShowSeat.updateMany(
        { show: show._id, status: 'available' },
        { $set: { status: 'blocked' } }
      );
    }

    return show;
  }

  async getAll({ isActive = true } = {}) {
    return Show.find({ isActive })
      .populate('movie', 'title')
      .populate('theatre', 'name location')
      .populate('screen', 'name screenNumber')
      .sort({ startsAt: -1, date: -1, startTime: 1 });
  }
}

module.exports = new ShowRepository();