const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Seat = require('../models/Seat');
const Show = require('../models/Show');
const ShowSeat = require('../models/ShowSeat');

// Layout helper matching visual BookMyShow sold scheme
const isLayoutSold = (row, num) => {
  if (row === 'A') return num === 3 || num === 4 || (num >= 6 && num <= 22);
  if (row === 'B') return (num >= 6 && num <= 17);
  if (row === 'C') return (num >= 5 && num <= 17);
  if (row === 'D') return (num >= 1 && num <= 7) || (num >= 9 && num <= 14);
  if (row === 'E') return (num >= 1 && num <= 11) || (num >= 12 && num <= 15);
  if (row === 'F') return (num >= 7 && num <= 13);
  if (row === 'G') return (num >= 8 && num <= 16);
  if (row === 'H') return (num >= 8 && num <= 16);
  if (row === 'I') return num === 12 || num === 13;
  return false;
};

// Generates 304 seats per screen matching BookMyShow Royal / Club / Executive tiers
const generateLayoutSeats = (screenId) => {
  const seats = [];

  // Tier 1: ROYAL (A - H, 1 to 22) = 176 seats
  const royalRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  royalRows.forEach((row, rIdx) => {
    for (let c = 1; c <= 22; c++) {
      seats.push({
        screen: screenId,
        row,
        number: c,
        label: `${row}${String(c).padStart(2, '0')}`,
        type: 'vip',
        position: { row: rIdx, col: c - 1 },
        isActive: true
      });
    }
  });

  // Tier 2: CLUB (I - N, 1-6 and 12-21) = 96 seats
  const clubRows = ['I', 'J', 'K', 'L', 'M', 'N'];
  clubRows.forEach((row, rIdx) => {
    const nums = [1, 2, 3, 4, 5, 6, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    nums.forEach((c, cIdx) => {
      seats.push({
        screen: screenId,
        row,
        number: c,
        label: `${row}${String(c).padStart(2, '0')}`,
        type: 'premium',
        position: { row: rIdx + 8, col: cIdx },
        isActive: true
      });
    });
  });

  // Tier 3: EXECUTIVE (O, P, 1-6 and 12-21) = 32 seats
  const execRows = ['O', 'P'];
  execRows.forEach((row, rIdx) => {
    const nums = [1, 2, 3, 4, 5, 6, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    nums.forEach((c, cIdx) => {
      seats.push({
        screen: screenId,
        row,
        number: c,
        label: `${row}${String(c).padStart(2, '0')}`,
        type: 'regular',
        position: { row: rIdx + 14, col: cIdx },
        isActive: true
      });
    });
  });

  return seats;
};

const ensureScreensAndSeats = async (theatres) => {
  console.log('Ensuring 304-seat Screens and Seats for all theatres...');
  // Clear existing seats and screens to rebuild unified layout
  await Seat.deleteMany({});
  await Screen.deleteMany({});

  for (const theatre of theatres) {
    console.log(`Setting up screens for theatre: ${theatre.name} (${theatre.location})`);
    const screen1 = await Screen.create({
      theatre: theatre._id,
      name: 'Screen 1',
      screenNumber: 1,
      capacity: 304,
      formatCapabilities: ['2D', '3D', 'IMAX'],
      soundSystem: 'Dolby Atmos',
      isActive: true
    });
    const screen2 = await Screen.create({
      theatre: theatre._id,
      name: 'Screen 2',
      screenNumber: 2,
      capacity: 304,
      formatCapabilities: ['2D', '3D'],
      soundSystem: '7.1 Surround',
      isActive: true
    });

    const s1Seats = generateLayoutSeats(screen1._id);
    const s2Seats = generateLayoutSeats(screen2._id);
    await Seat.insertMany([...s1Seats, ...s2Seats]);
  }
};

const seedUpcomingShows = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/movie-ticket-booking';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);

    const theatres = await Theatre.find({ isActive: true });
    console.log(`Found ${theatres.length} active theatres.`);
    await ensureScreensAndSeats(theatres);

    console.log('Cleaning up existing Shows and ShowSeats...');
    await ShowSeat.deleteMany({});
    await Show.deleteMany({});

    const movies = await Movie.find({
      isActive: { $ne: false },
      status: { $in: ['now-showing', 'now_showing'] }
    });
    console.log(`Found ${movies.length} now-showing movies for scheduling.`);

    const timeSlots = [
      { time: '10:30 AM', hour: 10, minute: 30 },
      { time: '01:45 PM', hour: 13, minute: 45 },
      { time: '05:15 PM', hour: 17, minute: 15 },
      { time: '08:45 PM', hour: 20, minute: 45 }
    ];

    const pricing = {
      regular: 500,
      premium: 520,
      recliner: 650,
      vip: 650
    };

    let totalShows = 0;
    let totalShowSeats = 0;
    let movieCounter = 0;

    const now = new Date();
    // Generate shows for today + next 6 days (total 7 days)
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const showDate = new Date(now);
      showDate.setDate(now.getDate() + dayOffset);
      showDate.setHours(0, 0, 0, 0);

      for (const theatre of theatres) {
        const screens = await Screen.find({ theatre: theatre._id, isActive: true });
        if (screens.length === 0) continue;

        for (let sIdx = 0; sIdx < screens.length; sIdx++) {
          const screen = screens[sIdx];
          const seats = await Seat.find({ screen: screen._id, isActive: true });

          // Rotate through all now-showing movies smoothly
          for (let tIdx = 0; tIdx < timeSlots.length; tIdx++) {
            const slot = timeSlots[tIdx];
            const movie = movies[movieCounter % movies.length];
            movieCounter++;

            const startsAt = new Date(showDate);
            startsAt.setHours(slot.hour, slot.minute, 0, 0);

            // If day is today and time passed, adjust to future hours today
            if (dayOffset === 0 && startsAt < now) {
              startsAt.setHours(now.getHours() + 1 + tIdx, 30, 0, 0);
              slot.time = `${startsAt.getHours() % 12 || 12}:30 ${startsAt.getHours() >= 12 ? 'PM' : 'AM'}`;
            }

            const durationMinutes = movie.durationMinutes || 150;
            const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

            const format = (movie.genres || movie.genre || []).some(g => ['Action', 'Sci-Fi', 'Fantasy'].includes(g))
              ? '3D'
              : '2D';

            const showDoc = await Show.create({
              movie: movie._id,
              theatre: theatre._id,
              screen: screen._id,
              screenName: screen.name,
              date: showDate,
              startTime: slot.time,
              startsAt,
              endsAt,
              format,
              language: movie.language || 'English',
              pricing,
              seatPrices: {
                regular: pricing.regular,
                premium: pricing.premium
              },
              bookedSeats: [],
              status: 'scheduled',
              isActive: true
            });

            totalShows++;

            // Create ShowSeats for this show
            const showSeats = seats.map(seat => {
              const isSold = isLayoutSold(seat.row, seat.number);
              return {
                show: showDoc._id,
                seat: seat._id,
                label: seat.label,
                seatType: seat.type || 'regular',
                price: pricing[seat.type] || pricing.regular,
                status: isSold ? 'booked' : 'available'
              };
            });

            if (showSeats.length > 0) {
              await ShowSeat.insertMany(showSeats);
              totalShowSeats += showSeats.length;
            }
          }
        }
      }
    }

    console.log(`\n Successfully seeded ${totalShows} shows with ${totalShowSeats} ShowSeats for the next 7 days!`);

    // Verify Avengers: Doomsday specifically
    const doomsday = await Movie.findOne({ title: /Avengers: Doomsday/i });
    if (doomsday) {
      const doomsdayShows = await Show.find({ movie: doomsday._id }).populate('theatre screen').limit(3);
      console.log(`\nVerified Avengers: Doomsday (${doomsday._id}): found ${doomsdayShows.length} sample shows:`);
      for (const ds of doomsdayShows) {
        const seatCount = await ShowSeat.countDocuments({ show: ds._id });
        const availCount = await ShowSeat.countDocuments({ show: ds._id, status: 'available' });
        console.log(`- Show ID: ${ds._id} | Theatre: ${ds.theatre?.name} (${ds.theatre?.location}) | StartsAt: ${ds.startsAt?.toISOString()} | Seats: ${seatCount} (Available: ${availCount})`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Seeding upcoming shows failed:', err);
    process.exit(1);
  }
};

seedUpcomingShows();
