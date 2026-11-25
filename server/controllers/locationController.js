const City = require('../models/City');
const Location = require('../models/Location'); // Legacy fallback

// @desc    Get all locations/cities
// @route   GET /api/locations
// @access  Public
const getAllLocations = async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      count: cities.length,
      data: cities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add a location (legacy — prefer /api/cities)
// @route   POST /api/locations
// @access  Admin
const addLocation = async (req, res) => {
  try {
    const { name, state } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const city = await City.create({ name, state, slug });
    res.status(201).json({
      success: true,
      data: city
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getAllLocations, addLocation };
