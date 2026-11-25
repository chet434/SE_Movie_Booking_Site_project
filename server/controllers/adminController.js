const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Seat = require('../models/Seat');
const City = require('../models/City');
const Show = require('../models/Show');
const ShowSeat = require('../models/ShowSeat');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const User = require('../models/User');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalMovies,
      totalTheatres,
      totalScreens,
      totalSeats,
      totalCities,
      totalShows,
      totalBookings,
      totalUsers,
      todayRevenueAgg,
      totalRevenueAgg,
      bookedSeatCount,
      totalShowSeatCount
    ] = await Promise.all([
      Movie.countDocuments({ isActive: true }),
      Theatre.countDocuments({ isActive: true }),
      Screen.countDocuments({ isActive: true }),
      Seat.countDocuments({ isActive: true }),
      City.countDocuments({ isActive: true }),
      Show.countDocuments({ isActive: true }),
      Booking.countDocuments({ status: 'confirmed' }),
      User.countDocuments({ role: 'customer' }),

      // Today's revenue from Payment collection
      Payment.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      // All-time revenue
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      // Occupancy: booked show seats
      ShowSeat.countDocuments({ status: 'booked' }),
      ShowSeat.countDocuments({ status: { $in: ['available', 'booked', 'held'] } })
    ]);

    const todayRevenue = todayRevenueAgg[0]?.total || 0;
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const occupancyRate = totalShowSeatCount > 0
      ? ((bookedSeatCount / totalShowSeatCount) * 100).toFixed(1)
      : '0.0';

    res.json({
      success: true,
      data: {
        totalMovies,
        totalTheatres,
        totalScreens,
        totalSeats,
        totalCities,
        totalShows,
        totalBookings,
        totalUsers,
        todayRevenue,
        totalRevenue,
        occupancyRate: `${occupancyRate}%`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };
