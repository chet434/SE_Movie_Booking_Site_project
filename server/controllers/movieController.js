const Movie = require('../models/Movie');

// @desc    Get all active movies (with search & filter)
// @route   GET /api/movies
// @access  Public
const getAllMovies = async (req, res) => {
  try {
    const { search, genre, language, status } = req.query;
    let filter = {};

    // Default: only show active movies for public
    if (!status) {
      filter.status = { $in: ['now-showing', 'coming-soon'] };
    } else {
      filter.status = status;
    }

    // Search by title (case-insensitive)
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // Filter by genre
    if (genre) {
      filter.genre = { $in: genre.split(',') };
    }

    // Filter by language
    if (language) {
      filter.language = language;
    }

    const movies = await Movie.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.'
      });
    }
    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add a movie
// @route   POST /api/movies
// @access  Admin
const addMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Admin
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.'
      });
    }
    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete (soft) a movie
// @route   DELETE /api/movies/:id
// @access  Admin
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.'
      });
    }
    res.json({
      success: true,
      message: 'Movie marked as inactive.',
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getAllMovies, getMovieById, addMovie, updateMovie, deleteMovie };
