const movieRepo = require('../repositories/MovieRepository');

// Helper: generate URL slug from title
const generateSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// @desc    Get all active movies (with search, filter, and city-based filtering)
// @route   GET /api/movies
// @access  Public
const getAllMovies = async (req, res, next) => {
  try {
    const { search, genre, genres, language, languages, format, formats, status, location, city, cityId } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const result = await movieRepo.findAll({
      search,
      genre: genre || genres,
      language: language || languages,
      format: format || formats,
      status,
      location: location || city,
      cityId,
      skip,
      limit
    });

    res.json({
      success: true,
      meta: result.meta,
      data: result.movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available dynamic movie filters
// @route   GET /api/movies/filters
// @access  Public
const getMovieFilters = async (req, res, next) => {
  try {
    const { location, city, cityId } = req.query;
    const filters = await movieRepo.getAvailableFilters({ location: location || city, cityId });
    res.json({
      success: true,
      data: filters
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await movieRepo.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }
    res.json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a movie
// @route   POST /api/movies
// @access  Admin
const addMovie = async (req, res, next) => {
  try {
    const data = { ...req.body };

    if (!data.slug && data.title) {
      data.slug = generateSlug(data.title);
    }

    if (data.genre && !data.genres) data.genres = data.genre;
    if (data.genres && !data.genre) data.genre = data.genres;
    if (data.language && !data.languages) data.languages = [data.language];

    if (data.duration && !data.durationMinutes) {
      const match = data.duration.match(/(\d+)h\s*(\d+)?m?/);
      if (match) {
        data.durationMinutes = parseInt(match[1]) * 60 + (parseInt(match[2]) || 0);
      }
    }

    const movie = await movieRepo.create(data);
    res.status(201).json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Admin
const updateMovie = async (req, res, next) => {
  try {
    const data = { ...req.body };

    if (data.genre && !data.genres) data.genres = data.genre;
    if (data.genres && !data.genre) data.genre = data.genres;
    if (data.language && !data.languages) data.languages = [data.language];

    const movie = await movieRepo.update(req.params.id, data);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }
    res.json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft-delete a movie
// @route   DELETE /api/movies/:id
// @access  Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await movieRepo.softDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }
    res.json({ success: true, message: 'Movie marked as ended.', data: movie });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllMovies, getMovieFilters, getMovieById, addMovie, updateMovie, deleteMovie };