const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  movie:   { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  rating:  { type: Number, required: true, min: 1, max: 10 },
  title:   { type: String, maxlength: 100 },
  comment: { type: String, maxlength: 1000 },
  isVerifiedBooking: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

// One review per user per movie
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });
reviewSchema.index({ movie: 1, isPublished: 1, createdAt: -1 });

// Update Movie.avgRating after save/delete
reviewSchema.post('save', async function () {
  const Movie = require('./Movie');
  const stats = await this.constructor.aggregate([
    { $match: { movie: this.movie } },
    { $group: { _id: '$movie', avg: { $avg: '$rating' } } }
  ]);
  await Movie.findByIdAndUpdate(this.movie, {
    avgRating: stats[0]?.avg?.toFixed(1) || 0
  });
});

module.exports = mongoose.model('Review', reviewSchema);
