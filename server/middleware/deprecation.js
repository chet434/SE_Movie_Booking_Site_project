/**
 * deprecation.js — Middleware for marking deprecated endpoints.
 *
 * Usage:
 *   router.post('/', deprecated('Use POST /api/bookings/hold + /api/bookings/confirm'), createBooking);
 */

const deprecationWarnings = new Map();

function deprecated(message, version = '2.0.0', removeAt = '3.0.0') {
  return (req, res, next) => {
    const warning = {
      message,
      deprecatedSince: version,
      scheduledRemoval: removeAt,
      timestamp: new Date().toISOString()
    };

    deprecationWarnings.set(req.originalUrl, warning);

    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        `[DEPRECATION WARNING] ${req.method} ${req.originalUrl}\n` +
        `  Message: ${message}\n` +
        `  Deprecated since: v${version}, scheduled for removal in v${removeAt}`
      );
    }

    res.setHeader('Warning', `299 - "Deprecated API: ${message}"`);
    res.setHeader('X-API-Deprecation', `v${version}`);

    next();
  };
}

function getDeprecationWarnings() {
  return Array.from(deprecationWarnings.entries()).map(([url, warning]) => ({
    url,
    ...warning
  }));
}

module.exports = {
  deprecated,
  getDeprecationWarnings
};