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
  screenName: {
    type: String,
    required: [true, 'Screen name is required']
  },
  date: {
    type: Date,
    required: [true, 'Show date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  format: {
    type: String,
    enum: ['2D', '3D'],
    default: '2D'
  },
  seatPrices: {
    regular: {
      type: Number,
      default: 150
    },
    premium: {
      type: Number,
      default: 250
    }
  },
  bookedSeats: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for querying shows by movie, theatre, and date
showSchema.index({ movie: 1, theatre: 1, date: 1 });

module.exports = mongoose.model('Show', showSchema);
