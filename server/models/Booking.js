const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { // Legacy field
    type: String,
    unique: true,
    sparse: true
  },
  bookingNumber: { // New field
    type: String,
    unique: true,
    sparse: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  theatre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theatre',
    required: true
  },
  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show',
    required: true
  },
  screen: { // New field
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
  },
  screenName: { // Legacy field
    type: String,
  },
  seatNumbers: { // Legacy field
    type: [String],
  },
  seatsCount:     { type: Number }, // New field
  
  subtotal:       { type: Number }, // New field
  tax:            { type: Number, default: 0 }, // New field
  discount:       { type: Number, default: 0 }, // New field
  currency:       { type: String, default: 'INR' }, // New field

  totalAmount: {
    type: Number,
    required: true
  },
  convenienceFee: {
    type: Number,
    default: 20
  },
  paymentMethod: { // Legacy field
    type: String,
    enum: [
      'UPI',
      'Credit/Debit Card',
      'Net Banking',
      'Mobile Wallets',
      'Gift Voucher',
      'Pay Later',
      'Redeem Points',
      'Cash at Counter'
    ],
    default: 'UPI'
  },
  transactionId: { // Legacy field
    type: String,
  },
  
  // Historical snapshot — remains accurate even if theatre/movie changes later
  snapshot: { // New field
    movieTitle:     String,
    moviePoster:    String,
    theatreName:    String,
    theatreAddress: mongoose.Schema.Types.Mixed,
    screenName:     String,
    cityName:       String,
    startsAt:       Date,
    startTime:      String,
    format:         String,
    language:       String,
    posterUrl:      String
  },

  bookingSource: { type: String, enum: ['web', 'app', 'admin'], default: 'web' }, // New field

  confirmedAt:  Date, // New field
  cancelledAt:  Date, // New field
  
  paymentStatus: { // Updated enum
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  bookingStatus: { // Updated field, using status instead? Keeping bookingStatus for legacy, but add status
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'cancelled'],
    default: 'pending'
  },
  status: { // New field
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'failed', 'expired'],
    default: 'pending'
  },
}, {
  timestamps: true
});

// Index for user bookings query
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ show: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
