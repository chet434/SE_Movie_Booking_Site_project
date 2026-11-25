const mongoose = require('mongoose');
require('dotenv').config({ path: 'server/.env' });
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');

async function updateCancellationPolicies() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Theatres policy mapping
  const theatres = await Theatre.find({});
  console.log(`Found ${theatres.length} theatres to update`);

  for (const t of theatres) {
    const nameLower = t.name.toLowerCase();
    let cancellationAllowed = true;

    // Sriya Swati Stutee, AMB Cinemas, and standalone Cinepolis in Delhi-NCR set to non-cancellable
    if (
      nameLower.includes('sriya') ||
      nameLower.includes('swati') ||
      nameLower.includes('stutee') ||
      nameLower.includes('amb') ||
      (nameLower === 'cinepolis' && t.location === 'Delhi-NCR')
    ) {
      cancellationAllowed = false;
    } else {
      cancellationAllowed = true;
    }

    t.cancellationAllowed = cancellationAllowed;
    t.cancellationFeePercent = 20;
    t.cancellationCutoffMinutes = 120;
    await t.save();

    console.log(`Updated theatre: ${t.name} (${t.location}) -> cancellationAllowed: ${cancellationAllowed}`);
  }

  // Ensure shows have default isCancellable = null so they inherit theatre policy cleanly
  const updateShowsRes = await Show.updateMany(
    {},
    { $set: { isCancellable: null } }
  );
  console.log(`Shows reset to isCancellable: null -> ${updateShowsRes.modifiedCount}`);

  await mongoose.disconnect();
  console.log('Done!');
}

updateCancellationPolicies().catch((err) => {
  console.error('Error updating cancellation policies:', err);
  process.exit(1);
});
