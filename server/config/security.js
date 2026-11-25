/**
 * security.js — Security configuration and startup validation.
 *
 * Validates required environment variables at startup and provides
 * centralized security settings for CORS, JWT, and rate limiting.
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
];

const optionalEnvVars = [
  'PORT',
  'NODE_ENV',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'CORS_ORIGIN',
  'RATE_LIMIT_MAX',
  'RATE_LIMIT_WINDOW_MS',
];

/**
 * Validate required environment variables at startup.
 * Throws an error with a clear message if any are missing.
 */
function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file and ensure these are set.`
    );
  }

  // Validate JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret.length < 32) {
    throw new Error(
      `JWT_SECRET must be at least 32 characters long. ` +
      `Current length: ${jwtSecret.length}`
    );
  }

  // Validate MONGODB_URI format
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  }
}

/**
 * CORS configuration based on environment.
 * In production, restrict to configured origins only.
 */
function getCorsConfig() {
  const envOrigin = process.env.CORS_ORIGIN;
  const isProduction = process.env.NODE_ENV === 'production';

  if (envOrigin) {
    // Support comma-separated origins
    const origins = envOrigin.split(',').map((o) => o.trim());
    return {
      origin: origins.length === 1 ? origins[0] : origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400 // 24 hours
    };
  }

  // Default: allow localhost for development
  return {
    origin: isProduction
      ? process.env.CORS_ORIGIN || 'https://yourdomain.com'
      : 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400
  };
}

/**
 * JWT configuration
 */
function getJwtConfig() {
  return {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
  };
}

/**
 * Rate limiting configuration (general API — relaxed for browsing and seat polling)
 */
function getRateLimitConfig(defaultMax = 100) {
  return {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || defaultMax,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
  };
}

/**
 * Strict rate limiting configuration for auth endpoints (login / register)
 */
function getAuthRateLimitConfig() {
  return {
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 15,
    message: {
      success: false,
      error: 'Too many authentication attempts from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
  };
}

module.exports = {
  validateEnv,
  getCorsConfig,
  getJwtConfig,
  getRateLimitConfig,
  getAuthRateLimitConfig,
  requiredEnvVars,
  optionalEnvVars
};