const showRepo = require('../repositories/ShowRepository');
const Show = require('../models/Show');
const ShowSeat = require('../models/ShowSeat');
const Movie = require('../models/Movie');
const Screen = require('../models/Screen');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

// Helper: release expired holds for a show before returning seat map
const releaseExpiredHolds = async (showId) => {
  const ShowSeat = require('../models/ShowSeat');
  const { deepTrust } = require('../utils/deepTrust');
  await ShowSeat.updateMany(
    deepTrust({
      show: showId,
      status: 'held',
      'hold.expiresAt': { $lt: new Date() }
    }),
    {
      $set: { status: 'available' },
      $unset: { hold: '' }
    }
  );
};

// Helper: generate ShowSeat docs for all seats in a screen for a new show
const createShowSeats = async (show, screen) => {
  const ShowSeat = require('../models/ShowSeat');
  const pricing = show.pricing || show.seatPrices || {};

  const seats = await Seat.find({ screen: screen._id, isActive: true });

  const showSeats = seats.map(seat => ({
    show: show._id,
    seat: seat._id,
    label: seat.label,
    seatType: seat.type || 'regular',
    price: pricing[seat.type] || pricing.regular || 150,
    status: 'available'
  }));

  if (showSeats.length > 0) {
    await ShowSeat.insertMany(showSeats, { ordered: false }).catch(() => {});
  }
};

