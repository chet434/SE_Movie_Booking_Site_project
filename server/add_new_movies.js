const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Movie = require('./models/Movie');
const City = require('./models/City');
const Location = require('./models/Location');
const Theatre = require('./models/Theatre');
const Show = require('./models/Show');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Ensure Bhubaneswar City & Location exist
    let bbsrCity = await City.findOne({ slug: 'bhubaneswar' });
    if (!bbsrCity) {
      bbsrCity = await City.create({
        name: 'Bhubaneswar',
        slug: 'bhubaneswar',
        country: 'India',
        timezone: 'Asia/Kolkata',
        isActive: true
      });
      console.log('✓ Created City: Bhubaneswar');
    }

    let bbsrLoc = await Location.findOne({ name: { $regex: /^bhubaneswar$/i } });
    if (!bbsrLoc) {
      bbsrLoc = await Location.create({ name: 'Bhubaneswar' });
      console.log('✓ Created Location: Bhubaneswar');
    }

    // 2. Ensure Bhubaneswar Theatres exist
    let sriyaTheatre = await Theatre.findOne({ name: { $regex: /Sriya Swati/i } });
    if (!sriyaTheatre) {
      sriyaTheatre = await Theatre.create({
        name: 'Sriya Swati Stutee Cineplexx',
        location: 'Bhubaneswar',
        city: bbsrCity._id,
        address: 'Near Master Canteen, Station Square, Bhubaneswar',
        amenities: ['Parking', 'Food Court', '3D', 'Dolby Sound'],
        screens: [
          { screenName: 'STUTEE (3D)', totalSeats: 48, rows: 6, seatsPerRow: 8 },
          { screenName: 'SWATI (2D)', totalSeats: 48, rows: 6, seatsPerRow: 8 }
        ]
      });
      console.log('✓ Created Theatre: Sriya Swati Stutee Cineplexx');
    }

    let maharajaTheatre = await Theatre.findOne({ name: { $regex: /Maharaja/i } });
    if (!maharajaTheatre) {
      maharajaTheatre = await Theatre.create({
        name: 'Maharaja (Christie 4K, DOLBY ATMOS 64 CHANNEL)',
        location: 'Bhubaneswar',
        city: bbsrCity._id,
        address: 'Acharya Vihar, NH-16, Bhubaneswar',
        amenities: ['4K Christie Projection', 'Dolby Atmos', 'Recliner Seats'],
        screens: [
          { screenName: 'AUDI 1 (4K ATMOS)', totalSeats: 48, rows: 6, seatsPerRow: 8 }
        ]
      });
      console.log('✓ Created Theatre: Maharaja');
    }

    let cinepolisBbsr = await Theatre.findOne({ name: { $regex: /Nexus Esplanade/i } });
    if (!cinepolisBbsr) {
      cinepolisBbsr = await Theatre.create({
        name: 'Cinepolis: Nexus Esplanade',
        location: 'Bhubaneswar',
        city: bbsrCity._id,
        address: 'Rasulgarh, Cuttack Road, Bhubaneswar',
        amenities: ['IMAX 3D', 'VIP Recliner', 'Gourmet Food'],
        screens: [
          { screenName: 'IMAX 1', totalSeats: 48, rows: 6, seatsPerRow: 8 },
          { screenName: 'AUDI 2', totalSeats: 48, rows: 6, seatsPerRow: 8 }
        ]
      });
      console.log('✓ Created Theatre: Cinepolis: Nexus Esplanade');
    }

    // 3. Define the movies to add / update
    const moviesData = [
      {
        title: 'Ramayana',
        slug: 'ramayana',
        poster: '/img/movies/ramayana_poster.webp',
        backdrop: '/img/movies/ramayana_backdrop.jpg',
        description: 'The immortal story of Rama and Ravana defined a culture and moved generations. A cinematic landmark reborn through the visionary direction of Nitesh Tiwari and Namit Malhotra.',
        genre: ['Action', 'Adventure', 'Drama'],
        genres: ['Action', 'Adventure', 'Drama'],
        language: 'Hindi',
        languages: ['Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'English'],
        duration: '3h 15m',
        durationMinutes: 195,
        certification: 'U',
        rating: 9.2,
        avgRating: 9.2,
        votes: '496K+',
        releaseDate: new Date('2026-11-05'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Ranbir Kapoor', role: 'as Rama', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop' },
          { name: 'Yash', role: 'as Ravana', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' },
          { name: 'Ravie Dubey', role: 'as Lakshman', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop' },
          { name: 'Sai Pallavi', role: 'as Sita', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
          { name: 'Sunny Deol', role: 'as Hanuman', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop' }
        ],
        crew: [
          { name: 'Nitesh Tiwari', role: 'Director' },
          { name: 'Namit Malhotra', role: 'Producer' },
          { name: 'A. R. Rahman', role: 'Music Composer' },
          { name: 'Hans Zimmer', role: 'Music Composer' }
        ]
      },
      {
        title: 'Avengers: Doomsday',
        slug: 'avengers-doomsday',
        poster: '/img/movies/doomsday_poster.webp',
        backdrop: '/img/movies/doomsday_backdrop.jpg',
        description: "Earth's Mightiest Heroes confront the sovereign ruler of Latveria, Victor Von Doom, in an epic multiverse collision that threatens the fabric of existence.",
        genre: ['Action', 'Adventure', 'Fantasy', 'Sci-Fi'],
        genres: ['Action', 'Adventure', 'Fantasy', 'Sci-Fi'],
        language: 'English',
        languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
        duration: '2h 50m',
        durationMinutes: 170,
        certification: 'UA',
        rating: 9.4,
        avgRating: 9.4,
        likes: '971K+ Likes',
        votes: '971K+',
        releaseDate: new Date('2026-05-01'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Robert Downey Jr.', role: 'as Doctor Doom', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
          { name: 'Pedro Pascal', role: 'as Reed Richards', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' },
          { name: 'Vanessa Kirby', role: 'as Sue Storm', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' }
        ],
        crew: [
          { name: 'Anthony Russo', role: 'Director' },
          { name: 'Joe Russo', role: 'Director' },
          { name: 'Kevin Feige', role: 'Producer' }
        ]
      },
      {
        title: 'Godzilla Minus Zero',
        slug: 'godzilla-minus-zero',
        poster: '/img/movies/godzilla_poster.webp',
        backdrop: '/img/movies/godzilla_backdrop.jpg',
        description: 'An ancient apex predator emerges from the abyss of devastation, unleashing an apocalyptic fury across a fractured nation striving to survive.',
        genre: ['Action', 'Adventure', 'Horror', 'Thriller'],
        genres: ['Action', 'Adventure', 'Horror', 'Thriller'],
        language: 'Japanese',
        languages: ['Japanese', 'English', 'Hindi'],
        duration: '2h 05m',
        durationMinutes: 125,
        certification: 'UA',
        rating: 9.0,
        avgRating: 9.0,
        votes: '5.8K+',
        releaseDate: new Date('2026-03-20'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Ryunosuke Kamiki', role: 'as Koichi Shikishima', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
          { name: 'Minami Hamabe', role: 'as Noriko Oishi', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' }
        ],
        crew: [
          { name: 'Takashi Yamazaki', role: 'Director' },
          { name: 'TOHO Studios', role: 'Production' }
        ]
      },
      {
        title: 'O.M: Operation Mole',
        slug: 'om-operation-mole',
        poster: '/img/movies/om_poster.webp',
        backdrop: '/img/movies/om_backdrop.jpg',
        description: 'Two formidable undercover operatives embark on an unprecedented mission across borders, unearthing high-stakes secrets and confronting impossible odds.',
        genre: ['Action', 'Thriller', 'Crime'],
        genres: ['Action', 'Thriller', 'Crime'],
        language: 'Tamil',
        languages: ['Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada'],
        duration: '2h 45m',
        durationMinutes: 165,
        certification: 'UA',
        rating: 8.3,
        avgRating: 8.3,
        votes: '58.3K+ Votes',
        releaseDate: new Date('2026-11-20'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Dhanush', role: 'as Agent Vikram', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop' },
          { name: 'Mammootty', role: 'as Commander David', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' }
        ],
        crew: [
          { name: 'Rajkumar Periasamy', role: 'Director' },
          { name: 'Sai Abhyankkar', role: 'Music Director' },
          { name: 'Wunderbar Films', role: 'Producer' }
        ]
      },
      {
        title: 'Gunmaaster G9',
        slug: 'gunmaaster-g9',
        poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
        description: 'A stylized spy thriller following the lethal adventures of secret agent Gunmaaster G9 across international borders.',
        genre: ['Action', 'Romantic', 'Thriller'],
        genres: ['Action', 'Romantic', 'Thriller'],
        language: 'Hindi',
        languages: ['Hindi'],
        duration: '2h 28m',
        durationMinutes: 148,
        certification: 'UA',
        rating: 8.6,
        avgRating: 8.6,
        likes: '103K+ Likes',
        votes: '103K+',
        releaseDate: new Date('2026-10-15'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        status: 'now-showing',
        isActive: true
      },
      {
        title: 'Kankana',
        slug: 'kankana',
        poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1600&auto=format&fit=crop',
        description: 'An atmospheric folklore thriller delving into sacred rituals, generational curses, and supernatural mysteries in rural Odisha.',
        genre: ['Fantasy', 'Horror', 'Thriller'],
        genres: ['Fantasy', 'Horror', 'Thriller'],
        language: 'Odia',
        languages: ['Odia'],
        duration: '2h 15m',
        durationMinutes: 135,
        certification: 'A',
        rating: 8.5,
        avgRating: 8.5,
        votes: '70+ Votes',
        releaseDate: new Date('2026-09-12'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        status: 'now-showing',
        isActive: true
      }
    ];

    const savedMovies = [];
    for (const m of moviesData) {
      let doc = await Movie.findOne({ title: m.title });
      if (doc) {
        Object.assign(doc, m);
        await doc.save();
        console.log(`✓ Updated movie: ${m.title}`);
      } else {
        doc = await Movie.create(m);
        console.log(`✓ Inserted movie: ${m.title}`);
      }
      savedMovies.push(doc);
    }

    // 4. Create shows for these movies across theatres
    const allTheatres = await Theatre.find({
      location: { $in: ['Bhubaneswar', 'Mumbai', 'Delhi'] }
    });

    const showTimes = ['10:30 AM', '01:45 PM', '05:15 PM', '08:45 PM'];
    let showsCreated = 0;

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const showDate = new Date();
      showDate.setDate(showDate.getDate() + dayOffset);
      showDate.setHours(0, 0, 0, 0);

      for (const movie of savedMovies) {
        for (const theatre of allTheatres) {
          const screen = theatre.screens?.[0]?.screenName || 'Screen 1';
          const format = movie.genre.includes('Fantasy') || movie.genre.includes('Sci-Fi') ? '3D' : '2D';

          for (const time of showTimes.slice(0, 2)) {
            // Check if show already exists
            const existing = await Show.findOne({
              movie: movie._id,
              theatre: theatre._id,
              date: showDate,
              startTime: time
            });

            if (!existing) {
              await Show.create({
                movie: movie._id,
                theatre: theatre._id,
                screenName: screen,
                date: showDate,
                startTime: time,
                format: format,
                seatPrices: {
                  regular: format === '3D' ? 220 : 160,
                  premium: format === '3D' ? 380 : 280
                },
                bookedSeats: [],
                isActive: true
              });
              showsCreated++;
            }
          }
        }
      }
    }

    console.log(`✓ Created ${showsCreated} new shows across ${allTheatres.length} theatres for the next 7 days`);
    console.log('\n🎬 Done adding movies and shows to database!');
    process.exit(0);
  } catch (err) {
    console.error('Error adding movies:', err);
    process.exit(1);
  }
};

run();
