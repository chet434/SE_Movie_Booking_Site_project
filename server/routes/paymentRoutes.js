const express = require('express');
const router = express.Router();
const { createOrder, handleWebhook, getPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, createOrder);
router.post('/webhook', handleWebhook);       // Public: called by payment provider
router.get('/:bookingId', protect, getPayment);

module.exports = router;
