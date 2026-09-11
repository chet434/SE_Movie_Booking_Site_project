const Theatre = require('../models/Theatre');

// @desc    Get all theatres (optionally by location)
// @route   GET /api/theatres
// @access  Public
const getAllTheatres = async (req, res) => {
  try {
    const { location } = req.query;
    let filter = {};
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    const theatres = await Theatre.find(filter).sort({ name: 1 });
    res.json({
      success: true,
      count: theatres.length,
      data: theatres
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single theatre
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.'
      });
    }
    res.json({
      success: true,
      data: theatre
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add a theatre
// @route   POST /api/theatres
// @access  Admin
const addTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({
      success: true,
      data: theatre
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a theatre
// @route   PUT /api/theatres/:id
// @access  Admin
const updateTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.'
      });
    }
    res.json({
      success: true,
      data: theatre
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a theatre
// @route   DELETE /api/theatres/:id
// @access  Admin
const deleteTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.'
      });
    }
    res.json({
      success: true,
      message: 'Theatre deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get distinct locations
// @route   GET /api/theatres/locations/list
// @access  Public
const getLocations = async (req, res) => {
  try {
    const locations = await Theatre.distinct('location');
    res.json({
      success: true,
      data: locations.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getAllTheatres, getTheatreById, addTheatre, updateTheatre, deleteTheatre, getLocations };
