const mongoose = require('mongoose');

const bookingSeatSchema = new mongoose.Schema({
  booking:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking',  required: true },
  showSeat: { type: mongoose.Schema.Types.ObjectId, ref: 'ShowSeat', required: true },
  seatLabel: { type: String, required: true },
  seatType:  { type: String, required: true },
  price:     { type: Number, required: true }
}, { timestamps: true });

bookingSeatSchema.index({ booking: 1 });
bookingSeatSchema.index({ showSeat: 1 }, { unique: true }); // One booking per seat per show

module.exports = mongoose.model('BookingSeat', bookingSeatSchema);
