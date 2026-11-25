/**
 * commonSchemas — Shared Zod schemas used across multiple routes.
 *
 * Reusable primitives (ObjectId, pagination, etc.) so every route can build
 * on top of a single source of truth rather than redefining them inline.
 */

const { z } = require('zod');

/**
 * MongoDB ObjectId as a string. Used for URL params like /api/movies/:id
 */
const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

/**
 * Pagination query parameters for list endpoints.
 *
 * Defaults: page=1, limit=20. Hard caps prevent unbounded queries.
 */
const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Generic sort parameter: "field:asc" or "field:desc"
 */
const SortSchema = z
  .string()
  .regex(/^[a-zA-Z_]+:(asc|desc)$/, 'Sort must be "field:asc" or "field:desc"')
  .optional();

/**
 * Email validation with a reasonable regex (covers most real-world addresses).
 */
const EmailSchema = z
  .string()
  .email('Invalid email address')
  .max(254);

/**
 * 10-digit phone number (digits only).
 */
const PhoneSchema = z
  .string()
  .regex(/^\d{10}$/, 'Phone must be 10 digits');

/**
 * Password: minimum 6 characters, maximum 128 to prevent DoS via bcrypt.
 */
const PasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128);

module.exports = {
  z,
  ObjectIdSchema,
  PaginationSchema,
  SortSchema,
  EmailSchema,
  PhoneSchema,
  PasswordSchema,
};