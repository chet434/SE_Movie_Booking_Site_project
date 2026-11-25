const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { startHoldCleanupWorker } = require('./workers/HoldCleanupWorker');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const { validateEnv, getCorsConfig, getRateLimitConfig, getAuthRateLimitConfig } = require('./config/security');

// Load environment variables
dotenv.config();

// Validate environment variables at startup
validateEnv();

// Connect to database
connectDB();

const app = express();

// Security middleware stack (Express 5 compatible order)
// 1. Helmet - sets security headers
app.use(helmet());

// 2. CORS - must be before body parsers
app.use(cors(getCorsConfig()));

// 3. Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Rate limiting (relaxed general limiter + dedicated strict auth limiter)
const limiter = rateLimit(getRateLimitConfig(500));
const authLimiter = rateLimit(getAuthRateLimitConfig());

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 5. HPP - prevent HTTP Parameter Pollution
app.use(hpp());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/theatres', require('./routes/theatreRoutes'));
app.use('/api/shows', require('./routes/showRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/locations', require('./routes/locationRoutes')); // kept for backward compat
// V2 routes
app.use('/api/cities', require('./routes/cityRoutes'));
app.use('/api/screens', require('./routes/screenRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/event-bookings', require('./routes/eventBookingRoutes'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Movie Ticket Booking API is running' });
});

// Centralized error-handling middleware (must come AFTER all routes)
app.use(require('./middleware/errorHandler').errorHandler);

const PORT = process.env.PORT || 5000;

// Start background worker that releases expired seat holds on a timer.
startHoldCleanupWorker();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
