const mongoose = require('../node_modules/mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-ticket-booking';

const CITIES = [
  { name: 'Bhubaneswar', slug: 'bhubaneswar', state: 'Odisha', coordinates: [85.8245, 20.2961] },
  { name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra', coordinates: [72.8777, 19.0760] },
  { name: 'Delhi-NCR', slug: 'delhi-ncr', state: 'Delhi', coordinates: [77.2090, 28.6139], aliases: ['delhi'] },
  { name: 'Bengaluru', slug: 'bengaluru', state: 'Karnataka', coordinates: [77.5946, 12.9716], aliases: ['bangalore'] },
  { name: 'Hyderabad', slug: 'hyderabad', state: 'Telangana', coordinates: [78.4867, 17.3850] },
  { name: 'Chandigarh', slug: 'chandigarh', state: 'Chandigarh', coordinates: [76.7794, 30.7333] },
  { name: 'Ahmedabad', slug: 'ahmedabad', state: 'Gujarat', coordinates: [72.5714, 23.0225] },
  { name: 'Pune', slug: 'pune', state: 'Maharashtra', coordinates: [73.8567, 18.5204] },
  { name: 'Chennai', slug: 'chennai', state: 'Tamil Nadu', coordinates: [80.2707, 13.0827] },
  { name: 'Kolkata', slug: 'kolkata', state: 'West Bengal', coordinates: [88.3639, 22.5726] },
  { name: 'Kochi', slug: 'kochi', state: 'Kerala', coordinates: [76.2673, 9.9312] }
];

async function run() {
  await mongoose.connect(uri);
  const collection = mongoose.connection.db.collection('cities');

  for (const c of CITIES) {
    const orConditions = [{ slug: c.slug }, { name: c.name }];
    if (c.aliases) {
      c.aliases.forEach(a => {
        orConditions.push({ slug: a });
        orConditions.push({ name: new RegExp('^' + a + '$', 'i') });
      });
    }

    const filter = { $or: orConditions };

    const update = {
      $set: {
        name: c.name,
        slug: c.slug,
        state: c.state,
        country: 'India',
        timezone: 'Asia/Kolkata',
        coordinates: {
          type: 'Point',
          coordinates: c.coordinates
        },
        isActive: true
      }
    };

    const res = await collection.updateOne(filter, update, { upsert: true });
    console.log('Processed', c.name, res.matchedCount ? 'Updated' : 'Inserted');
  }

  // Also ensure theatres with legacy Delhi/Bangalore are updated if needed
  try {
    const delhiCity = await collection.findOne({ slug: 'delhi-ncr' });
    if (delhiCity) {
      await mongoose.connection.db.collection('theatres').updateMany(
        { $or: [{ location: 'Delhi' }, { location: 'Delhi-NCR' }] },
        { $set: { city: delhiCity._id, location: 'Delhi-NCR' } }
      );
    }
    const blrCity = await collection.findOne({ slug: 'bengaluru' });
    if (blrCity) {
      await mongoose.connection.db.collection('theatres').updateMany(
        { $or: [{ location: 'Bangalore' }, { location: 'Bengaluru' }] },
        { $set: { city: blrCity._id, location: 'Bengaluru' } }
      );
    }
  } catch (err) {
    console.warn('Theatre sync notice:', err.message);
  }

  // Create 2dsphere index
  try {
    await collection.createIndex({ coordinates: '2dsphere' });
    console.log('2dsphere index created');
  } catch (e) {
    console.warn('Index error:', e.message);
  }

  const all = await collection.find({}).toArray();
  console.log('\nTotal active cities in DB:', all.length);
  all.forEach(c => console.log(`- ${c.name} (${c.slug}): [${c.coordinates?.coordinates?.join(', ')}]`));

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
