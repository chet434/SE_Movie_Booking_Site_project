const express = require('express');
const router = express.Router();
const {
  getAllCities,
  getCityById,
  detectCity,
  addCity,
  updateCity,
  deleteCity
} = require('../controllers/cityController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getAllCities);
router.get('/detect', detectCity);
router.get('/:id', getCityById);
router.post('/', protect, adminOnly, addCity);
router.put('/:id', protect, adminOnly, updateCity);
router.delete('/:id', protect, adminOnly, deleteCity);

module.exports = router;
