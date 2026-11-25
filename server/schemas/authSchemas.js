/**
 * authSchemas — Zod schemas for authentication endpoints.
 *
 * Covers register, login, update profile, and password change.
 * These replace the ad-hoc `if (!field)` checks in authController.js.
 */

const { z } = require('zod');
const {
  EmailSchema,
  PhoneSchema,
  PasswordSchema,
} = require('./commonSchemas');

/**
 * POST /api/auth/register
 */
const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  email: EmailSchema,
  phone: PhoneSchema,
  password: PasswordSchema,
  confirmPassword: PasswordSchema,
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
);

/**
 * POST /api/auth/login
 */
const loginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * PUT /api/auth/profile (update name/phone)
 */
const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  phone: PhoneSchema,
});

/**
 * PUT /api/auth/password (change password)
 */
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: PasswordSchema,
  confirmNewPassword: PasswordSchema,
}).refine(
  (data) => data.newPassword === data.confirmNewPassword,
  { message: 'Passwords do not match', path: ['confirmNewPassword'] }
);

/**
 * POST /api/auth/refresh
 */
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
};