const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get all users (with booking count)
// @route   GET /api/users
// @access  Admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Get booking counts for each user
    const usersWithBookings = await Promise.all(
      users.map(async (user) => {
        const bookingCount = await Booking.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          bookingCount
        };
      })
    );

    res.json({
      success: true,
      data: usersWithBookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getAllUsers };
