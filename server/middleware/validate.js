/**
 * validate — Generic Zod validation middleware.
 *
 * Validates req.body, req.query, and/or req.params against provided Zod schemas.
 * If validation fails, ZodError is thrown and automatically transformed by our
 * centralized errorHandler middleware into a clean 422 Unprocessable Entity response.
 *
 * Usage:
 *   const { validate } = require('../middleware/validate');
 *   const { registerSchema } = require('../schemas/authSchemas');
 *   router.post('/register', validate({ body: registerSchema }), registerController);
 */

/**
 * Creates an Express middleware that validates parts of the request against Zod schemas.
 *
 * @param {Object} schemas - Object containing optional body, query, and params Zod schemas
 * @param {import('zod').ZodSchema} [schemas.body] - Schema for req.body
 * @param {import('zod').ZodSchema} [schemas.query] - Schema for req.query
 * @param {import('zod').ZodSchema} [schemas.params] - Schema for req.params
 * @returns {import('express').RequestHandler} Express middleware
 */
const validate = ({ body, query, params }) => {
  return (req, res, next) => {
    try {
      if (body) {
        req.body = body.parse(req.body);
      }
      if (query) {
        req.query = query.parse(req.query);
      }
      if (params) {
        req.params = params.parse(req.params);
      }
      next();
    } catch (error) {
      // Pass ZodError directly to the centralized errorHandler middleware
      next(error);
    }
  };
};

module.exports = { validate };