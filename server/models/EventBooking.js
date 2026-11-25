const mongoose = require('mongoose');

const eventBookingItemSchema = new mongoose.Schema(
  {
    tierId:   { type: String, required: true },
    name:     { type: String, required: true },
    price:    { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const eventBookingSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true
    },
    passCode: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true
    },
    eventId:    { type: String, required: true },
    eventTitle: { type: String, required: true, trim: true },
    poster:     { type: String, default: '' },
    venue:      { type: String, required: true, trim: true },
    dateFull:   { type: String, required: true },
    time:       { type: String, required: true },
    items:      { type: [eventBookingItemSchema], required: true },
    totalPasses:  { type: Number, required: true, min: 1 },
    subtotal:     { type: Number, required: true, min: 0 },
    bookingFee:   { type: Number, default: 0, min: 0 },
    totalAmount:  { type: Number, required: true, min: 0 },
    paymentMethod: {
      type:    String,
      default: 'UPI',
      trim:    true
    },
    attendee: {
      name:  { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    status: {
      type:    String,
      enum:    ['confirmed', 'cancelled'],
      default: 'confirmed'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventBooking', eventBookingSchema);
