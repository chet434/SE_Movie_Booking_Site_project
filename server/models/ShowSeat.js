const mongoose = require('mongoose');

const showSeatSchema = new mongoose.Schema({
  show:     { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  seat:     { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
  label:    { type: String, required: true },
  seatType: { type: String, enum: ['regular','premium','recliner','couple','wheelchair','vip'], required: true },
  price:    { type: Number, required: true },
  status: {
    type: String,
    enum: ['available', 'held', 'booked', 'blocked'],
    default: 'available'
  },
  hold: {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    expiresAt: { type: Date }
  },
  bookedAt: { type: Date }
}, { timestamps: true });

// MOST CRITICAL INDEX — enforces one ShowSeat per seat per show
showSeatSchema.index({ show: 1, seat: 1 }, { unique: true });
// Fast availability lookup
showSeatSchema.index({ show: 1, status: 1 });

module.exports = mongoose.model('ShowSeat', showSeatSchema);
