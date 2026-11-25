const express = require('express');
const router = express.Router();
const {
  holdSeats, confirmBooking, cancelBooking,
  createBooking,
  getUserBookings, getBookingById, getAllBookings
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { deprecated } = require('../middleware/deprecation');
const {
  holdSeatsSchema,
  confirmBookingSchema,
  createBookingSchema,
} = require('../schemas/bookingSchemas');

// V2 endpoints
router.post('/hold', validate({ body: holdSeatsSchema }), protect, holdSeats);
router.post('/confirm', validate({ body: confirmBookingSchema }), protect, confirmBooking);

// Shared — must be before /:id
router.get('/my-bookings', protect, getUserBookings);
router.get('/all', protect, adminOnly, getAllBookings);

// Legacy / single-step booking (backward compat)
// @deprecated v2.0.0 - Use two-phase flow: POST /hold then POST /confirm
router.post('/', deprecated('Use POST /hold + POST /confirm for two-phase booking', '2.0.0', '3.0.0'), validate({ body: createBookingSchema }), protect, createBooking);

// Per-booking routes
router.get('/:id', protect, getBookingById);
router.post('/:id/cancel', protect, cancelBooking);

module.exports = router;
