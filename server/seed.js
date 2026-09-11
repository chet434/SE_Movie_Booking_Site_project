const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Movie = require('./models/Movie');
const Theatre = require('./models/Theatre');
const Show = require('./models/Show');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop database to clear old indexes
    await mongoose.connection.db.dropDatabase();
    console.log('Dropped database');

    // Clear existing data
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Theatre.deleteMany({});
    await Show.deleteMany({});
    console.log('Cleared existing data');

    // ===== USERS =====
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@moviebook.com',
      phone: '9999999999',
      password: 'admin123',
      role: 'admin'
    });

    const customer = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      phone: '9876543210',
      password: 'password123',
      role: 'customer'
    });

    console.log('✓ Users created (admin@moviebook.com / admin123)');

    // ===== MOVIES =====
    const movies = await Movie.insertMany([
      {
        title: 'Avengers: Endgame',
        poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9SlMiEPR16.jpg',
        description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse the actions of Thanos and restore balance.',
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        language: 'English',
        duration: '3h 1m',
        rating: 8.4,
        releaseDate: new Date('2019-04-26'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        status: 'now-showing'
      },
      {
        title: 'Pushpa 2: The Rule',
        poster: 'https://image.tmdb.org/t/p/w500/buBB5JNbG0HzDf8ATqjJSJPu0SI.jpg',
        description: 'Pushpa Raj returns with his red sandalwood smuggling empire, facing new enemies and old rivalries in this action-packed sequel.',
        genre: ['Action', 'Drama', 'Thriller'],
        language: 'Telugu',
        duration: '3h 20m',
        rating: 7.2,
        releaseDate: new Date('2024-12-05'),
        trailerUrl: 'https://www.youtube.com/watch?v=Q1NKMPhP8PY',
        status: 'now-showing'
      },
      {
        title: 'Stree 2',
        poster: 'https://image.tmdb.org/t/p/w500/vpUGQm0PzLXnqBFsmCiPjMzqM0B.jpg',
        description: 'The hilarious gang returns to face a new supernatural threat in their small town, combining comedy with horror in this entertaining sequel.',
        genre: ['Comedy', 'Horror'],
        language: 'Hindi',
        duration: '2h 30m',
        rating: 7.5,
        releaseDate: new Date('2024-08-15'),
        trailerUrl: 'https://www.youtube.com/watch?v=R5qZbJa2RcQ',
        status: 'now-showing'
      },
      {
        title: 'Inception',
        poster: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
        description: 'A skilled thief who steals secrets from deep within the subconscious during dream states is given a final chance at redemption through an act of inception.',
        genre: ['Action', 'Sci-Fi', 'Thriller'],
        language: 'English',
        duration: '2h 28m',
        rating: 8.8,
        releaseDate: new Date('2010-07-16'),
        trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        status: 'now-showing'
      },
      {
        title: 'RRR',
        poster: 'https://image.tmdb.org/t/p/w500/nEufeZYosmCkuFwSuBMYlAkPMAR.jpg',
        description: 'A fictitious story about two legendary revolutionaries and their journey away from home before they started fighting for their country.',
        genre: ['Action', 'Drama'],
        language: 'Telugu',
        duration: '3h 7m',
        rating: 7.8,
        releaseDate: new Date('2022-03-25'),
        trailerUrl: 'https://www.youtube.com/watch?v=f_vbAtFSEc0',
        status: 'now-showing'
      },
      {
        title: 'Jawan',
        poster: 'https://image.tmdb.org/t/p/w500/jCyOBbErtjBbWRjuZqhXRcwRIIu.jpg',
        description: 'A man driven by a personal vendetta sets out to rectify the wrongs in society in this high-octane action thriller.',
        genre: ['Action', 'Thriller'],
        language: 'Hindi',
        duration: '2h 49m',
        rating: 7.1,
        releaseDate: new Date('2023-09-07'),
        trailerUrl: 'https://www.youtube.com/watch?v=MWOlF3XpiI0',
        status: 'now-showing'
      },
      {
        title: 'The Dark Knight',
        poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BTUgMe1nNaD3.jpg',
        description: 'When the menace known as the Joker wreaks havoc on Gotham, Batman must face one of the greatest tests of his ability to fight injustice.',
        genre: ['Action', 'Drama', 'Thriller'],
        language: 'English',
        duration: '2h 32m',
        rating: 9.0,
        releaseDate: new Date('2008-07-18'),
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        status: 'now-showing'
      },
      {
        title: 'KGF Chapter 2',
        poster: 'https://image.tmdb.org/t/p/w500/jMBjTkkFHKMQNlrEGJxxi5cPQyP.jpg',
        description: 'Rocky, the ruling king of the Kolar Gold Fields, faces new challenges from enemies and the government while trying to fulfill a promise made to his mother.',
        genre: ['Action', 'Drama'],
        language: 'Kannada',
        duration: '2h 48m',
        rating: 7.5,
        releaseDate: new Date('2022-04-14'),
        trailerUrl: 'https://www.youtube.com/watch?v=JKa05nyUmuQ',
        status: 'coming-soon'
      }
    ]);

    console.log(`✓ ${movies.length} movies created`);

    // ===== THEATRES =====
    const theatres = await Theatre.insertMany([
      {
        name: 'PVR Cinemas',
        location: 'Mumbai',
        address: 'Phoenix Mall, Lower Parel',
        screens: [
          { screenName: 'Screen 1', totalSeats: 48, rows: 6, seatsPerRow: 8 },
          { screenName: 'Screen 2', totalSeats: 48, rows: 6, seatsPerRow: 8 }
        ]
      },
      {
        name: 'INOX',
        location: 'Mumbai',
        address: 'R-City Mall, Ghatkopar',
        screens: [
          { screenName: 'Screen 1', totalSeats: 48, rows: 6, seatsPerRow: 8 },
          { screenName: 'Screen 2', totalSeats: 48, rows: 6, seatsPerRow: 8 }
        ]
      },
      {
        name: 'Cinepolis',
        location: 'Delhi',
        address: 'DLF Place, Saket',
        screens: [
          { screenName: 'Screen 1', totalSeats: 48, rows: 6, seatsPerRow: 8 },
          { screenName: 'Screen 2', totalSeats: 48, rows: 6, seatsPerRow: 8 }
        ]
      },
      {
        name: 'PVR IMAX',
        location: 'Pune',
        address: 'Phoenix Market City, Viman Nagar',
        screens: [
          { screenName: 'IMAX', totalSeats: 48, rows: 6, seatsPerRow: 8 },
          { screenName: 'Screen 2', totalSeats: 48, rows: 6, seatsPerRow: 8 }
        ]
      },
      {
        name: 'AMB Cinemas',
        location: 'Hyderabad',
        address: 'Sarath City Capital Mall, Gachibowli',
        screens: [
          { screenName: 'Screen 1', totalSeats: 48, rows: 6, seatsPerRow: 8 },
          { screenName: 'Screen 2', totalSeats: 48, rows: 6, seatsPerRow: 8 }
        ]
      }
    ]);

    console.log(`✓ ${theatres.length} theatres created`);

    // ===== SHOWS =====
    const showTimes = ['10:00 AM', '1:30 PM', '5:00 PM', '9:00 PM'];
    const shows = [];

    // Generate shows for the next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const showDate = new Date();
      showDate.setDate(showDate.getDate() + dayOffset);
      showDate.setHours(0, 0, 0, 0);

      // Assign movies to theatres
      const assignments = [
        { movie: movies[0], theatre: theatres[0], screen: 'Screen 1', format: '2D' },
        { movie: movies[0], theatre: theatres[0], screen: 'Screen 2', format: '3D' },
        { movie: movies[1], theatre: theatres[1], screen: 'Screen 1', format: '2D' },
        { movie: movies[2], theatre: theatres[1], screen: 'Screen 2', format: '2D' },
        { movie: movies[3], theatre: theatres[2], screen: 'Screen 1', format: '2D' },
        { movie: movies[4], theatre: theatres[2], screen: 'Screen 2', format: '2D' },
        { movie: movies[5], theatre: theatres[3], screen: 'IMAX', format: '2D' },
        { movie: movies[6], theatre: theatres[3], screen: 'Screen 2', format: '2D' },
        { movie: movies[0], theatre: theatres[4], screen: 'Screen 1', format: '3D' },
        { movie: movies[3], theatre: theatres[4], screen: 'Screen 2', format: '2D' },
        // Cross-city shows
        { movie: movies[1], theatre: theatres[3], screen: 'IMAX', format: '2D' },
        { movie: movies[5], theatre: theatres[2], screen: 'Screen 1', format: '2D' }
      ];

      for (const assign of assignments) {
        // Pick 2-3 random showtimes
        const times = showTimes.slice(0, 2 + Math.floor(Math.random() * 2));
        for (const time of times) {
          shows.push({
            movie: assign.movie._id,
            theatre: assign.theatre._id,
            screenName: assign.screen,
            date: new Date(showDate),
            startTime: time,
            format: assign.format,
            seatPrices: {
              regular: assign.format === '3D' ? 200 : 150,
              premium: assign.format === '3D' ? 350 : 250
            },
            bookedSeats: [],
            isActive: true
          });
        }
      }
    }

    await Show.insertMany(shows);
    console.log(`✓ ${shows.length} shows created`);

    console.log('\n🎬 Seed complete!');
    console.log('Admin login: admin@moviebook.com / admin123');
    console.log('Customer login: rahul@gmail.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
