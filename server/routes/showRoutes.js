const express = require('express');
const router = express.Router();
const { getShowsByMovie, getShowById, addShow, updateShow, deleteShow, getAllShows } = require('../controllers/showController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin route before parameterized route
router.get('/admin/all', protect, adminOnly, getAllShows);
router.get('/', getShowsByMovie);
router.get('/:id', getShowById);
router.post('/', protect, adminOnly, addShow);
router.put('/:id', protect, adminOnly, updateShow);
router.delete('/:id', protect, adminOnly, deleteShow);

module.exports = router;
