const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createEventBooking, getMyEventBookings } = require('../controllers/eventBookingController');

router.post('/',            protect, createEventBooking);
router.get('/my-bookings', protect, getMyEventBookings);

module.exports = router;
