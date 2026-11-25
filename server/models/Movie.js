const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true
  },
  slug: { type: String, unique: true, lowercase: true, sparse: true }, // New field
  poster: {
    type: String,
    required: [true, 'Movie poster URL is required']
  },
  backdrop: String, // New field
  description: {
    type: String,
    required: [true, 'Movie description is required']
  },
  genre: { // Legacy field, keeping as array of strings
    type: [String],
    required: [true, 'At least one genre is required']
  },
  genres: [{ type: String }], // New field
  language: { // Legacy field
    type: String,
  },
  languages: [{ type: String }], // New field
  formats: [{ type: String }], // e.g. ['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX']
  duration: { // Legacy field
    type: String,
  },
  durationMinutes: { type: Number }, // New field
  certification: { type: String, default: 'UA' }, // Censor rating e.g. U, UA, UA16+, A
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  avgRating: { type: Number, default: 0, min: 0, max: 10 }, // New field
  votes: { type: String, default: '' },
  likes: { type: String, default: '' },
  isReRelease: { type: Boolean, default: false },
  releaseDate: {
    type: Date,
    required: [true, 'Release date is required']
  },
  trailerUrl: {
    type: String,
    default: ''
  },
  cast: [{ name: String, role: String, photo: String }], // New field
  crew: [{ name: String, role: String }], // New field
  status: {
    type: String,
    enum: ['now-showing', 'coming-soon', 'inactive', 'now_showing', 'coming_soon', 'ended'],
    default: 'now-showing' // using legacy default for now
  },
  isActive: { type: Boolean, default: true } // New field
}, {
  timestamps: true
});

// Text index for search
movieSchema.index({ title: 'text' }, { language_override: 'dummyLanguageOverride' });
movieSchema.index({ status: 1, isActive: 1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ languages: 1 });

module.exports = mongoose.model('Movie', movieSchema);
