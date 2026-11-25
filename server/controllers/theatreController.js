const theatreRepo = require('../repositories/TheatreRepository');

// @desc    Get all theatres (filter by cityId or legacy location string)
// @route   GET /api/theatres
// @access  Public
const getAllTheatres = async (req, res, next) => {
  try {
    const { cityId, location } = req.query;
    const theatres = await theatreRepo.findAll({ cityId, location });

    res.json({
      success: true,
      count: theatres.length,
      data: theatres
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single theatre with its screens
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await theatreRepo.findById(req.params.id, { includeScreens: true });
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found.' });
    }

    res.json({
      success: true,
      data: theatre
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a theatre
// @route   POST /api/theatres
// @access  Admin
const addTheatre = async (req, res, next) => {
  try {
    const { name, cityId, location, address, amenities } = req.body;

    let resolvedCityId = cityId;
    if (!resolvedCityId && location) {
      const city = await theatreRepo.findCities({ isActive: true }).then(cities =>
        cities.find(c => c.name.toLowerCase() === location.toLowerCase())
      );
      resolvedCityId = city?._id;
    }

    const theatre = await theatreRepo.create({
      name,
      city: resolvedCityId,
      location: location || '',
      address: typeof address === 'string' ? { line1: address } : address,
      amenities: amenities || []
    });

    res.status(201).json({ success: true, data: theatre });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a theatre
// @route   PUT /api/theatres/:id
// @access  Admin
const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await theatreRepo.update(req.params.id, req.body);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found.' });
    }

    res.json({ success: true, data: theatre });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft-delete a theatre
// @route   DELETE /api/theatres/:id
// @access  Admin
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await theatreRepo.deactivate(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found.' });
    }

    res.json({ success: true, message: 'Theatre deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get distinct locations (legacy endpoint)
// @route   GET /api/theatres/locations/list
// @access  Public
const getLocations = async (req, res, next) => {
  try {
    const cities = await theatreRepo.findCities();
    res.json({ success: true, data: cities.map(c => c.name) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTheatres, getTheatreById, addTheatre, updateTheatre, deleteTheatre, getLocations };