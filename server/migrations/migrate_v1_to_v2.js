require('dotenv').config();
const mongoose = require('mongoose');

// Models
const Location = require('../models/Location');
const City = require('../models/City');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Seat = require('../models/Seat');
const Movie = require('../models/Movie');
const Show = require('../models/Show');
const ShowSeat = require('../models/ShowSeat');
const Booking = require('../models/Booking');
const BookingSeat = require('../models/BookingSeat');
const Payment = require('../models/Payment');
const User = require('../models/User');

const migrate = async () => {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // 1. Locations -> Cities
    console.log('Migrating Locations to Cities...');
    const locations = await Location.find({});
    for (const loc of locations) {
      const slug = loc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await City.findOneAndUpdate(
        { slug },
        { 
          name: loc.name,
          slug,
          isActive: true
        },
        { upsert: true, new: true }
      );
    }

    // 2. Theatres (Update with City ref, Extract Screens)
    console.log('Migrating Theatres and extracting Screens...');
    const theatres = await Theatre.find({});
    for (const t of theatres) {
      // Find city by legacy string 'location'
      if (t.location) {
        const c = await City.findOne({ name: t.location });
        if (c) {
          t.city = c._id;
        }
      }
      
      // Address might be a string in v1. Make sure it's an object if needed, 
      // but for now we set it as mixed in schema, so let's convert if it's a string
      if (typeof t.address === 'string') {
        t.address = { line1: t.address };
      }
      
      await t.save();

      // Extract screens
      for (const s of t.screens) {
        const screenDoc = await Screen.findOneAndUpdate(
          { theatre: t._id, screenNumber: t.screens.indexOf(s) + 1 },
          {
            theatre: t._id,
            name: s.screenName,
            screenNumber: t.screens.indexOf(s) + 1,
            capacity: s.totalSeats || (s.rows * s.seatsPerRow)
          },
          { upsert: true, new: true }
        );

        // Generate Seats for this screen
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let r = 0; r < s.rows; r++) {
          const rowLetter = alphabet[r % 26];
          for (let c = 1; c <= s.seatsPerRow; c++) {
            const label = `${rowLetter}${c}`;
            let seatType = 'regular';
            if (r >= s.rows - 2) seatType = 'premium'; // Just a heuristic
            
            await Seat.findOneAndUpdate(
              { screen: screenDoc._id, label },
              {
                screen: screenDoc._id,
                row: rowLetter,
                number: c,
                label,
                type: seatType,
                position: { row: r, col: c - 1 }
              },
              { upsert: true }
            );
          }
        }
      }
    }

    // 3. Movies
    console.log('Migrating Movies...');
    const movies = await Movie.find({});
    for (const m of movies) {
      if (m.title && !m.slug) {
        m.slug = m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        m.languages = m.language ? [m.language] : [];
        m.genres = m.genre || [];
        m.durationMinutes = m.duration ? parseInt(m.duration) || 120 : 120; // fallback parsing
        m.status = m.status === 'inactive' ? 'ended' : m.status.replace('-', '_'); // now-showing -> now_showing
      }
      await m.save();
    }

    // 4. Shows and ShowSeats
    console.log('Migrating Shows and ShowSeats...');
    const shows = await Show.find({});
    for (const s of shows) {
      // Find matching screen based on screenName and theatre
      if (s.screenName && s.theatre) {
        const screenDoc = await Screen.findOne({ theatre: s.theatre, name: s.screenName });
        if (screenDoc) {
          s.screen = screenDoc._id;
        }
      }

      // Convert date/startTime to startsAt
      if (s.date && s.startTime && !s.startsAt) {
        const d = new Date(s.date);
        // parse '10:00 AM'
        const timeMatch = s.startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (timeMatch) {
          let hrs = parseInt(timeMatch[1]);
          const mins = parseInt(timeMatch[2]);
          const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
          if (ampm === 'PM' && hrs < 12) hrs += 12;
          if (ampm === 'AM' && hrs === 12) hrs = 0;
          d.setHours(hrs, mins, 0, 0);
          s.startsAt = d;
          
          // endsAt
          const m = await Movie.findById(s.movie);
          const dur = m && m.durationMinutes ? m.durationMinutes : 120;
          s.endsAt = new Date(d.getTime() + dur * 60000);
        }
      }
      
      if (!s.status) {
        s.status = s.isActive ? 'now_showing' : 'cancelled';
      }

      await s.save();

      // Generate ShowSeats
      if (s.screen) {
        const seats = await Seat.find({ screen: s.screen });
        for (const seat of seats) {
          const isBooked = s.bookedSeats && s.bookedSeats.includes(seat.label);
          await ShowSeat.findOneAndUpdate(
            { show: s._id, seat: seat._id },
            {
              show: s._id,
              seat: seat._id,
              label: seat.label,
              seatType: seat.type,
              price: s.seatPrices ? (s.seatPrices[seat.type] || s.seatPrices.regular) : 150,
              status: isBooked ? 'booked' : 'available',
              bookedAt: isBooked ? new Date() : null
            },
            { upsert: true }
          );
        }
      }
    }

    // 5. Bookings -> BookingSeats & Payments
    console.log('Migrating Bookings...');
    const bookings = await Booking.find({});
    for (const b of bookings) {
      if (!b.bookingNumber) {
        b.bookingNumber = b.bookingId || `BK-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      }
      if (!b.screen && b.screenName) {
        const screenDoc = await Screen.findOne({ theatre: b.theatre, name: b.screenName });
        if (screenDoc) {
          b.screen = screenDoc._id;
        }
      }
      b.seatsCount = b.seatNumbers ? b.seatNumbers.length : 0;
      b.subtotal = b.totalAmount - (b.convenienceFee || 20);
      b.status = b.bookingStatus; // pending, confirmed, cancelled
      
      // Snapshot
      const m = await Movie.findById(b.movie);
      const t = await Theatre.findById(b.theatre);
      const sh = await Show.findById(b.show);
      b.snapshot = {
        movieTitle: m ? m.title : '',
        theatreName: t ? t.name : '',
        screenName: b.screenName || '',
        startsAt: sh ? sh.startsAt : null,
      };
      
      await b.save();

      // Create BookingSeats
      if (b.seatNumbers && b.seatNumbers.length > 0 && b.show) {
        for (const seatLabel of b.seatNumbers) {
          const showSeat = await ShowSeat.findOne({ show: b.show, label: seatLabel });
          if (showSeat) {
            await BookingSeat.findOneAndUpdate(
              { booking: b._id, showSeat: showSeat._id },
              {
                booking: b._id,
                showSeat: showSeat._id,
                seatLabel,
                seatType: showSeat.seatType,
                price: showSeat.price
              },
              { upsert: true }
            );
          }
        }
      }

      // Create Payment if confirmed
      if (b.status === 'confirmed' || b.paymentStatus === 'paid') {
        await Payment.findOneAndUpdate(
          { orderId: b.transactionId || `MOCK-ORD-${b._id}` },
          {
            booking: b._id,
            user: b.user,
            provider: 'mock',
            orderId: b.transactionId || `MOCK-ORD-${b._id}`,
            paymentId: b.transactionId,
            amount: b.totalAmount,
            status: 'paid',
            paidAt: b.updatedAt
          },
          { upsert: true }
        );
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
