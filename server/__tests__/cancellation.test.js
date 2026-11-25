const { resolveShowCancellability, evaluateCancellation } = require('../utils/cancellationPolicy');
const { cancelBookingSchema, cancelBookingParamsSchema } = require('../schemas/bookingSchemas');

describe('Cancellation Policy Engine', () => {
  describe('Zod Validation Schemas', () => {
    test('cancelBookingParamsSchema accepts valid ObjectIds and booking numbers', () => {
      expect(() => cancelBookingParamsSchema.parse({ id: '6b071bfdf1cf70d99562fd53' })).not.toThrow();
      expect(() => cancelBookingParamsSchema.parse({ id: 'BMS115752' })).not.toThrow();
      expect(() => cancelBookingParamsSchema.parse({ id: '' })).toThrow();
    });

    test('cancelBookingSchema allows optional or empty reason', () => {
      expect(cancelBookingSchema.parse({})).toEqual({});
      expect(cancelBookingSchema.parse({ reason: 'Change of plans' })).toEqual({ reason: 'Change of plans' });
      expect(() => cancelBookingSchema.parse({ reason: 'a'.repeat(300) })).toThrow();
    });
  });
  describe('resolveShowCancellability', () => {
    test('inherits theatre policy when show.isCancellable is null or undefined', () => {
      const show1 = {
        isCancellable: null,
        theatre: { cancellationAllowed: true, cancellationFeePercent: 20, cancellationCutoffMinutes: 120 }
      };
      const result1 = resolveShowCancellability(show1);
      expect(result1.isCancellable).toBe(true);
      expect(result1.feePercent).toBe(20);
      expect(result1.cutoffMinutes).toBe(120);

      const show2 = {
        theatre: { cancellationAllowed: false, cancellationFeePercent: 20, cancellationCutoffMinutes: 120 }
      };
      const result2 = resolveShowCancellability(show2);
      expect(result2.isCancellable).toBe(false);
    });

    test('show-level override takes precedence over theatre default', () => {
      // Theatre allows cancellation, but show is explicitly non-cancellable
      const show1 = {
        isCancellable: false,
        theatre: { cancellationAllowed: true, cancellationFeePercent: 20, cancellationCutoffMinutes: 120 }
      };
      expect(resolveShowCancellability(show1).isCancellable).toBe(false);

      // Theatre disallows cancellation, but show is explicitly cancellable
      const show2 = {
        isCancellable: true,
        theatre: { cancellationAllowed: false, cancellationFeePercent: 20, cancellationCutoffMinutes: 120 }
      };
      expect(resolveShowCancellability(show2).isCancellable).toBe(true);
    });
  });

  describe('evaluateCancellation', () => {
    test('rejects unconfirmed bookings', () => {
      const booking = {
        status: 'pending',
        isCancellable: true,
        totalAmount: 500,
        snapshot: { startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
      };
      const evalResult = evaluateCancellation(booking);
      expect(evalResult.eligible).toBe(false);
      expect(evalResult.reason).toContain('not confirmed');
    });

    test('rejects non-cancellable bookings with specific venue policy message', () => {
      const booking = {
        status: 'confirmed',
        isCancellable: false,
        totalAmount: 500,
        snapshot: { startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
      };
      const evalResult = evaluateCancellation(booking);
      expect(evalResult.eligible).toBe(false);
      expect(evalResult.reason).toBe('This ticket is non-cancellable as per the venue policy.');
    });

    test('rejects bookings within 2 hours of showtime', () => {
      // 1 hour in the future (within 120 minutes cutoff)
      const booking = {
        status: 'confirmed',
        isCancellable: true,
        cancellationCutoffMinutes: 120,
        totalAmount: 500,
        snapshot: { startsAt: new Date(Date.now() + 60 * 60 * 1000) }
      };
      const evalResult = evaluateCancellation(booking);
      expect(evalResult.eligible).toBe(false);
      expect(evalResult.reason).toBe(
        'Cancellation window closed. Tickets can only be cancelled at least 2 hours before showtime.'
      );
    });

    test('calculates exact 20% cancellation fee and 80% refund for eligible booking', () => {
      // 24 hours in the future
      const booking = {
        status: 'confirmed',
        isCancellable: true,
        cancellationFeePercent: 20,
        cancellationCutoffMinutes: 120,
        totalAmount: 520,
        snapshot: { startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
      };
      const evalResult = evaluateCancellation(booking);
      expect(evalResult.eligible).toBe(true);
      expect(evalResult.reason).toBe('');
      expect(evalResult.totalAmount).toBe(520);
      expect(evalResult.feePercent).toBe(20);
      // 20% of 520 = 104
      expect(evalResult.cancellationFee).toBe(104);
      // 80% of 520 = 416
      expect(evalResult.refundAmount).toBe(416);
    });

    test('handles decimal refund amounts cleanly', () => {
      const booking = {
        status: 'confirmed',
        isCancellable: true,
        cancellationFeePercent: 20,
        totalAmount: 399,
        snapshot: { startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
      };
      const evalResult = evaluateCancellation(booking);
      expect(evalResult.eligible).toBe(true);
      // 20% of 399 = 79.80
      expect(evalResult.cancellationFee).toBe(79.8);
      // 80% of 399 = 319.20
      expect(evalResult.refundAmount).toBe(319.2);
    });

    test('correctly parses same-day midnight date combined with 12-hour AM/PM startTime', () => {
      // Midnight today + 7:30 PM showtime
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const booking = {
        status: 'confirmed',
        isCancellable: true,
        cancellationCutoffMinutes: 120,
        totalAmount: 400,
        show: {
          date: today,
          startTime: '07:30 PM'
        }
      };

      const evalResult = evaluateCancellation(booking);
      expect(evalResult.showStartTime).not.toBeNull();
      expect(evalResult.showStartTime.getHours()).toBe(19);
      expect(evalResult.showStartTime.getMinutes()).toBe(30);

      // Cutoff should be 2 hours before 19:30 => 17:30
      expect(evalResult.cutoffTime.getHours()).toBe(17);
      expect(evalResult.cutoffTime.getMinutes()).toBe(30);
    });

    test('falls back to theatre cancellability when booking.isCancellable is null or undefined', () => {
      const booking = {
        status: 'confirmed',
        isCancellable: null,
        theatre: {
          cancellationAllowed: true,
          cancellationFeePercent: 20,
          cancellationCutoffMinutes: 120
        },
        totalAmount: 500,
        snapshot: { startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
      };

      const evalResult = evaluateCancellation(booking);
      expect(evalResult.eligible).toBe(true);
      expect(evalResult.refundAmount).toBe(400);
    });

    test('rejects booking when show schedule is missing or invalid', () => {
      const booking = {
        status: 'confirmed',
        isCancellable: true,
        totalAmount: 500,
        snapshot: { startsAt: 'invalid-date' }
      };

      const evalResult = evaluateCancellation(booking);
      expect(evalResult.eligible).toBe(false);
      expect(evalResult.reason).toBe('Show schedule could not be determined.');
    });
  });
});
