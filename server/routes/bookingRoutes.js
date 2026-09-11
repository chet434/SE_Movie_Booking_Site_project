const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getBookingById, getAllBookings } = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

// User routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);

// Admin routes (must be before /:id)
router.get('/all', protect, adminOnly, getAllBookings);

// Shared route
router.get('/:id', protect, getBookingById);

module.exports = router;
