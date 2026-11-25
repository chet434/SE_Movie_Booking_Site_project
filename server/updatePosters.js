require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

const posterMap = {
  'Avengers: Endgame': '/img/AvengerEndgame.jpeg',
  'Pushpa 2: The Rule': '/img/Pushpa.jpeg',
  'Stree 2': '/img/Stree 2.jpeg',
  'RRR': '/img/RRR.jpeg',
  'Jawan': '/img/Jawan.jpeg',
  'KGF Chapter 2': '/img/KGF.jpeg',
  'Inception': '/img/dune.jpeg',
  'The Dark Knight': '/img/Dhurandar.jpeg'
};

async function updatePosters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const movies = await Movie.find({});
    
    for (let movie of movies) {
      const posterPath = posterMap[movie.title] || `/img/WhatsApp Image 2026-09-18 at 14.12.06 (1).jpeg`;
      movie.poster = posterPath;
      await movie.save();
      console.log(`Updated poster for ${movie.title} to ${posterPath}`);
    }

    console.log('Posters updated successfully!');
  } catch (error) {
    console.error('Error updating posters:', error);
  } finally {
    mongoose.disconnect();
  }
}

updatePosters();
