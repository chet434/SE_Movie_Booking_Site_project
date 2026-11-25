/**
 * Cancellation & Refund Policy Helper for CineBook
 * 
 * Enforces venue/show-level cancellability and exact 20% fee deduction (80% refund).
 */

/**
 * Resolves the effective cancellability, fee percent, and cutoff window for a show.
 * Show-level isCancellable overrides theatre-level cancellationAllowed when non-null.
 * 
 * @param {Object} show - Populated show document or object with theatre
 * @returns {{ isCancellable: boolean, feePercent: number, cutoffMinutes: number }}
 */
function resolveShowCancellability(show) {
  if (!show) {
    return { isCancellable: false, feePercent: 20, cutoffMinutes: 120 };
  }

  const theatre = show.theatre || {};
  const feePercent = typeof theatre.cancellationFeePercent === 'number' 
    ? theatre.cancellationFeePercent 
    : 20;
  const cutoffMinutes = typeof theatre.cancellationCutoffMinutes === 'number'
    ? theatre.cancellationCutoffMinutes
    : 120;

  // Show-level override takes precedence if explicitly set (true or false)
  if (show.isCancellable !== null && show.isCancellable !== undefined) {
    return {
      isCancellable: Boolean(show.isCancellable),
      feePercent,
      cutoffMinutes
    };
  }

  // Inherit from theatre
  const isCancellable = Boolean(theatre.cancellationAllowed);
  return {
    isCancellable,
    feePercent,
    cutoffMinutes
  };
}

/**
 * Evaluates whether a confirmed booking is eligible for cancellation and computes
 * the exact 20% fee / 80% refund breakdown.
 * 
 * @param {Object} booking - Booking document
 * @returns {Object} evaluation summary
 */
function evaluateCancellation(booking) {
  if (!booking) {
    return {
      eligible: false,
      reason: 'Booking not found',
      totalAmount: 0,
      feePercent: 20,
      cancellationFee: 0,
      refundAmount: 0,
      cutoffTime: null,
      showStartTime: null
    };
  }

  let isCancellable = booking.isCancellable;
  if (isCancellable === undefined || isCancellable === null) {
    isCancellable = booking.snapshot?.isCancellable;
  }
  if (isCancellable === undefined || isCancellable === null) {
    const resolved = resolveShowCancellability(booking.show || { theatre: booking.theatre });
    isCancellable = resolved.isCancellable;
  }
  isCancellable = Boolean(isCancellable);

  const feePercent = typeof booking.cancellationFeePercent === 'number' ? booking.cancellationFeePercent : 20;
  const cutoffMinutes = typeof booking.cancellationCutoffMinutes === 'number' ? booking.cancellationCutoffMinutes : 120;
  const totalAmount = Number(booking.totalAmount || 0);

  // Derive show start time from snapshot or populated show
  let showStartTime = null;
  const rawDate = booking.snapshot?.startsAt || 
                  booking.show?.startsAt || 
                  booking.startsAt ||
                  booking.show?.date;

  if (rawDate) {
    const parsed = new Date(rawDate);
    if (!isNaN(parsed.getTime())) {
      showStartTime = new Date(parsed);
      const timeStr = booking.snapshot?.startTime || booking.show?.startTime;
      if (timeStr && (showStartTime.getHours() === 0 && showStartTime.getMinutes() === 0)) {
        const match = String(timeStr).match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
          let hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          const meridiem = match[3]?.toUpperCase();
          if (meridiem === 'PM' && hours < 12) hours += 12;
          if (meridiem === 'AM' && hours === 12) hours = 0;
          showStartTime.setHours(hours, minutes, 0, 0);
        }
      }
    }
  }

  // Exact 20% deduction math
  const cancellationFee = Number((totalAmount * (feePercent / 100)).toFixed(2));
  const refundAmount = Number((totalAmount - cancellationFee).toFixed(2));

  if (!showStartTime || isNaN(showStartTime.getTime())) {
    return {
      eligible: false,
      reason: 'Show schedule could not be determined.',
      totalAmount,
      feePercent,
      cancellationFee,
      refundAmount,
      cutoffTime: null,
      showStartTime: null
    };
  }

  const cutoffTime = new Date(showStartTime.getTime() - cutoffMinutes * 60 * 1000);

  // 1. Check status
  if (booking.status !== 'confirmed') {
    return {
      eligible: false,
      reason: booking.status === 'cancelled' ? 'Booking is already cancelled' : 'Booking is not confirmed',
      totalAmount,
      feePercent,
      cancellationFee,
      refundAmount,
      cutoffTime,
      showStartTime
    };
  }

  // 2. Check cancellability policy
  if (!isCancellable) {
    return {
      eligible: false,
      reason: 'This ticket is non-cancellable as per the venue policy.',
      totalAmount,
      feePercent,
      cancellationFee,
      refundAmount,
      cutoffTime,
      showStartTime
    };
  }

  // 3. Check time cutoff (at least 2 hours before showtime)
  const now = new Date();
  if (cutoffTime && now >= cutoffTime) {
    return {
      eligible: false,
      reason: 'Cancellation window closed. Tickets can only be cancelled at least 2 hours before showtime.',
      totalAmount,
      feePercent,
      cancellationFee,
      refundAmount,
      cutoffTime,
      showStartTime
    };
  }

  return {
    eligible: true,
    reason: '',
    totalAmount,
    feePercent,
    cancellationFee,
    refundAmount,
    cutoffTime,
    showStartTime
  };
}

module.exports = {
  resolveShowCancellability,
  evaluateCancellation
};
