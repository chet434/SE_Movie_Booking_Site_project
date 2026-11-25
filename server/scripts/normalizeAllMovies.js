const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Movie = require('../models/Movie');

const movieUpdates = [
  {
    slug: 'pushpa-2-the-rule',
    title: 'Pushpa 2: The Rule',
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
    slug: 'inception',
    title: 'Inception',
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
    slug: 'the-dark-knight',
    title: 'The Dark Knight',
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
    slug: 'kgf-chapter-2',
    title: 'KGF Chapter 2',
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
    slug: 'avengers-endgame',
    title: 'Avengers: Endgame',
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
    slug: 'stree-2',
    title: 'Stree 2',
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
    slug: 'rrr',
    title: 'RRR',
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
    slug: 'jawan',
    title: 'Jawan',
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
    slug: 'gunmaaster-g9',
    title: 'Gunmaaster G9',
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
    slug: 'kankana',
    title: 'Kankana',
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
  }
];

const normalizeMovies = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-ticket-booking';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);

    for (const update of movieUpdates) {
      const res = await Movie.findOneAndUpdate(
        { slug: update.slug },
        { $set: update },
        { new: true, upsert: true }
      );
      console.log(`✓ Normalized movie: "${res.title}" (slug: ${res.slug}, status: ${res.status}, poster: ${res.poster})`);
    }

    console.log('\nAll 10 target movies normalized successfully in MongoDB!');
    process.exit(0);
  } catch (err) {
    console.error('Normalization failed:', err);
    process.exit(1);
  }
};

normalizeMovies();
