/**
 * errorHandler — Centralized Express error-handling middleware.
 *
 * This middleware replaces the generic error handler in server.js. It handles:
 * - ApiError instances (operational errors with clean user messages)
 * - Mongoose CastError (invalid ObjectId format in URL params)
 * - Mongoose DuplicateKeyError (E11000 on unique constraint violation)
 * - ZodValidationError (from schema validators)
 * - Unexpected non-operational errors (internal bugs)
 *
 * Stack traces are always logged to console for debugging, but the RESPONSE
 * to the client never includes internal details unless NODE_ENV !== 'production'.
 */

const { ApiError } = require('../utils/ApiError');

/**
 * Format the response based on environment and error type.
 * @param {Error} error
 * @param {boolean} isOperational
 * @returns {{ message: string, stack?: string }}
 */
const formatError = (error, isOperational) => {
  const isInProduction = process.env.NODE_ENV === 'production';

  if (isInProduction && !isOperational) {
    return { message: 'Internal Server Error' };
  }

  const response = { message: error.message };

  if (!isInProduction) {
    response.stack = error.stack;
  }

  return response;
};

/**
 * Express error-handling middleware.
 *
 * @param {Error} err - The error object
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next - Next middleware (required by Express)
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let isOperational = false;

  // 1. ApiError from our helpers
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    isOperational = err.isOperational;
  }
  // 2. Mongoose CastError (invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    isOperational = true;
    err.message = `Invalid ${err.path}: ${err.value}`;
  }
  // 3. Mongoose DuplicateKeyError (E11000)
  else if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    statusCode = 409;
    isOperational = true;
    err.message = `Duplicate value for ${field}: ${err.value}`;
  }
  // 4. Zod validation error
  else if (err.name === 'ZodError') {
    statusCode = 422;
    isOperational = true;
    // Transform Zod issues into a readable message
    err.message = err.errors?.map((e) => e.message).join(', ') || 'Validation failed';
  }
  // 5. JWT errors (jsonwebtoken)
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    isOperational = true;
    err.message = 'Invalid or expired token';
  }
  // 6. Unexpected errors — log but sanitize response in production
  else {
    statusCode = 500;
    isOperational = false;
  }

  const formatted = formatError(err, isOperational);

  // Always log the error (includes stack for debugging)
  console.error(
    `[${req.method}] ${req.originalUrl} - ${statusCode}`,
    isOperational ? err.message : err.stack || err
  );

  res.status(statusCode).json({
    success: false,
    error: formatted.message,
    message: formatted.message,
    ...(formatted.stack && { stack: formatted.stack }),
  });
};

/**
 * Async wrapper for catching errors in async route handlers.
 * Eliminates try-catch in individual controllers.
 *
 * Usage:
 *   router.get('/movies', asyncHandler(async (req, res) => {
 *     const movies = await Movie.find();
 *     res.json({ success: true, data: movies });
 *   }));
 *
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
};