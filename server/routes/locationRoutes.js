const express = require('express');
const router = express.Router();
const { getAllLocations, addLocation } = require('../controllers/locationController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(getAllLocations)
  .post(protect, adminOnly, addLocation);

module.exports = router;
