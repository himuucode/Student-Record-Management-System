/* ------------------------------------------------------------------
 * SRMS - Student Record Management System
 * Express server - serves the REST API and the frontend pages
 * ------------------------------------------------------------------ */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const path = require('path');
const express = require('express');
const cors = require('cors');

const { connectDB, disconnectDB } = require('./config/db');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

/* ---------------------------- middleware ---------------------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ------------------------------- API -------------------------------- */
app.use('/api', apiRoutes);
app.use('/api', notFound); // unknown API route -> JSON 404

/* ---------------------------- frontend ------------------------------ */
app.use(express.static(FRONTEND_DIR));
app.get('/', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));

/* JSON error handler (keeps the API from ever returning an HTML error page) */
app.use(errorHandler);

/* ------------------------------ start ------------------------------- */
let server;

async function start() {
  /* Start listening first so the UI can render clear database messages
     even while MongoDB is still starting up. */
  server = app.listen(PORT, () => {
    console.log(`[server] SRMS running on http://localhost:${PORT}`);
    console.log(`[server] Login page: http://localhost:${PORT}/index.html`);
  });

  try {
    await connectDB();
  } catch (err) {
    // The server keeps running so the UI can show a clear "database not connected"
    // message instead of crashing with an unhandled error.
    console.error('[server] Started without a database connection.');
  }

  /* Insert the sample students on first run (only when the collection is empty) */
  if (String(process.env.SEED_SAMPLE_DATA || '').toLowerCase() === 'true') {
    const { seedIfEmpty } = require('./seed/seed');
    await seedIfEmpty();
  }
}

/* ------------------------------ shutdown ---------------------------- */
async function shutdown(signal) {
  console.log(`\n[server] ${signal} received, shutting down...`);
  if (server) await new Promise((resolve) => server.close(resolve));
  await disconnectDB();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled promise rejection:', reason);
});

if (require.main === module) start();

module.exports = { app, start };