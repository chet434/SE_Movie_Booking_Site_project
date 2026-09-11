const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true
  },
  poster: {
    type: String,
    required: [true, 'Movie poster URL is required']
  },
  description: {
    type: String,
    required: [true, 'Movie description is required']
  },
  genre: {
    type: [String],
    required: [true, 'At least one genre is required']
  },
  language: {
    type: String,
    required: [true, 'Language is required']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  releaseDate: {
    type: Date,
    required: [true, 'Release date is required']
  },
  trailerUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['now-showing', 'coming-soon', 'inactive'],
    default: 'now-showing'
  }
}, {
  timestamps: true
});

// Text index for search
movieSchema.index({ title: 'text' }, { language_override: 'dummyLanguageOverride' });

module.exports = mongoose.model('Movie', movieSchema);
