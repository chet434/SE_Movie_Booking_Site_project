const express = require('express');
const router = express.Router();
const { getAllTheatres, getTheatreById, addTheatre, updateTheatre, deleteTheatre, getLocations } = require('../controllers/theatreController');
const { protect, adminOnly } = require('../middleware/auth');

// Place specific routes before parameterized routes
router.get('/locations/list', getLocations);
router.get('/', getAllTheatres);
router.get('/:id', getTheatreById);
router.post('/', protect, adminOnly, addTheatre);
router.put('/:id', protect, adminOnly, updateTheatre);
router.delete('/:id', protect, adminOnly, deleteTheatre);

module.exports = router;
