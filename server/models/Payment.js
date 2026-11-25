const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },

  provider: { type: String, enum: ['razorpay','stripe','payu','cashfree','mock'], required: true },
  orderId:   { type: String, required: true },
  paymentId: { type: String },

  amount:   { type: Number, required: true },
  currency: { type: String, default: 'INR' },

  status: {
    type: String,
    enum: ['created', 'pending', 'paid', 'failed', 'refunded'],
    default: 'created'
  },
  method: { type: String },  // 'upi', 'card', 'netbanking', 'wallet'
  failureReason: String,
  paidAt: Date
}, { timestamps: true });

paymentSchema.index({ booking: 1 });
paymentSchema.index({ orderId: 1 }, { unique: true });
paymentSchema.index({ paymentId: 1 }, { sparse: true, unique: true });
paymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
