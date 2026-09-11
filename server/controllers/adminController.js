const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments({ status: { $ne: 'inactive' } });
    const totalTheatres = await Theatre.countDocuments();
    const totalShows = await Show.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const totalUsers = await User.countDocuments({ role: 'customer' });

    // Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.find({
      bookingStatus: 'confirmed',
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayRevenue = todayBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    res.json({
      success: true,
      data: {
        totalMovies,
        totalTheatres,
        totalShows,
        totalBookings,
        totalUsers,
        todayRevenue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getDashboardStats };
