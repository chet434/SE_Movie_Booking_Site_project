const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie is required']
  },
  theatre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theatre',
    required: [true, 'Theatre is required']
  },
  screen: { // New field
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
  },
  screenName: { // Legacy field
    type: String,
  },
  date: { // Legacy field
    type: Date,
  },
  startTime: { // Legacy field
    type: String,
  },
  startsAt: { type: Date }, // New field
  endsAt:   { type: Date }, // New field
  format: {
    type: String,
    enum: ['2D', '3D', '4DX', 'IMAX', 'IMAX_3D'],
    default: '2D'
  },
  language: { type: String }, // New field
  pricing: { // New field
    regular:    { type: Number, default: 150 },
    premium:    { type: Number, default: 250 },
    recliner:   { type: Number, default: 400 },
    vip:        { type: Number, default: 600 }
  },
  seatPrices: { // Legacy field
    regular: {
      type: Number,
      default: 150
    },
    premium: {
      type: Number,
      default: 250
    }
  },
  bookedSeats: { // Legacy field
    type: [String],
    default: []
  },
  status: { // New field
    type: String,
    enum: ['scheduled', 'now_showing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for querying shows by movie, theatre, and date
showSchema.index({ movie: 1, theatre: 1, date: 1 }); // Legacy index
showSchema.index({ movie: 1, startsAt: 1 });
showSchema.index({ screen: 1, startsAt: 1 });
showSchema.index({ theatre: 1, startsAt: 1 });
showSchema.index({ movie: 1, theatre: 1, startsAt: 1 });
showSchema.index({ status: 1, isActive: 1 });

module.exports = mongoose.model('Show', showSchema);
