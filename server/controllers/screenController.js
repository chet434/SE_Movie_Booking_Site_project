const Screen = require('../models/Screen');
const Seat = require('../models/Seat');

// @desc    Get screens for a theatre
// @route   GET /api/screens?theatreId=
// @access  Public
const getScreensByTheatre = async (req, res) => {
  try {
    const { theatreId } = req.query;
    const filter = theatreId ? { theatre: theatreId, isActive: true } : { isActive: true };
    const screens = await Screen.find(filter)
      .populate('theatre', 'name')
      .sort({ screenNumber: 1 });
    res.json({ success: true, count: screens.length, data: screens });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single screen with its seats
// @route   GET /api/screens/:id
// @access  Public
const getScreenById = async (req, res) => {
  try {
    const screen = await Screen.findById(req.params.id).populate('theatre', 'name city');
    if (!screen) return res.status(404).json({ success: false, message: 'Screen not found.' });
    const seats = await Seat.find({ screen: screen._id, isActive: true }).sort({ label: 1 });
    res.json({ success: true, data: { ...screen.toObject(), seats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a screen
// @route   POST /api/screens
// @access  Admin
const addScreen = async (req, res) => {
  try {
    const { theatre, name, screenNumber, formatCapabilities, rows, seatsPerRow } = req.body;

    const screen = await Screen.create({
      theatre,
      name,
      screenNumber,
      formatCapabilities: formatCapabilities || ['2D'],
      capacity: (rows || 6) * (seatsPerRow || 8)
    });

    // Auto-generate seats if rows/seatsPerRow provided
    if (rows && seatsPerRow) {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const seats = [];
      for (let r = 0; r < rows; r++) {
        const rowLetter = alphabet[r % 26];
        for (let c = 1; c <= seatsPerRow; c++) {
          const label = `${rowLetter}${c}`;
          const seatType = r >= rows - 2 ? 'premium' : 'regular';
          seats.push({
            screen: screen._id,
            row: rowLetter,
            number: c,
            label,
            type: seatType,
            position: { row: r, col: c - 1 }
          });
        }
      }
      await Seat.insertMany(seats);
    }

    res.status(201).json({ success: true, data: screen });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a screen
// @route   PUT /api/screens/:id
// @access  Admin
const updateScreen = async (req, res) => {
  try {
    const screen = await Screen.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!screen) return res.status(404).json({ success: false, message: 'Screen not found.' });
    res.json({ success: true, data: screen });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Soft-delete a screen
// @route   DELETE /api/screens/:id
// @access  Admin
const deleteScreen = async (req, res) => {
  try {
    const screen = await Screen.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!screen) return res.status(404).json({ success: false, message: 'Screen not found.' });
    await Seat.updateMany({ screen: screen._id }, { isActive: false });
    res.json({ success: true, message: 'Screen deactivated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getScreensByTheatre, getScreenById, addScreen, updateScreen, deleteScreen };