// @desc    Get shows by movie (grouped by theatre)
// @route   GET /api/shows?movieId=&cityId=&location=&date=
// @access  Public
const getShowsByMovie = async (req, res, next) => {
  try {
    const { movieId, cityId, location, date } = req.query;

    const groupedShows = await showRepo.findByMovie({
      movieId, cityId, location, date
    });

    res.json({ success: true, data: groupedShows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single show details
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res, next) => {
  try {
    const show = await showRepo.findById(req.params.id);

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found.' });
    }

    res.json({ success: true, data: show });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seat map for a show (NEW V2 endpoint)
// @route   GET /api/shows/:id/seats
// @access  Public
const getShowSeats = async (req, res, next) => {
  try {
    const result = await showRepo.findById(req.params.id, { includeSeats: true });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Show not found.' });
    }

    if (result.source === 'legacy' || !result.data) {
      const legacySeats = [];
      const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
      const seatsPerRow = 8;
      const show = result;

      rows.forEach((row, rIdx) => {
        for (let c = 1; c <= seatsPerRow; c++) {
          const label = `${row}${c}`;
          legacySeats.push({
            label,
            seatType: rIdx >= 4 ? 'premium' : 'regular',
            price: rIdx >= 4 ? (show.seatPrices?.premium || 250) : (show.seatPrices?.regular || 150),
            status: show.bookedSeats?.includes(label) ? 'booked' : 'available',
            position: { row: rIdx, col: c - 1 }
          });
        }
      });

      return res.json({ success: true, source: 'legacy', data: legacySeats });
    }

    res.json({ success: true, source: 'v2', data: result.data });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a show (and auto-generate ShowSeats)
// @route   POST /api/shows
// @access  Admin
const addShow = async (req, res, next) => {
  try {
    const {
      movie, theatre, screenId, screenName,
      startsAt, endsAt, date, startTime,
      format, language, pricing, seatPrices
    } = req.body;

    let resolvedScreen = null;
    if (screenId) {
      resolvedScreen = await Screen.findById(screenId);
    } else if (screenName && theatre) {
      resolvedScreen = await Screen.findOne({ theatre, name: screenName });
    }

    let resolvedStartsAt = startsAt ? new Date(startsAt) : null;
    let resolvedEndsAt = endsAt ? new Date(endsAt) : null;

    if (!resolvedStartsAt && date && startTime) {
      const d = new Date(date);
      const timeMatch = startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeMatch) {
        let hrs = parseInt(timeMatch[1]);
        const mins = parseInt(timeMatch[2]);
        const ampm = timeMatch[3]?.toUpperCase();
        if (ampm === 'PM' && hrs < 12) hrs += 12;
        if (ampm === 'AM' && hrs === 12) hrs = 0;
        d.setHours(hrs, mins, 0, 0);
        resolvedStartsAt = d;
      }
    }

    // Check for overlaps
    if (resolvedScreen && resolvedStartsAt && resolvedEndsAt) {
      const overlap = await Show.findOne({
        screen: resolvedScreen._id,
        isActive: true,
        startsAt: { $lt: resolvedEndsAt },
        endsAt: { $gt: resolvedStartsAt }
      });
      if (overlap) {
        return res.status(400).json({
          success: false,
          message: `Screen is already booked from ${overlap.startsAt} to ${overlap.endsAt}.`
        });
      }
    } else if (!resolvedStartsAt) {
      if (screenName && theatre && startTime) {
        const showDate = new Date(date);
        showDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(showDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const overlap = await Show.findOne({
          theatre, screenName, date: { $gte: showDate, $lt: nextDay }, startTime, isActive: true
        });
        if (overlap) {
          return res.status(400).json({
            success: false, message: 'A show already exists on this screen at this time.'
          });
        }
      }
    }

    const show = await showRepo.create({
      movie,
      theatre,
      screen: resolvedScreen?._id,
      screenName: screenName || resolvedScreen?.name,
      startsAt: resolvedStartsAt,
      endsAt: resolvedEndsAt,
      date: date ? new Date(date) : resolvedStartsAt,
      startTime,
      format: format || '2D',
      language: language || 'Hindi',
      pricing: pricing || seatPrices || { regular: 150, premium: 250 },
      seatPrices: seatPrices || pricing || { regular: 150, premium: 250 },
      status: 'scheduled'
    });

    if (resolvedScreen) {
      await createShowSeats(show, resolvedScreen);
    }

    res.status(201).json({ success: true, data: show });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a show
// @route   PUT /api/shows/:id
// @access  Admin
const updateShow = async (req, res, next) => {
  try {
    const bookingCount = await Booking.countDocuments({ show: req.params.id, bookingStatus: 'confirmed' });
    if (bookingCount > 0) {
      const safeFields = ['seatPrices', 'pricing', 'isActive', 'status'];
      const unsafeUpdate = Object.keys(req.body).some(k => !safeFields.includes(k));
      if (unsafeUpdate) {
        return res.status(400).json({
          success: false,
          message: 'Cannot modify show details after tickets have been booked. Only prices and status can be changed.'
        });
      }
    }

    const show = await showRepo.update(req.params.id, req.body);

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found.' });
    }

    if (req.body.pricing || req.body.seatPrices) {
      const newPricing = req.body.pricing || req.body.seatPrices;
      const seats = await Seat.find({ screen: show.screen });
      for (const seat of seats) {
        const newPrice = newPricing[seat.type] || newPricing.regular || 150;
        const ShowSeat = require('../models/ShowSeat');
        await ShowSeat.updateMany(
          { show: show._id, seat: seat._id, status: 'available' },
          { $set: { price: newPrice } }
        );
      }
    }

    res.json({ success: true, data: show });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel/soft-delete a show
// @route   DELETE /api/shows/:id
// @access  Admin
const deleteShow = async (req, res, next) => {
  try {
    const bookingCount = await Booking.countDocuments({ show: req.params.id, bookingStatus: 'confirmed' });

    const show = await showRepo.delete(req.params.id, { hasConfirmedBookings: bookingCount > 0 });

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found.' });
    }

    res.json({ success: true, message: 'Show cancelled successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all shows (admin)
// @route   GET /api/shows/admin/all
// @access  Admin
const getAllShows = async (req, res, next) => {
  try {
    const shows = await showRepo.getAll();

    res.json({ success: true, count: shows.length, data: shows });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShowsByMovie, getShowById, getShowSeats,
  addShow, updateShow, deleteShow, getAllShows
};