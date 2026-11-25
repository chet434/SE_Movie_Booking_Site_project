/**
 * HoldCleanupWorker — Background job that releases expired seat holds.
 *
 * In the two-phase booking flow, seats are placed into `status: 'held'` with
 * a 5-minute TTL (`hold.expiresAt`). The on-demand `releaseExpiredHolds()` in
 * bookingController.js only runs when a user interacts with a show. If no one
 * touches the show again, those seats stay `held` forever and are effectively
 * lost to other customers.
 *
 * This worker runs on a fixed interval and atomically reverts every expired
 * hold back to `available`, so seat inventory is never permanently stranded.
 */

const ShowSeat = require('../models/ShowSeat');
const { deepTrust } = require('../utils/deepTrust');

// How often the worker sweeps expired holds. 60s is a good balance: short
// enough that a customer rarely notices the gap, long enough to avoid
// hammering the database with tiny transactions.
const SWEEP_INTERVAL_MS = Number(process.env.HOLD_CLEANUP_INTERVAL_MS) || 60_000;

// The maximum number of seats a single sweep will release. Bounded so a huge
// backlog of expired holds can never turn one tick into an unbounded query.
const SWEEP_BATCH_LIMIT = Number(process.env.HOLD_CLEANUP_BATCH_LIMIT) || 1000;

let sweepTimer = null;
let isSweeping = false;

/**
 * Release every ShowSeat whose hold has expired.
 *
 * Uses a single atomic `updateMany` with a `$lt` time filter so the operation
 * is idempotent and safe to run concurrently with the booking controllers.
 * Returns the count of seats released, or 0 if nothing was expired.
 *
 * @returns {Promise<number>} Number of seats released.
 */
const releaseExpiredHolds = async () => {
  const cutoff = new Date();

  const result = await ShowSeat.updateMany(
    deepTrust({
      status: 'held',
      'hold.expiresAt': { $lt: cutoff },
    }),
    {
      $set: { status: 'available' },
      $unset: { hold: '' },
    },
    {
      // Hard cap so a large backlog can never balloon a single tick.
      limit: SWEEP_BATCH_LIMIT,
    }
  );

  return result?.modifiedCount ?? 0;
};

/**
 * Run a single sweep, guarding against overlapping executions.
 *
 * `isSweeping` prevents a slow sweep from stacking up if the event loop lags
 * or the database is temporarily slow. A re-entrant guard is safer than
 * relying on the timer firing exactly on schedule.
 *
 * @returns {Promise<void>}
 */
const runSweep = async () => {
  if (isSweeping) {
    return;
  }
  isSweeping = true;

  try {
    const released = await releaseExpiredHolds();
    if (released > 0) {
      console.log(`[HoldCleanupWorker] Released ${released} expired seat hold(s).`);
    }
  } catch (error) {
    // A failed sweep must never take the server down or block the next tick.
    // Log and continue; the next interval will retry.
    console.error('[HoldCleanupWorker] Sweep failed:', error?.message || error);
  } finally {
    isSweeping = false;
  }
};

/**
 * Start the periodic hold-cleanup worker.
 *
 * Idempotent: calling twice does not stack timers. Safe to call before the
 * MongoDB connection is established — the first tick will simply queue a
 * query that resolves once the driver connects.
 *
 * @returns {void}
 */
const startHoldCleanupWorker = () => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  if (sweepTimer) {
    return;
  }

  sweepTimer = setInterval(runSweep, SWEEP_INTERVAL_MS);
  console.log(
    `[HoldCleanupWorker] Started — sweeping every ${SWEEP_INTERVAL_MS}ms ` +
    `(batch limit ${SWEEP_BATCH_LIMIT}).`
  );
};

/**
 * Stop the worker and clear the timer.
 *
 * @returns {void}
 */
const stopHoldCleanupWorker = () => {
  if (sweepTimer) {
    clearInterval(sweepTimer);
    sweepTimer = null;
  }
};

module.exports = {
  releaseExpiredHolds,
  startHoldCleanupWorker,
  stopHoldCleanupWorker,
};