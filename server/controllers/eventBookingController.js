const EventBooking = require('../models/EventBooking');

/**
 * Generate a unique passCode in the format CB-XXXXXX
 * (6 uppercase alphanumeric characters)
 */
const generatePassCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'CB-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * @desc    Create a new live event booking
 * @route   POST /api/event-bookings
 * @access  Private
 */
const createEventBooking = async (req, res) => {
  try {
    const {
      eventId,
      eventTitle,
      poster,
      venue,
      dateFull,
      time,
      items,
      totalPasses,
      subtotal,
      bookingFee,
      totalAmount,
      paymentMethod,
      attendee
    } = req.body;

    // Basic validation
    if (!eventId || !eventTitle || !venue || !dateFull || !time || !items || !totalPasses || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking fields'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one ticket tier is required'
      });
    }

    // Generate a unique passCode (retry up to 5 times on collision)
    let passCode;
    let attempts = 0;
    while (attempts < 5) {
      passCode = generatePassCode();
      const exists = await EventBooking.findOne({ passCode });
      if (!exists) break;
      attempts++;
    }

    if (!passCode) {
      return res.status(500).json({
        success: false,
        message: 'Could not generate a unique pass code. Please try again.'
      });
    }

    const booking = await EventBooking.create({
      user:          req.user._id,
      passCode,
      eventId,
      eventTitle,
      poster:        poster || '',
      venue,
      dateFull,
      time,
      items,
      totalPasses,
      subtotal,
      bookingFee:    bookingFee || 0,
      totalAmount,
      paymentMethod: paymentMethod || 'UPI',
      attendee:      attendee || {},
      status:        'confirmed'
    });

    return res.status(201).json({
      success: true,
      data:    booking
    });
  } catch (error) {
    console.error('createEventBooking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating event booking'
    });
  }
};

/**
 * @desc    Get all live event bookings for the authenticated user
 * @route   GET /api/event-bookings/my-bookings
 * @access  Private
 */
const getMyEventBookings = async (req, res) => {
  try {
    const bookings = await EventBooking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data:    bookings
    });
  } catch (error) {
    console.error('getMyEventBookings error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching event bookings'
    });
  }
};

module.exports = { createEventBooking, getMyEventBookings };
