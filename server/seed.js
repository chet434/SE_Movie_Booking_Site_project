const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Movie = require('./models/Movie');
const Theatre = require('./models/Theatre');
const Show = require('./models/Show');
const Location = require('./models/Location');
const City = require('./models/City');

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
    await Location.deleteMany({});
    await City.deleteMany({});
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
        slug: 'avengers-endgame',
        poster: '/img/AvengerEndgame.jpeg',
        backdrop: '/img/AvengerEndgame.jpeg',
        description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse the actions of Thanos and restore balance.',
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        language: 'English',
        languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
        formats: ['2D', '3D', 'IMAX 3D'],
        duration: '3h 1m',
        durationMinutes: 181,
        certification: 'UA',
        rating: 8.4,
        avgRating: 8.4,
        votes: '1.2M+ Votes',
        likes: '940K+ Likes',
        releaseDate: new Date('2019-04-26'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Robert Downey Jr.', role: 'Tony Stark / Iron Man' },
          { name: 'Chris Evans', role: 'Steve Rogers / Captain America' },
          { name: 'Mark Ruffalo', role: 'Bruce Banner / Hulk' },
          { name: 'Chris Hemsworth', role: 'Thor' },
          { name: 'Scarlett Johansson', role: 'Natasha Romanoff / Black Widow' }
        ],
        crew: [
          { name: 'Anthony Russo', role: 'Director' },
          { name: 'Joe Russo', role: 'Director' },
          { name: 'Kevin Feige', role: 'Producer' }
        ]
      },
      {
        title: 'Pushpa 2: The Rule',
        slug: 'pushpa-2-the-rule',
        poster: '/posters/pushpa-2-the-rule.jpg',
        backdrop: '/posters/pushpa-2-the-rule.jpg',
        description: 'Pushpa Raj returns with his red sandalwood smuggling empire, facing new enemies and old rivalries in this action-packed sequel.',
        genre: ['Action', 'Drama', 'Thriller'],
        genres: ['Action', 'Drama', 'Thriller'],
        language: 'Telugu',
        languages: ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam'],
        formats: ['2D', '3D', 'IMAX 3D'],
        duration: '3h 20m',
        durationMinutes: 200,
        certification: 'UA16+',
        rating: 8.6,
        avgRating: 8.6,
        votes: '385K+ Votes',
        likes: '950K+ Likes',
        releaseDate: new Date('2024-12-05'),
        trailerUrl: 'https://www.youtube.com/watch?v=Q1NKMPhP8PY',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Allu Arjun', role: 'Pushpa Raj' },
          { name: 'Rashmika Mandanna', role: 'Srivalli' },
          { name: 'Fahadh Faasil', role: 'Bhanwar Singh Shekhawat' },
          { name: 'Jagapathi Babu', role: 'Mangalam Srinu' }
        ],
        crew: [
          { name: 'Sukumar', role: 'Director & Writer' },
          { name: 'Devi Sri Prasad', role: 'Music Director' },
          { name: 'Naveen Yerneni', role: 'Producer' }
        ]
      },
      {
        title: 'Stree 2',
        slug: 'stree-2',
        poster: '/img/Stree 2.jpeg',
        backdrop: '/img/Stree 2.jpeg',
        description: 'The hilarious gang returns to face a new supernatural threat in their small town, combining comedy with horror in this entertaining sequel.',
        genre: ['Comedy', 'Horror'],
        genres: ['Comedy', 'Horror'],
        language: 'Hindi',
        languages: ['Hindi'],
        formats: ['2D'],
        duration: '2h 27m',
        durationMinutes: 147,
        certification: 'UA',
        rating: 7.5,
        avgRating: 7.5,
        votes: '180K+ Votes',
        likes: '620K+ Likes',
        releaseDate: new Date('2024-08-15'),
        trailerUrl: 'https://www.youtube.com/watch?v=R5qZbJa2RcQ',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Rajkummar Rao', role: 'Vicky' },
          { name: 'Shraddha Kapoor', role: 'The Girl' },
          { name: 'Pankaj Tripathi', role: 'Rudra' },
          { name: 'Abhishek Banerjee', role: 'Jana' },
          { name: 'Aparshakti Khurana', role: 'Bittu' }
        ],
        crew: [
          { name: 'Amar Kaushik', role: 'Director' },
          { name: 'Niren Bhatt', role: 'Writer' },
          { name: 'Dinesh Vijan', role: 'Producer' }
        ]
      },
      {
        title: 'Inception',
        slug: 'inception',
        poster: '/posters/inception.jpg',
        backdrop: '/posters/inception.jpg',
        description: 'A skilled thief who steals secrets from deep within the subconscious during dream states is given a final chance at redemption through an act of inception.',
        genre: ['Action', 'Sci-Fi', 'Thriller'],
        genres: ['Action', 'Sci-Fi', 'Thriller'],
        language: 'English',
        languages: ['English', 'Hindi'],
        formats: ['2D', 'IMAX 2D'],
        duration: '2h 28m',
        durationMinutes: 148,
        certification: 'UA',
        rating: 8.8,
        avgRating: 8.8,
        votes: '2.4M+ Votes',
        likes: '980K+ Likes',
        releaseDate: new Date('2010-07-16'),
        trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Leonardo DiCaprio', role: 'Dom Cobb' },
          { name: 'Joseph Gordon-Levitt', role: 'Arthur' },
          { name: 'Elliot Page', role: 'Ariadne' },
          { name: 'Tom Hardy', role: 'Eames' },
          { name: 'Ken Watanabe', role: 'Saito' }
        ],
        crew: [
          { name: 'Christopher Nolan', role: 'Director & Writer' },
          { name: 'Hans Zimmer', role: 'Composer' },
          { name: 'Emma Thomas', role: 'Producer' }
        ]
      },
      {
        title: 'RRR',
        slug: 'rrr',
        poster: '/img/RRR.jpeg',
        backdrop: '/img/RRR.jpeg',
        description: 'A fictitious story about two legendary revolutionaries and their journey away from home before they started fighting for their country.',
        genre: ['Action', 'Drama'],
        genres: ['Action', 'Drama'],
        language: 'Telugu',
        languages: ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam'],
        formats: ['2D', '3D', 'IMAX 3D'],
        duration: '3h 7m',
        durationMinutes: 187,
        certification: 'UA',
        rating: 7.8,
        avgRating: 7.8,
        votes: '320K+ Votes',
        likes: '810K+ Likes',
        releaseDate: new Date('2022-03-25'),
        trailerUrl: 'https://www.youtube.com/watch?v=f_vbAtFSEc0',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'N.T. Rama Rao Jr.', role: 'Komaram Bheem' },
          { name: 'Ram Charan', role: 'Alluri Sitarama Raju' },
          { name: 'Ajay Devgn', role: 'Venkata Rama Raju' },
          { name: 'Alia Bhatt', role: 'Sita' }
        ],
        crew: [
          { name: 'S.S. Rajamouli', role: 'Director & Story' },
          { name: 'M.M. Keeravani', role: 'Music Director' },
          { name: 'D.V.V. Danayya', role: 'Producer' }
        ]
      },
      {
        title: 'Jawan',
        slug: 'jawan',
        poster: '/img/Jawan.jpeg',
        backdrop: '/img/Jawan.jpeg',
        description: 'A man driven by a personal vendetta sets out to rectify the wrongs in society in this high-octane action thriller.',
        genre: ['Action', 'Thriller'],
        genres: ['Action', 'Thriller'],
        language: 'Hindi',
        languages: ['Hindi', 'Tamil', 'Telugu'],
        formats: ['2D', 'IMAX 2D'],
        duration: '2h 49m',
        durationMinutes: 169,
        certification: 'UA',
        rating: 7.1,
        avgRating: 7.1,
        votes: '290K+ Votes',
        likes: '750K+ Likes',
        releaseDate: new Date('2023-09-07'),
        trailerUrl: 'https://www.youtube.com/watch?v=MWOlF3XpiI0',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Shah Rukh Khan', role: 'Vikram Rathore / Azad' },
          { name: 'Nayanthara', role: 'Narmada Rai' },
          { name: 'Vijay Sethupathi', role: 'Kaalie Gaikwad' },
          { name: 'Deepika Padukone', role: 'Aishwarya Rathore' }
        ],
        crew: [
          { name: 'Atlee', role: 'Director & Writer' },
          { name: 'Anirudh Ravichander', role: 'Music Director' },
          { name: 'Gauri Khan', role: 'Producer' }
        ]
      },
      {
        title: 'The Dark Knight',
        slug: 'the-dark-knight',
        poster: '/posters/the-dark-knight.jpg',
        backdrop: '/posters/the-dark-knight.jpg',
        description: 'When the menace known as the Joker wreaks havoc on Gotham, Batman must face one of the greatest tests of his ability to fight injustice.',
        genre: ['Action', 'Crime', 'Drama'],
        genres: ['Action', 'Crime', 'Drama'],
        language: 'English',
        languages: ['English', 'Hindi'],
        formats: ['2D', 'IMAX 2D'],
        duration: '2h 32m',
        durationMinutes: 152,
        certification: 'UA',
        rating: 9.0,
        avgRating: 9.0,
        votes: '2.8M+ Votes',
        likes: '1.2M+ Likes',
        releaseDate: new Date('2008-07-18'),
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Christian Bale', role: 'Bruce Wayne / Batman' },
          { name: 'Heath Ledger', role: 'Joker' },
          { name: 'Aaron Eckhart', role: 'Harvey Dent' },
          { name: 'Michael Caine', role: 'Alfred' },
          { name: 'Gary Oldman', role: 'Jim Gordon' }
        ],
        crew: [
          { name: 'Christopher Nolan', role: 'Director & Writer' },
          { name: 'Hans Zimmer', role: 'Composer' },
          { name: 'Emma Thomas', role: 'Producer' }
        ]
      },
      {
        title: 'KGF Chapter 2',
        slug: 'kgf-chapter-2',
        poster: '/img/KGF.jpeg',
        backdrop: '/img/KGF.jpeg',
        description: 'Rocky, the ruling king of the Kolar Gold Fields, faces new challenges from enemies and the government while trying to fulfill a promise made to his mother.',
        genre: ['Action', 'Crime', 'Drama'],
        genres: ['Action', 'Crime', 'Drama'],
        language: 'Kannada',
        languages: ['Kannada', 'Hindi', 'Telugu', 'Tamil', 'Malayalam'],
        formats: ['2D', 'IMAX 2D'],
        duration: '2h 48m',
        durationMinutes: 168,
        certification: 'UA',
        rating: 8.4,
        avgRating: 8.4,
        votes: '450K+ Votes',
        likes: '890K+ Likes',
        releaseDate: new Date('2022-04-14'),
        trailerUrl: 'https://www.youtube.com/watch?v=JKa05nyUmuQ',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Yash', role: 'Rocky' },
          { name: 'Sanjay Dutt', role: 'Adheera' },
          { name: 'Raveena Tandon', role: 'Ramika Sen' },
          { name: 'Srinidhi Shetty', role: 'Reena Desai' }
        ],
        crew: [
          { name: 'Prashanth Neel', role: 'Director & Writer' },
          { name: 'Ravi Basrur', role: 'Music Director' },
          { name: 'Vijay Kiragandur', role: 'Producer' }
        ]
      },
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
        formats: ['2D', '3D', 'IMAX 3D'],
        duration: '3h 15m',
        durationMinutes: 195,
        certification: 'U',
        rating: 9.2,
        avgRating: 9.2,
        votes: '140.4K+ Votes',
        likes: '350K+ Likes',
        releaseDate: new Date('2026-11-20'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Ranbir Kapoor', role: 'Lord Rama' },
          { name: 'Sai Pallavi', role: 'Sita' },
          { name: 'Yash', role: 'Ravana' },
          { name: 'Sunny Deol', role: 'Lord Hanuman' }
        ],
        crew: [
          { name: 'Nitesh Tiwari', role: 'Director' },
          { name: 'Namit Malhotra', role: 'Producer' },
          { name: 'Hans Zimmer', role: 'Music Director' }
        ]
      },
      {
        title: 'Avengers: Doomsday',
        slug: 'avengers-doomsday',
        poster: '/img/movies/doomsday_poster.webp',
        backdrop: '/img/movies/doomsday_backdrop.jpg',
        description: 'Earth’s mightiest heroes clash against Victor Von Doom in an unprecedented multiversal showdown directed by Anthony and Joe Russo.',
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        language: 'English',
        languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
        formats: ['2D', '3D', 'IMAX 3D'],
        duration: '2h 50m',
        durationMinutes: 170,
        certification: 'UA',
        rating: 9.4,
        avgRating: 9.4,
        votes: '210.8K+ Votes',
        likes: '500K+ Likes',
        releaseDate: new Date('2026-12-18'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Robert Downey Jr.', role: 'Victor Von Doom / Doctor Doom' },
          { name: 'Pedro Pascal', role: 'Reed Richards / Mr. Fantastic' },
          { name: 'Florence Pugh', role: 'Yelena Belova' }
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
        description: 'Post-war Japan faces devastating colossal destruction as the titan emerges from the Pacific abyss stronger than ever.',
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        language: 'Japanese',
        languages: ['Japanese', 'English', 'Hindi'],
        formats: ['2D', '4DX', 'IMAX 2D'],
        duration: '2h 05m',
        durationMinutes: 125,
        certification: 'UA',
        rating: 8.9,
        avgRating: 8.9,
        votes: '64.2K+ Votes',
        likes: '190K+ Likes',
        releaseDate: new Date('2026-11-25'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Ryunosuke Kamiki', role: 'Koichi Shikishima' },
          { name: 'Minami Hamabe', role: 'Noriko Oishi' }
        ],
        crew: [
          { name: 'Takashi Yamazaki', role: 'Director, Writer & VFX' },
          { name: 'Naoki Sato', role: 'Composer' }
        ]
      },
      {
        title: 'O.M: Operation Mole',
        slug: 'om-operation-mole',
        poster: '/img/movies/om_poster.webp',
        backdrop: '/img/movies/om_backdrop.jpg',
        description: 'An elite raw operative goes dark deep behind enemy lines in an adrenaline-pumping espionage warfare.',
        genre: ['Action', 'Thriller'],
        genres: ['Action', 'Thriller'],
        language: 'Hindi',
        languages: ['Hindi', 'Tamil', 'Telugu'],
        formats: ['2D', 'IMAX 2D'],
        duration: '2h 45m',
        durationMinutes: 165,
        certification: 'UA',
        rating: 8.2,
        avgRating: 8.2,
        votes: '35.1K+ Votes',
        likes: '95K+ Likes',
        releaseDate: new Date('2026-12-04'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Vidyut Jammwal', role: 'Captain Arjun' },
          { name: 'Nora Fatehi', role: 'Zoya' }
        ],
        crew: [
          { name: 'Aditya Datt', role: 'Director' }
        ]
      },
      {
        title: 'Gunmaaster G9',
        slug: 'gunmaaster-g9',
        poster: '/img/movies/gunmaaster_poster.webp',
        backdrop: '/img/movies/gunmaaster_poster.webp',
        description: 'A high-octane espionage action thriller featuring Special Agent Gunmaaster G9 on a covert mission across continents to neutralize an international threat.',
        genre: ['Action', 'Romantic', 'Thriller'],
        genres: ['Action', 'Romantic', 'Thriller'],
        language: 'Odia',
        languages: ['Odia', 'Hindi'],
        formats: ['2D'],
        duration: '2h 28m',
        durationMinutes: 148,
        certification: 'UA',
        rating: 8.5,
        avgRating: 8.5,
        votes: '18.4K+ Votes',
        likes: '45K+ Likes',
        releaseDate: new Date('2026-11-20'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Swaraj Barik', role: 'Gunmaaster G9' },
          { name: 'Elina Samantray', role: 'Riya' },
          { name: 'Manoj Mishra', role: 'Vikram' }
        ],
        crew: [
          { name: 'Ashok Pati', role: 'Director' },
          { name: 'Abhijit Majumdar', role: 'Music Director' },
          { name: 'Tarang Cine Productions', role: 'Producer' }
        ]
      },
      {
        title: 'Kankana',
        slug: 'kankana',
        poster: '/img/movies/kankana_poster.webp',
        backdrop: '/img/movies/kankana_poster.webp',
        description: 'An ancient folklore mystery that uncovers hidden curses and forgotten prophecies in a rural kingdom.',
        genre: ['Fantasy', 'Horror', 'Thriller'],
        genres: ['Fantasy', 'Horror', 'Thriller'],
        language: 'Odia',
        languages: ['Odia'],
        formats: ['2D'],
        duration: '2h 15m',
        durationMinutes: 135,
        certification: 'UA',
        rating: 8.1,
        avgRating: 8.1,
        votes: '12.8K+ Votes',
        likes: '32K+ Likes',
        releaseDate: new Date('2026-11-22'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        status: 'now-showing',
        isActive: true,
        cast: [
          { name: 'Sabyasachi Mishra', role: 'Rudra' },
          { name: 'Archita Sahu', role: 'Kankana' },
          { name: 'Mihir Das', role: 'Guruji' }
        ],
        crew: [
          { name: 'Sanjay Nayak', role: 'Director' },
          { name: 'Prem Anand', role: 'Music Director' },
          { name: 'Sarthak Films', role: 'Producer' }
        ]
      },
      {
        title: 'The Hunger Games: Sunrise on the Reaping',
        slug: 'the-hunger-games-sunrise-on-the-reaping',
        poster: '/posters/the-hunger-games-sunrise-on-the-reaping.jpg',
        backdrop: '/posters/the-hunger-games-sunrise-on-the-reaping-backdrop.jpg',
        description: 'As the 50th Hunger Games (the Second Quarter Quell) approaches, twenty-four tributes are summoned to the Capitol, including young Haymitch Abernathy from District 12.',
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        language: 'English',
        languages: ['English', 'Hindi'],
        formats: ['2D', '3D', 'IMAX 2D'],
        duration: '2h 25m',
        durationMinutes: 145,
        certification: 'UA16+',
        rating: 8.8,
        avgRating: 8.8,
        votes: '14.2K+ Votes',
        likes: '85K+ Likes',
        isReRelease: false,
        releaseDate: new Date('2026-11-20'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        cast: [
          { name: 'Joseph Quinn', role: 'Haymitch Abernathy' },
          { name: 'Elle Fanning', role: 'Maysilee Donner' },
          { name: 'Ralph Fiennes', role: 'President Snow' }
        ],
        crew: [
          { name: 'Francis Lawrence', role: 'Director' },
          { name: 'Suzanne Collins', role: 'Writer' }
        ],
        status: 'now-showing',
        isActive: true
      },
      {
        title: 'Drishyam: The Conclusion',
        slug: 'drishyam-the-conclusion',
        poster: '/posters/drishyam-the-conclusion.jpg',
        backdrop: '/posters/drishyam-the-conclusion-backdrop.jpg',
        description: 'The final chapter in the Georgekutty saga. Seven years after the fateful incident, the case is reopened with forensic breakthroughs, forcing Georgekutty to play his ultimate game of protection.',
        genre: ['Crime', 'Drama', 'Mystery', 'Thriller'],
        genres: ['Crime', 'Drama', 'Mystery', 'Thriller'],
        language: 'Malayalam',
        languages: ['Malayalam', 'Hindi', 'Tamil', 'Telugu'],
        formats: ['2D'],
        duration: '2h 42m',
        durationMinutes: 162,
        certification: 'UA',
        rating: 9.1,
        avgRating: 9.1,
        votes: '68.5K+ Votes',
        likes: '210K+ Likes',
        isReRelease: false,
        releaseDate: new Date('2026-10-02'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        cast: [
          { name: 'Mohanlal', role: 'Georgekutty' },
          { name: 'Meena', role: 'Rani George' },
          { name: 'Ansiba Hassan', role: 'Anju George' },
          { name: 'Murali Gopy', role: 'Thomas Bastin IPS' }
        ],
        crew: [
          { name: 'Jeethu Joseph', role: 'Director & Writer' },
          { name: 'Antony Perumbavoor', role: 'Producer' }
        ],
        status: 'now-showing',
        isActive: true
      },
      {
        title: 'Jailer 2',
        slug: 'jailer-2',
        poster: '/posters/jailer-2.jpg',
        backdrop: '/posters/jailer-2-backdrop.jpg',
        description: 'Tiger Muthuvel Pandian is drawn out of retirement once more as an international syndicate threatens the legacy he fought blood and iron to protect.',
        genre: ['Action', 'Crime', 'Thriller'],
        genres: ['Action', 'Crime', 'Thriller'],
        language: 'Tamil',
        languages: ['Tamil', 'Telugu', 'Hindi', 'Kannada'],
        formats: ['2D', 'IMAX 2D'],
        duration: '2h 48m',
        durationMinutes: 168,
        certification: 'UA16+',
        rating: 8.9,
        avgRating: 8.9,
        votes: '92.1K+ Votes',
        likes: '450K+ Likes',
        isReRelease: false,
        releaseDate: new Date('2026-08-14'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        cast: [
          { name: 'Rajinikanth', role: 'Tiger Muthuvel Pandian' },
          { name: 'Mohanlal', role: 'Mathew' },
          { name: 'Shiva Rajkumar', role: 'Narasimha' },
          { name: 'Ramya Krishnan', role: 'Vijaya Pandian' }
        ],
        crew: [
          { name: 'Nelson Dilipkumar', role: 'Director & Writer' },
          { name: 'Anirudh Ravichander', role: 'Music Director' },
          { name: 'Kalanithi Maran', role: 'Producer' }
        ],
        status: 'now-showing',
        isActive: true
      },
      {
        title: 'The Odyssey',
        slug: 'the-odyssey-2026',
        poster: '/posters/the-odyssey-2026.jpg',
        backdrop: '/posters/the-odyssey-2026-backdrop.jpg',
        description: 'Homer’s ancient epic brought to monumental cinematic life. King Odysseus embarks on his perilous decade-long journey home to Ithaca after the fall of Troy, confronting mythical beasts and wrathful gods.',
        genre: ['Action', 'Adventure', 'Drama', 'Fantasy'],
        genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
        language: 'English',
        languages: ['English', 'Hindi', 'Tamil'],
        formats: ['2D', '3D', 'IMAX 3D', '4DX'],
        duration: '2h 55m',
        durationMinutes: 175,
        certification: 'UA16+',
        rating: 8.7,
        avgRating: 8.7,
        votes: '31.4K+ Votes',
        likes: '120K+ Likes',
        isReRelease: false,
        releaseDate: new Date('2026-07-17'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        cast: [
          { name: 'Ralph Fiennes', role: 'Odysseus' },
          { name: 'Juliette Binoche', role: 'Penelope' },
          { name: 'Charlie Plummer', role: 'Telemachus' }
        ],
        crew: [
          { name: 'Uberto Pasolini', role: 'Director' },
          { name: 'John Collee', role: 'Writer' }
        ],
        status: 'now-showing',
        isActive: true
      },
      {
        title: 'Dune: Part Three',
        slug: 'dune-part-three',
        poster: '/posters/dune-part-three.jpg',
        backdrop: '/posters/dune-part-three-backdrop.jpg',
        description: 'Denis Villeneuve concludes Paul Atreides’ tragic destiny as Emperor of the Known Universe, facing the terrifying holy war waged in his name across a galaxy of trillions.',
        genre: ['Action', 'Adventure', 'Drama', 'Sci-Fi'],
        genres: ['Action', 'Adventure', 'Drama', 'Sci-Fi'],
        language: 'English',
        languages: ['English', 'Hindi'],
        formats: ['2D', 'IMAX 2D', 'IMAX 3D'],
        duration: '2h 50m',
        durationMinutes: 170,
        certification: 'UA16+',
        rating: 0,
        avgRating: 0,
        votes: '',
        likes: '780K+ Likes',
        isReRelease: false,
        releaseDate: new Date('2026-12-18'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        cast: [
          { name: 'Timothée Chalamet', role: 'Paul Atreides' },
          { name: 'Zendaya', role: 'Chani' },
          { name: 'Florence Pugh', role: 'Princess Irulan' },
          { name: 'Anya Taylor-Joy', role: 'Alia Atreides' }
        ],
        crew: [
          { name: 'Denis Villeneuve', role: 'Director & Co-Writer' },
          { name: 'Jon Spaihts', role: 'Co-Writer' },
          { name: 'Hans Zimmer', role: 'Composer' }
        ],
        status: 'coming-soon',
        isActive: true
      },
      {
        title: 'King',
        slug: 'king-2026',
        poster: '/posters/king-2026.jpg',
        backdrop: '/posters/king-2026-backdrop.jpg',
        description: 'A stylish, ruthless underworld operative is forced back into the kill zone when his estranged protégé becomes marked for elimination by a shadowy syndicate.',
        genre: ['Action', 'Crime', 'Thriller'],
        genres: ['Action', 'Crime', 'Thriller'],
        language: 'Hindi',
        languages: ['Hindi', 'Tamil', 'Telugu'],
        formats: ['2D', 'IMAX 2D'],
        duration: '2h 35m',
        durationMinutes: 155,
        certification: 'UA16+',
        rating: 0,
        avgRating: 0,
        votes: '',
        likes: '620K+ Likes',
        isReRelease: false,
        releaseDate: new Date('2026-12-25'),
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        cast: [
          { name: 'Shah Rukh Khan', role: 'King' },
          { name: 'Suhana Khan', role: 'Protégé' },
          { name: 'Abhishek Bachchan', role: 'Antagonist' }
        ],
        crew: [
          { name: 'Sujoy Ghosh', role: 'Director' },
          { name: 'Siddharth Anand', role: 'Producer' },
          { name: 'Anirudh Ravichander', role: 'Music Director' }
        ],
        status: 'coming-soon',
        isActive: true
      }
    ]);

    console.log(`✓ ${movies.length} movies created`);

    // ===== CITIES & LOCATIONS =====
    const citiesData = [
      { name: 'Bhubaneswar', slug: 'bhubaneswar', state: 'Odisha', coordinates: { type: 'Point', coordinates: [85.8245, 20.2961] } },
      { name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra', coordinates: { type: 'Point', coordinates: [72.8777, 19.0760] } },
      { name: 'Delhi-NCR', slug: 'delhi-ncr', state: 'Delhi', coordinates: { type: 'Point', coordinates: [77.2090, 28.6139] } },
      { name: 'Bengaluru', slug: 'bengaluru', state: 'Karnataka', coordinates: { type: 'Point', coordinates: [77.5946, 12.9716] } },
      { name: 'Hyderabad', slug: 'hyderabad', state: 'Telangana', coordinates: { type: 'Point', coordinates: [78.4867, 17.3850] } },
      { name: 'Chandigarh', slug: 'chandigarh', state: 'Chandigarh', coordinates: { type: 'Point', coordinates: [76.7794, 30.7333] } },
      { name: 'Ahmedabad', slug: 'ahmedabad', state: 'Gujarat', coordinates: { type: 'Point', coordinates: [72.5714, 23.0225] } },
      { name: 'Pune', slug: 'pune', state: 'Maharashtra', coordinates: { type: 'Point', coordinates: [73.8567, 18.5204] } },
      { name: 'Chennai', slug: 'chennai', state: 'Tamil Nadu', coordinates: { type: 'Point', coordinates: [80.2707, 13.0827] } },
      { name: 'Kolkata', slug: 'kolkata', state: 'West Bengal', coordinates: { type: 'Point', coordinates: [88.3639, 22.5726] } },
      { name: 'Kochi', slug: 'kochi', state: 'Kerala', coordinates: { type: 'Point', coordinates: [76.2673, 9.9312] } }
    ];

    const cities = await City.insertMany(citiesData);
    console.log(`✓ ${cities.length} cities created with coordinates`);

    const cityMap = {};
    cities.forEach(c => {
      cityMap[c.name] = c._id;
      cityMap[c.slug] = c._id;
    });

    const locations = await Location.insertMany([
      { name: 'Mumbai' },
      { name: 'Delhi' },
      { name: 'Pune' },
      { name: 'Hyderabad' },
      { name: 'Bangalore' },
      { name: 'Bhubaneswar' }
    ]);
    console.log(`✓ ${locations.length} locations created`);

    // ===== THEATRES =====
    const theatres = await Theatre.insertMany([
      {
        name: 'PVR Cinemas',
        city: cityMap['Mumbai'],
        location: 'Mumbai',
        address: 'Phoenix Mall, Lower Parel',
        cancellationAllowed: true,
        cancellationFeePercent: 20,
        cancellationCutoffMinutes: 120,
        screens: [
          { screenName: 'Screen 1', totalSeats: 48, rows: 6, seatsPerRow: 8 },
          { screenName: 'Screen 2', totalSeats: 48, rows: 6, seatsPerRow: 8 }
        ]
      },
      {
        name: 'INOX',
        city: cityMap['Mumbai'],
        location: 'Mumbai',
        address: 'R-City Mall, Ghatkopar',
        cancellationAllowed: true,
        cancellationFeePercent: 20,
        cancellationCutoffMinutes: 120,
        screens: [
          { screenName: 'Screen 1', totalSeats: 48, rows: 6, seatsPerRow: 8 },
          { screenName: 'Screen 2', totalSeats: 48, rows: 6, seatsPerRow: 8 }
        ]
      },
      {
        name: 'Cinepolis',
        city: cityMap['Delhi-NCR'],
        location: 'Delhi-NCR',
        address: 'DLF Place, Saket',
        cancellationAllowed: false,
        cancellationFeePercent: 20,
        cancellationCutoffMinutes: 120,
        screens: [
          { screenName: 'Screen 1', totalSeats: 48, rows: 6, seatsPerRow: 8 },
          { screenName: 'Screen 2', totalSeats: 48, rows: 6, seatsPerRow: 8 }
        ]
      },
      {
        name: 'PVR IMAX',
        city: cityMap['Pune'],
        location: 'Pune',
        address: 'Phoenix Market City, Viman Nagar',
        cancellationAllowed: true,
        cancellationFeePercent: 20,
        cancellationCutoffMinutes: 120,
        screens: [
          { screenName: 'IMAX', totalSeats: 48, rows: 6, seatsPerRow: 8 },
          { screenName: 'Screen 2', totalSeats: 48, rows: 6, seatsPerRow: 8 }
        ]
      },
      {
        name: 'AMB Cinemas',
        city: cityMap['Hyderabad'],
        location: 'Hyderabad',
        address: 'Sarath City Capital Mall, Gachibowli',
        cancellationAllowed: false,
        cancellationFeePercent: 20,
        cancellationCutoffMinutes: 120,
        screens: [
          { screenName: 'Screen 1', totalSeats: 48, rows: 6, seatsPerRow: 8 },
          { screenName: 'Screen 2', totalSeats: 48, rows: 6, seatsPerRow: 8 }
        ]
      },
      {
        name: 'Cinepolis: Nexus Esplanade',
        city: cityMap['Bhubaneswar'],
        location: 'Bhubaneswar',
        address: 'Nexus Esplanade, Rasulgarh',
        cancellationAllowed: true,
        cancellationFeePercent: 20,
        cancellationCutoffMinutes: 120,
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
