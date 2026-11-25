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
  location: { // Legacy field, kept for backward compatibility
    type: String,
    trim: true
  },
  city: { // New field
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City'
  },
  address: {
    type: mongoose.Schema.Types.Mixed, // Change to Mixed so it accepts both string and new object structure
    required: [true, 'Address is required']
  },
  coordinates: { // New field
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number], default: undefined }
  },
  amenities: [{ type: String }], // New field
  cancellationAllowed: { type: Boolean, default: true },
  cancellationFeePercent: { type: Number, default: 20, min: 0, max: 100 },
  cancellationCutoffMinutes: { type: Number, default: 120 },
  screens: [screenSchema], // Legacy embedded screens
  isActive: { type: Boolean, default: true } // New field
}, {
  timestamps: true
});

theatreSchema.index({ city: 1, isActive: 1 });
theatreSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Theatre', theatreSchema);
