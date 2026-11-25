const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Create a mock payment order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Booking is not in pending state.' });
    }

    const orderId = `MOCK-ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      provider: 'mock',
      orderId,
      amount: booking.totalAmount,
      status: 'created'
    });

    res.json({
      success: true,
      data: {
        orderId: payment.orderId,
        amount: payment.amount,
        currency: 'INR',
        paymentId: payment._id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Handle payment webhook (mock — production: verify HMAC signature)
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  try {
    const { orderId, paymentId, status } = req.body;

    // Idempotency: check if already processed
    const payment = await Payment.findOne({ orderId });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    if (payment.status === 'paid') {
      return res.json({ success: true, message: 'Already processed.' }); // idempotent
    }

    if (status === 'paid' || status === 'captured') {
      await Payment.findByIdAndUpdate(payment._id, {
        paymentId,
        status: 'paid',
        paidAt: new Date()
      });
      // NOTE: full confirmation (booking + showSeat update) done via /api/bookings/confirm
    } else {
      await Payment.findByIdAndUpdate(payment._id, { status: 'failed', failureReason: req.body.reason });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment for a booking
// @route   GET /api/payments/:bookingId
// @access  Private
const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId }).populate('booking');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    if (payment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, handleWebhook, getPayment };
