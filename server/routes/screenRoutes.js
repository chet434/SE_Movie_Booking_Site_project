const express = require('express');
const router = express.Router();
const { getScreensByTheatre, getScreenById, addScreen, updateScreen, deleteScreen } = require('../controllers/screenController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getScreensByTheatre);
router.get('/:id', getScreenById);
router.post('/', protect, adminOnly, addScreen);
router.put('/:id', protect, adminOnly, updateScreen);
router.delete('/:id', protect, adminOnly, deleteScreen);

module.exports = router;
