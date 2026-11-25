/**
 * pagination.js — Pagination middleware for list endpoints.
 *
 * Provides envelope pagination with metadata:
 * {
 *   success: true,
 *   meta: { total, page, limit, pages },
 *   data: [...]
 * }
 */

const { PaginationSchema } = require('../schemas/commonSchemas');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Middleware that parses pagination params and adds helpers to req
 */
function parsePagination(req, res, next) {
  try {
    const parsed = PaginationSchema.parse(req.query);
    req.pagination = {
      page: parsed.page,
      limit: parsed.limit,
      skip: (parsed.page - 1) * parsed.limit
    };
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid pagination parameters'
    });
  }
}

/**
 * Response wrapper for paginated results
 */
function paginate(res, data, total) {
  const { page, limit } = res.locals.pagination || { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT };

  return {
    success: true,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data
  };
}

module.exports = {
  parsePagination,
  paginate,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT
};