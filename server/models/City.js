const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  state: { type: String, trim: true },
  country: { type: String, default: 'India' },
  slug: { type: String, required: true, unique: true, lowercase: true },
  timezone: { type: String, default: 'Asia/Kolkata' },
  coordinates: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number], default: undefined }  // [longitude, latitude]
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

citySchema.index({ coordinates: '2dsphere' });
citySchema.index({ name: 'text' });

module.exports = mongoose.model('City', citySchema);
