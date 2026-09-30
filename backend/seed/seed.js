/* ------------------------------------------------------------------
 * Seed script
 *
 *   node backend/seed/seed.js          -> insert the sample students
 *   node backend/seed/seed.js --reset  -> clear the collection first
 *
 * It can also be used automatically on server start (SEED_SAMPLE_DATA=true).
 * ------------------------------------------------------------------ */
const sampleStudents = require('./sampleStudents');

async function seed({ reset = false, log = console.log } = {}) {
  const Student = require('../models/Student');

  if (reset) {
    await Student.deleteMany({});
    log('[seed] Cleared the students collection.');
  }

  const existing = await Student.countDocuments();
  if (existing > 0) {
    log(`[seed] ${existing} student record(s) already present - nothing inserted.`);
    return { inserted: 0, existing };
  }

  const inserted = await Student.insertMany(sampleStudents);
  log(`[seed] Inserted ${inserted.length} sample student(s).`);
  return { inserted: inserted.length, existing: 0 };
}

/* Insert the sample students only when the collection is empty */
async function seedIfEmpty(log = console.log) {
  try {
    return await seed({ reset: false, log });
  } catch (err) {
    log(`[seed] Skipped: ${err.message}`);
    return { inserted: 0, error: err.message };
  }
}

/* Allow running this file directly */
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

  (async () => {
    await connectDB();
    await seed({ reset: process.argv.includes('--reset') });
    await disconnectDB();
    process.exit(0);
  })().catch((err) => {
    console.error('[seed] Failed:', err.message);
    process.exit(1);
  });
}

module.exports = seed;
module.exports.seedIfEmpty = seedIfEmpty;
module.exports.sampleStudents = sampleStudents;