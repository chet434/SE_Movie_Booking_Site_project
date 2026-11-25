const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Movie = require('../models/Movie');
const Show = require('../models/Show');
const ShowSeat = require('../models/ShowSeat');

const replacementMovies = [
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
];

async function updateCatalog() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/movie-ticket-booking';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);

    // 1. Find unwanted movies: Gondhal, Pyre, Khel, Kaali Kheti, Kaali Kheli
    const unwantedFilter = {
      $or: [
        { title: { $regex: /^(Gondhal|Pyre|Khel|Kaali Kheti|Kaali Kheli)$/i } },
        { slug: { $in: ['gondhal', 'pyre', 'khel', 'kaali-kheti', 'kaali-kheli'] } }
      ]
    };

    const unwantedMovies = await Movie.find(unwantedFilter);
    console.log(`Found ${unwantedMovies.length} unwanted movie documents to remove:`, unwantedMovies.map(m => m.title));

    if (unwantedMovies.length > 0) {
      const unwantedIds = unwantedMovies.map(m => m._id);

      // Find shows linked to these movies
      const linkedShows = await Show.find({ movie: { $in: unwantedIds } });
      const linkedShowIds = linkedShows.map(s => s._id);
      console.log(`Found ${linkedShows.length} shows linked to unwanted movies.`);

      if (linkedShowIds.length > 0) {
        const deletedSeats = await ShowSeat.deleteMany({ show: { $in: linkedShowIds } });
        console.log(`✓ Deleted ${deletedSeats.deletedCount} ShowSeats linked to unwanted shows.`);

        const deletedShows = await Show.deleteMany({ _id: { $in: linkedShowIds } });
        console.log(`✓ Deleted ${deletedShows.deletedCount} Shows linked to unwanted movies.`);
      }

      const deletedMovies = await Movie.deleteMany({ _id: { $in: unwantedIds } });
      console.log(`✓ Deleted ${deletedMovies.deletedCount} unwanted movies.`);
    }

    // 2. Upsert the 6 replacement movies
    console.log('\nUpserting 6 replacement movies...');
    for (const mov of replacementMovies) {
      const existing = await Movie.findOne({ slug: mov.slug });
      if (existing) {
        Object.assign(existing, mov);
        await existing.save();
        console.log(`✓ Updated movie: "${mov.title}" (${mov.slug})`);
      } else {
        await Movie.create(mov);
        console.log(`✓ Created movie: "${mov.title}" (${mov.slug})`);
      }
    }

    console.log('\nMovie catalog update complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error updating movie catalog:', err);
    process.exit(1);
  }
}

updateCatalog();
