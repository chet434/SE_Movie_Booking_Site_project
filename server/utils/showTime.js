/**
 * Showtime & Cutoff Helper for CineBook (server/utils/showTime.js)
 * 
 * Provides rock-solid IST / local time parsing, accurate `startsAt` derivation,
 * and time-aware bookability checks so expired showtimes are filtered and blocked.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +05:30 in milliseconds

/**
 * Returns a YYYY-MM-DD date string representing the calendar day in Indian Standard Time (IST).
 * 
 * @param {Date|string|number} dateVal
 * @returns {string} e.g. "2026-11-25"
 */
function getISTCalendarDateString(dateVal) {
  if (!dateVal) return '';
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
    return dateVal.trim();
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const istDate = new Date(d.getTime() + IST_OFFSET_MS);
  const y = istDate.getUTCFullYear();
  const m = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parses show date + startTime string into an exact Date object in IST.
 * 
 * @param {Date|string} dateVal - e.g. "2026-11-25" or UTC midnight Date
 * @param {string} timeStr - e.g. "8:30 PM", "10:30 AM", "20:30"
 * @returns {Date} exact UTC timestamp representing the screening time in IST
 */
function parseISTShowTime(dateVal, timeStr) {
  let year, month, day;

  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
    const parts = dateVal.split('T')[0].split('-').map(Number);
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else {
    const d = new Date(dateVal || Date.now());
    const istDate = new Date(d.getTime() + IST_OFFSET_MS);
    year = istDate.getUTCFullYear();
    month = istDate.getUTCMonth() + 1;
    day = istDate.getUTCDate();
  }

  let hours = 12;
  let minutes = 0;

  if (timeStr) {
    const match = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3]?.toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
  }

  // Construct UTC timestamp corresponding to this IST wall-clock time
  const utcMillis = Date.UTC(year, month - 1, day, hours, minutes, 0, 0) - IST_OFFSET_MS;
  return new Date(utcMillis);
}

/**
 * Derives the exact starting Date for a show document or plain object.
 * Checks whether `show.startsAt` is already a valid Date and aligns with `show.date` + `show.startTime`.
 * If it aligns (within 15 minutes), returns `new Date(show.startsAt)`.
 * Otherwise, accurately computes the timestamp from `show.date` and `show.startTime`.
 * 
 * @param {Object} show - Show document or object
 * @returns {Date} exact starting Date
 */
function getShowStartDate(show) {
  if (!show) return new Date(0);

  const rawDate = show.date || show.startsAt;
  const timeStr = show.startTime;

  if (rawDate && timeStr) {
    const computed = parseISTShowTime(rawDate, timeStr);
    if (show.startsAt) {
      const existing = new Date(show.startsAt);
      if (!isNaN(existing.getTime()) && Math.abs(existing.getTime() - computed.getTime()) <= 15 * 60 * 1000) {
        return existing;
      }
    }
    return computed;
  }

  if (show.startsAt) {
    const existing = new Date(show.startsAt);
    if (!isNaN(existing.getTime())) return existing;
  }

  if (show.date) {
    const d = new Date(show.date);
    if (!isNaN(d.getTime())) return d;
  }

  return new Date(0);
}

/**
 * Returns true ONLY if the show's starting time is strictly after the current time
 * plus any required booking cutoff window (default 0 minutes).
 * A screening that has already started is immediately unbookable.
 * 
 * @param {Object} show - Show document or plain object
 * @param {Date} [now=new Date()] - Current reference time
 * @param {number} [cutoffMinutes=0] - Additional buffer before screening
 * @returns {boolean}
 */
function isShowBookable(show, now = new Date(), cutoffMinutes = 0) {
  if (!show) return false;
  if (show.isActive === false || show.status === 'cancelled') return false;

  const startDate = getShowStartDate(show);
  if (!startDate || isNaN(startDate.getTime()) || startDate.getTime() === 0) {
    return false;
  }

  const cutoffThreshold = new Date(startDate.getTime() - cutoffMinutes * 60 * 1000);
  return cutoffThreshold.getTime() > now.getTime();
}

module.exports = {
  IST_OFFSET_MS,
  getISTCalendarDateString,
  parseISTShowTime,
  getShowStartDate,
  isShowBookable
};
