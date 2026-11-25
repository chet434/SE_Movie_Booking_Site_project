/**
 * ApiError — Custom error class for operational (expected) errors.
 *
 * Usage:
 *   throw new ApiError(404, 'Movie not found');
 *
 * Operational errors are those we know can happen: not found, validation
 * failures, bad requests, payment declined, etc. They are safe to pass to
 * the user because they don't expose internal system details.
 *
 * Non-operational errors (bugs, database connection loss, etc.) are logged
 * internally but return a generic message to the client.
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = undefined) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Creates a 400 Bad Request error.
 * @param {string} message
 * @returns {ApiError}
 */
const BadRequest = (message = 'Bad request') =>
  new ApiError(400, message);

/**
 * Creates a 401 Unauthorized error.
 * @param {string} message
 * @returns {ApiError}
 */
const Unauthorized = (message = 'Unauthorized') =>
  new ApiError(401, message);

/**
 * Creates a 403 Forbidden error.
 * @param {string} message
 * @returns {ApiError}
 */
const Forbidden = (message = 'Forbidden') =>
  new ApiError(403, message);

/**
 * Creates a 404 Not Found error.
 * @param {string} message
 * @returns {ApiError}
 */
const NotFound = (message = 'Resource not found') =>
  new ApiError(404, message);

/**
 * Creates a 409 Conflict error (e.g., duplicate booking).
 * @param {string} message
 * @returns {ApiError}
 */
const Conflict = (message = 'Conflict') =>
  new ApiError(409, message);

/**
 * Creates a 422 Unprocessable Entity error (validation).
 * @param {string} message
 * @returns {ApiError}
 */
const ValidationError = (message = 'Validation failed') =>
  new ApiError(422, message);

/**
 * Creates a 429 Too Many Requests error (rate limiting).
 * @param {string} message
 * @returns {ApiError}
 */
const TooManyRequests = (message = 'Too many requests') =>
  new ApiError(429, message);

/**
 * Creates a 500 Internal Server Error.
 * @param {string} message
 * @returns {ApiError}
 */
const InternalServerError = (message = 'Internal server error') =>
  new ApiError(500, message, false);

module.exports = {
  ApiError,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  Conflict,
  ValidationError,
  TooManyRequests,
  InternalServerError,
};