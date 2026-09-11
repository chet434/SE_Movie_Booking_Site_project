const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  screenName: {
    type: String,
    required: true
  },
  totalSeats: {
    type: Number,
    default: 48 // 6 rows × 8 seats
  },
  rows: {
    type: Number,
    default: 6
  },
  seatsPerRow: {
    type: Number,
    default: 8
  }
});

const theatreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Theatre name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location/city is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  screens: [screenSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Theatre', theatreSchema);
