const Booking = require('../models/Booking');
const Show = require('../models/Show');

// Helper: Generate booking ID
const generateBookingId = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `BK-${dateStr}-${rand}`;
};

// Helper: Generate mock transaction ID
const generateTransactionId = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `MOCK-${dateStr}-${rand}`;
};

// @desc    Create booking (with seat re-check)
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { showId, seatNumbers, paymentMethod, simulateFailure } = req.body;

    // Validate input
    if (!showId || !seatNumbers || !seatNumbers.length || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Show, seats, and payment method are required.'
      });
    }

    // Validate seat count (max 6)
    if (seatNumbers.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 6 seats can be booked at a time.'
      });
    }

    // Get the show
    const show = await Show.findById(showId)
      .populate('movie', 'title')
      .populate('theatre', 'name location');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.'
      });
    }

    if (!show.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This show is no longer active.'
      });
    }

    // ** CRITICAL: Re-check seat availability **
    const conflictingSeats = seatNumbers.filter(seat => show.bookedSeats.includes(seat));
    if (conflictingSeats.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Sorry, seat${conflictingSeats.length > 1 ? 's' : ''} ${conflictingSeats.join(', ')} ${conflictingSeats.length > 1 ? 'have' : 'has'} just been booked by another user. Please select seats again.`,
        conflictingSeats
      });
    }

    // Simulate payment failure if requested
    if (simulateFailure) {
      return res.status(402).json({
        success: false,
        message: 'Payment failed. Please try again.',
        bookingStatus: 'failed'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const convenienceFee = 20;
    seatNumbers.forEach(seat => {
      const row = seat.charAt(0);
      // Rows A-C are Regular, D-F are Premium
      if (['A', 'B', 'C'].includes(row)) {
        totalAmount += show.seatPrices.regular;
      } else {
        totalAmount += show.seatPrices.premium;
      }
    });
    totalAmount += convenienceFee;

    // Atomically mark seats as booked
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        bookedSeats: { $nin: seatNumbers } // double-check atomically
      },
      {
        $push: { bookedSeats: { $each: seatNumbers } }
      },
      { new: true }
    );

    if (!updatedShow) {
      return res.status(409).json({
        success: false,
        message: 'Some seats were just booked by another user. Please select seats again.'
      });
    }

    // Create booking record
    const booking = await Booking.create({
      bookingId: generateBookingId(),
      user: req.user._id,
      movie: show.movie._id,
      theatre: show.theatre._id,
      show: showId,
      screenName: show.screenName,
      seatNumbers,
      totalAmount,
      convenienceFee,
      paymentMethod,
      transactionId: generateTransactionId(),
      paymentStatus: 'paid',
      bookingStatus: 'confirmed'
    });

    // Populate the booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie', 'title poster')
      .populate('theatre', 'name location address')
      .populate('show', 'date startTime format screenName seatPrices');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed!',
      data: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title poster')
      .populate('theatre', 'name location address')
      .populate('show', 'date startTime format screenName')
      .sort({ createdAt: -1 });

    // Split into upcoming and past
    const now = new Date();
    const upcoming = [];
    const past = [];

    bookings.forEach(booking => {
      if (booking.show && new Date(booking.show.date) >= now) {
        upcoming.push(booking);
      } else {
        past.push(booking);
      }
    });

    res.json({
      success: true,
      data: { upcoming, past }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie', 'title poster genre language duration')
      .populate('theatre', 'name location address')
      .populate('show', 'date startTime format screenName seatPrices')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Security: Customers can only see their own bookings
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own bookings.'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
// @access  Admin
const getAllBookings = async (req, res) => {
  try {
    const { date, movieId, theatreId, status } = req.query;
    let filter = {};

    if (movieId) filter.movie = movieId;
    if (theatreId) filter.theatre = theatreId;
    if (status) filter.bookingStatus = status;

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('movie', 'title')
      .populate('theatre', 'name location')
      .populate('show', 'date startTime screenName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { createBooking, getUserBookings, getBookingById, getAllBookings };
