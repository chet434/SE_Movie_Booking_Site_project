const City = require('../models/City');

// Haversine distance formula in kilometers
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Common city aliases map
const CITY_ALIASES = {
  bangalore: 'Bengaluru',
  'new delhi': 'Delhi-NCR',
  delhi: 'Delhi-NCR',
  noida: 'Delhi-NCR',
  gurugram: 'Delhi-NCR',
  gurgaon: 'Delhi-NCR',
  ghaziabad: 'Delhi-NCR',
  faridabad: 'Delhi-NCR',
  'greater noida': 'Delhi-NCR',
  'navi mumbai': 'Mumbai',
  thane: 'Mumbai',
  kalyan: 'Mumbai',
  calcutta: 'Kolkata',
  madras: 'Chennai',
  cochin: 'Kochi',
  orissa: 'Bhubaneswar',
  khordha: 'Bhubaneswar',
  khurda: 'Bhubaneswar'
};

const normalizeCityName = (rawName) => {
  if (!rawName || typeof rawName !== 'string') return '';
  const lower = rawName.trim().toLowerCase();
  if (CITY_ALIASES[lower]) return CITY_ALIASES[lower];
  for (const [alias, canonical] of Object.entries(CITY_ALIASES)) {
    if (lower.includes(alias)) return canonical;
  }
  return rawName.trim();
};

// @desc    Detect user city by GPS coordinates (Reverse Geocode + Nearest Fallback)
// @route   GET /api/cities/detect?lat=<number>&lng=<number>
// @access  Public
const detectCity = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      !isFinite(lat) ||
      !isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing lat and lng query parameters.'
      });
    }

    const activeCities = await City.find({ isActive: true });
    if (!activeCities.length) {
      return res.status(404).json({ success: false, message: 'No active cities configured.' });
    }

    let detectedName = '';
    let matchedCity = null;

    // Step A: Reverse Geocode with Nominatim (with safe 3.5s timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`;
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'CineBookApp/1.0',
          Accept: 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const geoData = await response.json();
        const address = geoData.address || {};
        const rawPlace =
          address.city ||
          address.town ||
          address.state_district ||
          address.municipality ||
          address.county ||
          address.state ||
          '';

        detectedName = rawPlace;
        const normalized = normalizeCityName(rawPlace);

        if (normalized) {
          matchedCity = activeCities.find(
            (c) =>
              c.name.toLowerCase() === normalized.toLowerCase() ||
              c.slug.toLowerCase() === normalized.toLowerCase() ||
              normalized.toLowerCase().includes(c.name.toLowerCase()) ||
              c.name.toLowerCase().includes(normalized.toLowerCase())
          );
        }
      }
    } catch {
      // Nominatim timed out or failed — proceed to Step B fallback
    }

    // Step B: Nearest MongoDB City Fallback (Haversine Distance)
    if (!matchedCity) {
      let minDistance = Infinity;
      let nearestCity = null;

      for (const city of activeCities) {
        if (
          city.coordinates &&
          Array.isArray(city.coordinates.coordinates) &&
          city.coordinates.coordinates.length === 2
        ) {
          const [cLng, cLat] = city.coordinates.coordinates;
          const dist = calculateHaversineDistance(lat, lng, cLat, cLng);
          if (dist < minDistance) {
            minDistance = dist;
            nearestCity = city;
          }
        }
      }

      if (nearestCity) {
        matchedCity = nearestCity;
        if (!detectedName) detectedName = nearestCity.name;
      } else {
        matchedCity = activeCities[0];
        detectedName = matchedCity.name;
      }
    }

    // Calculate final distance to matched city
    let distanceKm = 0;
    if (
      matchedCity.coordinates &&
      Array.isArray(matchedCity.coordinates.coordinates) &&
      matchedCity.coordinates.coordinates.length === 2
    ) {
      const [cLng, cLat] = matchedCity.coordinates.coordinates;
      distanceKm = calculateHaversineDistance(lat, lng, cLat, cLng);
    }

    return res.json({
      success: true,
      data: {
        city: {
          _id: matchedCity._id,
          name: matchedCity.name,
          slug: matchedCity.slug,
          state: matchedCity.state,
          country: matchedCity.country || 'India'
        },
        detectedName: detectedName || matchedCity.name,
        distanceKm
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active cities
// @route   GET /api/cities
// @access  Public
const getAllCities = async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, count: cities.length, data: cities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single city
// @route   GET /api/cities/:id
// @access  Public
const getCityById = async (req, res) => {
  try {
    const city = await City.findOne({
      $or: [{ _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null }, { slug: req.params.id }]
    });
    if (!city) return res.status(404).json({ success: false, message: 'City not found.' });
    res.json({ success: true, data: city });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a city
// @route   POST /api/cities
// @access  Admin
const addCity = async (req, res) => {
  try {
    const { name, state, country, timezone } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const city = await City.create({ name, state, country, slug, timezone });
    res.status(201).json({ success: true, data: city });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a city
// @route   PUT /api/cities/:id
// @access  Admin
const updateCity = async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!city) return res.status(404).json({ success: false, message: 'City not found.' });
    res.json({ success: true, data: city });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Soft-delete a city
// @route   DELETE /api/cities/:id
// @access  Admin
const deleteCity = async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!city) return res.status(404).json({ success: false, message: 'City not found.' });
    res.json({ success: true, message: 'City deactivated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllCities, getCityById, detectCity, addCity, updateCity, deleteCity };
