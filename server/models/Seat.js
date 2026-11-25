const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  screen: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true },
  row: { type: String, required: true },     // "A", "B", etc.
  number: { type: Number, required: true },  // 1, 2, 3...
  label: { type: String, required: true },   // "A1", "A2"
  type: {
    type: String,
    enum: ['regular', 'premium', 'recliner', 'couple', 'wheelchair', 'vip'],
    default: 'regular'
  },
  position: {
    row: Number,   // visual row index for seat map rendering
    col: Number    // visual col index
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

seatSchema.index({ screen: 1, label: 1 }, { unique: true });
seatSchema.index({ screen: 1, isActive: 1 });

module.exports = mongoose.model('Seat', seatSchema);
