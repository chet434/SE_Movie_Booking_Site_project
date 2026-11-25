const mongoose = require('mongoose');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const City = require('../models/City');
const ShowSeat = require('../models/ShowSeat');
const { escapeRegex } = require('../utils/escapeRegex');
const { deepTrust } = require('../utils/deepTrust');

class ShowRepository {
  async findByMovie({ movieId, cityId, location, date, isActive = true } = {}) {
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
      const showDate = new Date(date);
      showDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(showDate);
      nextDay.setDate(nextDay.getDate() + 1);
      showFilter.$or = [
        { startsAt: { $gte: showDate, $lt: nextDay } },
        { date: { $gte: showDate, $lt: nextDay } }
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
      .populate('theatre', 'name location address city')
      .populate('screen', 'name screenNumber formatCapabilities capacity')
      .sort({ startsAt: 1, startTime: 1 });

    const grouped = {};
    for (const show of shows) {
      const theatreId = show.theatre._id.toString();

      if (!grouped[theatreId]) {
        grouped[theatreId] = { theatre: show.theatre, shows: [] };
      }

      const showSeatCount = await ShowSeat.countDocuments({ show: show._id, status: 'available' });
      let availableSeats;
      if (showSeatCount > 0 || await ShowSeat.exists({ show: show._id })) {
        availableSeats = showSeatCount;
      } else {
        const screenCapacity = show.screen?.capacity || 48;
        availableSeats = screenCapacity - (show.bookedSeats?.length || 0);
      }

      grouped[theatreId].shows.push({
        _id: show._id,
        startsAt: show.startsAt,
        endsAt: show.endsAt,
        startTime: show.startTime,
        date: show.date,
        format: show.format,
        language: show.language,
        screenName: show.screenName || show.screen?.name,
        screen: show.screen,
        pricing: show.pricing || show.seatPrices,
        seatPrices: show.seatPrices,
        availableSeats
      });
    }

    return Object.values(grouped);
  }

  async findById(id, { includeSeats = false } = {}) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;

    const populateOptions = [
      'movie',
      'theatre',
      'screen'
    ];

    const show = await Show.findById(id).populate(populateOptions);

    if (!show) return null;

    if (includeSeats) {
      const showSeats = await ShowSeat.find({ show: show._id })
        .populate('seat', 'row number label type position')
        .sort({ label: 1 })
        .lean();

      if (showSeats.length === 0) {
        return { ...show.toObject(), source: 'legacy', data: null };
      }

      return { ...show.toObject(), source: 'v2', data: showSeats };
    }

    return show;
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