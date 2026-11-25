const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
  name: { type: String, required: true },
  screenNumber: { type: Number, required: true },
  formatCapabilities: {
    type: [String],
    enum: ['2D', '3D', '4DX', 'IMAX', 'IMAX_3D'],
    default: ['2D']
  },
  capacity: { type: Number, default: 0 },  // Updated when seats are created
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

screenSchema.index({ theatre: 1, screenNumber: 1 }, { unique: true });
screenSchema.index({ theatre: 1, isActive: 1 });

module.exports = mongoose.model('Screen', screenSchema);
