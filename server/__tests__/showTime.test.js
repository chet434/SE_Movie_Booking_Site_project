const {
  parseISTShowTime,
  getShowStartDate,
  isShowBookable,
  getISTCalendarDateString
} = require('../utils/showTime');

describe('Showtime Helper & Expiration Logic', () => {
  describe('parseISTShowTime', () => {
    test('parses 08:30 PM IST correctly into UTC date', () => {
      const dt = parseISTShowTime('2026-11-25', '08:30 PM');
      // 8:30 PM IST is 20:30 IST -> 15:00 UTC
      expect(dt.toISOString()).toBe('2026-11-25T15:00:00.000Z');
      expect(dt.getUTCHours()).toBe(15);
      expect(dt.getUTCMinutes()).toBe(0);
    });

    test('parses 10:30 AM IST correctly into UTC date', () => {
      const dt = parseISTShowTime('2026-11-25', '10:30 AM');
      // 10:30 AM IST is 05:00 UTC
      expect(dt.toISOString()).toBe('2026-11-25T05:00:00.000Z');
      expect(dt.getUTCHours()).toBe(5);
      expect(dt.getUTCMinutes()).toBe(0);
    });
  });

  describe('getShowStartDate', () => {
    test('uses aligned startsAt when available', () => {
      const aligned = new Date('2026-11-25T15:00:00.000Z');
      const show = {
        date: new Date('2026-11-25T00:00:00.000Z'),
        startTime: '08:30 PM',
        startsAt: aligned
      };
      const result = getShowStartDate(show);
      expect(result.toISOString()).toBe('2026-11-25T15:00:00.000Z');
    });

    test('recalculates startsAt when missing or drifted from startTime', () => {
      // Drifted UTC midnight saved as startsAt (common bug)
      const drifted = new Date('2026-11-25T00:00:00.000Z');
      const show = {
        date: new Date('2026-11-25T00:00:00.000Z'),
        startTime: '08:30 PM',
        startsAt: drifted
      };
      const result = getShowStartDate(show);
      // Corrected to 8:30 PM IST (15:00 UTC)
      expect(result.toISOString()).toBe('2026-11-25T15:00:00.000Z');
    });
  });

  describe('isShowBookable', () => {
    test('returns true for future showtimes', () => {
      const futureShow = {
        startsAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour in future
      };
      expect(isShowBookable(futureShow)).toBe(true);
    });

    test('returns false for past showtimes (immediate cutoff)', () => {
      const pastShow = {
        startsAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes in past
      };
      expect(isShowBookable(pastShow)).toBe(false);
    });

    test('respects custom cutoffMinutes when provided', () => {
      const now = new Date();
      const soonShow = {
        startsAt: new Date(now.getTime() + 15 * 60 * 1000) // in 15 mins
      };
      // With 30 min cutoff, 15 mins ahead is not bookable
      expect(isShowBookable(soonShow, now, 30)).toBe(false);
      // With 10 min cutoff, 15 mins ahead is bookable
      expect(isShowBookable(soonShow, now, 10)).toBe(true);
    });
  });

  describe('getISTCalendarDateString', () => {
    test('formats Date into YYYY-MM-DD in IST timezone', () => {
      // 2026-11-25 19:00 UTC is 2026-11-26 00:30 IST
      const d = new Date('2026-11-25T19:00:00.000Z');
      expect(getISTCalendarDateString(d)).toBe('2026-11-26');
    });
  });

  describe('Show Filtering & Cutoff Integration', () => {
    test('filters out past shows when isShowBookable is checked in a list', () => {
      const now = new Date('2026-11-25T18:00:00.000Z'); // 11:30 PM IST
      const shows = [
        {
          startTime: '08:30 PM', // 3 hours ago
          date: new Date('2026-11-25T00:00:00.000Z'),
          startsAt: new Date('2026-11-25T15:00:00.000Z')
        },
        {
          startTime: '10:30 PM', // 1 hour ago
          date: new Date('2026-11-25T00:00:00.000Z'),
          startsAt: new Date('2026-11-25T17:00:00.000Z')
        },
        {
          startTime: '10:30 AM', // Tomorrow morning
          date: new Date('2026-11-26T00:00:00.000Z'),
          startsAt: new Date('2026-11-26T05:00:00.000Z')
        }
      ];

      const upcomingShows = shows.filter(s => isShowBookable(s, now));
      expect(upcomingShows).toHaveLength(1);
      expect(upcomingShows[0].startTime).toBe('10:30 AM');
    });

    test('holdSeats rejects past show with 400 and Booking closed error message', async () => {
      const pastShow = {
        _id: 'mock-show-id',
        isActive: true,
        date: new Date('2026-11-25T00:00:00.000Z'),
        startTime: '08:30 PM',
        startsAt: new Date(Date.now() - 3600000) // 1 hour ago
      };

      const req = {
        body: {
          showId: 'mock-show-id',
          showSeatIds: ['seat-1', 'seat-2']
        },
        user: { _id: 'user-id' }
      };

      let statusCode = null;
      let jsonBody = null;
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (body) => {
              jsonBody = body;
              return body;
            }
          };
        }
      };

      // Mock Show.findById
      const Show = require('../models/Show');
      const originalFindById = Show.findById;
      Show.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(pastShow),
        then: function(resolve) { return Promise.resolve(resolve(pastShow)); }
      });

      const { holdSeats } = require('../controllers/bookingController');
      await holdSeats(req, res);

      expect(statusCode).toBe(400);
      expect(jsonBody.success).toBe(false);
      expect(jsonBody.error).toBe('Booking closed. This showtime has already started.');

      // Restore mock
      Show.findById = originalFindById;
    });
  });
});
