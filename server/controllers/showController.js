const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const Booking = require('../models/Booking');

// @desc    Get shows by movie (grouped by theatre)
// @route   GET /api/shows?movieId=&location=&date=
// @access  Public
const getShowsByMovie = async (req, res) => {
  try {
    const { movieId, location, date } = req.query;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required.'
      });
    }

    // Build show filter
    let showFilter = { movie: movieId, isActive: true };

    if (date) {
      const showDate = new Date(date);
      showDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(showDate);
      nextDay.setDate(nextDay.getDate() + 1);
      showFilter.date = { $gte: showDate, $lt: nextDay };
    }

    // If location is provided, first get theatres in that location
    let theatreFilter = {};
    if (location) {
      theatreFilter.location = { $regex: location, $options: 'i' };
    }

    const theatres = await Theatre.find(theatreFilter);
    const theatreIds = theatres.map(t => t._id);

    if (location) {
      showFilter.theatre = { $in: theatreIds };
    }

    const shows = await Show.find(showFilter)
      .populate('movie', 'title poster duration')
      .populate('theatre', 'name location address')
      .sort({ startTime: 1 });

    // Group shows by theatre
    const grouped = {};
    shows.forEach(show => {
      const theatreId = show.theatre._id.toString();
      if (!grouped[theatreId]) {
        grouped[theatreId] = {
          theatre: show.theatre,
          shows: []
        };
      }
      grouped[theatreId].shows.push({
        _id: show._id,
        startTime: show.startTime,
        format: show.format,
        screenName: show.screenName,
        seatPrices: show.seatPrices,
        availableSeats: 48 - show.bookedSeats.length,
        date: show.date
      });
    });

    res.json({
      success: true,
      data: Object.values(grouped)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single show with seat details
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie', 'title poster duration genre language rating')
      .populate('theatre', 'name location address screens');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.'
      });
    }

    res.json({
      success: true,
      data: show
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a show
// @route   POST /api/shows
// @access  Admin
const addShow = async (req, res) => {
  try {
    const { movie, theatre, screenName, date, startTime, format, seatPrices } = req.body;

    // Check for overlapping shows on same screen
    const showDate = new Date(date);
    showDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(showDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const overlap = await Show.findOne({
      theatre,
      screenName,
      date: { $gte: showDate, $lt: nextDay },
      startTime,
      isActive: true
    });

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: 'A show already exists on this screen at this time.'
      });
    }

    const show = await Show.create({
      movie,
      theatre,
      screenName,
      date: showDate,
      startTime,
      format: format || '2D',
      seatPrices: seatPrices || { regular: 150, premium: 250 }
    });

    res.status(201).json({
      success: true,
      data: show
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a show
// @route   PUT /api/shows/:id
// @access  Admin
const updateShow = async (req, res) => {
  try {
    // Check if bookings exist
    const bookingCount = await Booking.countDocuments({ show: req.params.id, bookingStatus: 'confirmed' });
    if (bookingCount > 0) {
      // Only allow safe edits
      const safeFields = ['seatPrices', 'isActive'];
      const updateKeys = Object.keys(req.body);
      const unsafeUpdate = updateKeys.some(key => !safeFields.includes(key));
      if (unsafeUpdate) {
        return res.status(400).json({
          success: false,
          message: 'Cannot modify show details after tickets have been booked. Only prices and status can be changed.'
        });
      }
    }

    const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.'
      });
    }

    res.json({
      success: true,
      data: show
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a show
// @route   DELETE /api/shows/:id
// @access  Admin
const deleteShow = async (req, res) => {
  try {
    const bookingCount = await Booking.countDocuments({ show: req.params.id, bookingStatus: 'confirmed' });
    if (bookingCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete show with confirmed bookings. Mark it as inactive instead.'
      });
    }

    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.'
      });
    }

    res.json({
      success: true,
      message: 'Show deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all shows (admin)
// @route   GET /api/shows/admin/all
// @access  Admin
const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate('movie', 'title')
      .populate('theatre', 'name location')
      .sort({ date: -1, startTime: 1 });

    res.json({
      success: true,
      count: shows.length,
      data: shows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getShowsByMovie, getShowById, addShow, updateShow, deleteShow, getAllShows };
