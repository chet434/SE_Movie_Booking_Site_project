/**
 * bookingSchemas — Zod schemas for booking endpoints.
 *
 * Covers the two-phase hold/confirm flow and the legacy single-step booking.
 */

const { z } = require('zod');
const { ObjectIdSchema } = require('./commonSchemas');

const VALID_PAYMENT_METHODS = [
  'UPI',
  'Credit/Debit Card',
  'Net Banking',
  'Mobile Wallets',
  'Gift Voucher',
  'Pay Later',
  'Redeem Points',
  'Cash at Counter'
];

const paymentMethodSchema = z
  .string()
  .max(50)
  .trim()
  .refine((val) => !val || VALID_PAYMENT_METHODS.includes(val) || val.length > 0, {
    message: 'Invalid payment method'
  })
  .default('UPI');

/**
 * POST /api/bookings/hold
 */
const holdSeatsSchema = z.object({
  showId: z.string().min(1, 'Show ID is required'),
  showSeatIds: z
    .array(z.string().min(1), { required_error: 'showSeatIds must be an array' })
    .min(1, 'At least one seat is required')
    .max(10, 'Maximum 10 seats can be booked at a time'),
});

/**
 * POST /api/bookings/confirm
 */
const confirmBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  paymentMethod: paymentMethodSchema.optional(),
  seatNumbers: z.array(z.string()).optional(),
  showId: z.string().min(1).optional(),
  totalAmount: z.number().optional()
});

/**
 * POST /api/bookings (legacy single-step booking)
 */
const createBookingSchema = z.object({
  showId: z.string().min(1, 'Show ID is required'),
  seatNumbers: z
    .array(z.string().min(1).max(10), { required_error: 'seatNumbers must be an array' })
    .min(1, 'At least one seat is required')
    .max(10, 'Maximum 10 seats can be booked at a time'),
  paymentMethod: paymentMethodSchema.optional(),
  totalAmount: z.number().optional(),
  simulateFailure: z.boolean().optional().default(false),
});

module.exports = {
  holdSeatsSchema,
  confirmBookingSchema,
  createBookingSchema,
};