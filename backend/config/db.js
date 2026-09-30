/* ------------------------------------------------------------------
 * SRMS - Student Record Management System
 * MongoDB connection handler (Mongoose)
 * ------------------------------------------------------------------ */
const mongoose = require('mongoose');

/**
 * Connects to MongoDB using MONGODB_URI.
 *
 * If USE_MEMORY_DB=true (development without a local MongoDB install),
 * a real, temporary mongod instance is started in-process through
 * mongodb-memory-server and the app connects to it instead.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/srms';
  const useMemory = String(process.env.USE_MEMORY_DB || '').toLowerCase() === 'true';

  let connectionUri = uri;

  if (useMemory) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const memoryServer = await MongoMemoryServer.create({
        instance: { dbName: 'srms', port: 27017 },
      });
      connectionUri = memoryServer.getUri('srms');
      global.__SRMS_MEMORY_SERVER__ = memoryServer;
      console.log('[db] In-memory MongoDB started at', connectionUri);
    } catch (err) {
      console.error('[db] Could not start in-memory MongoDB:', err.message);
      console.error('[db] Falling back to MONGODB_URI =', uri);
    }
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(connectionUri, { serverSelectionTimeoutMS: 8000 });
    const { host, port, name } = mongoose.connection;
    console.log(`[db] MongoDB connected -> ${host}:${port}/${name}`);
    return mongoose.connection;
  } catch (err) {
    console.error('[db] MongoDB connection FAILED:', err.message);
    console.error('[db] Make sure MongoDB is running, or set USE_MEMORY_DB=true in backend/.env');
    throw err;
  }
}

async function disconnectDB() {
  await mongoose.connection.close().catch(() => {});
  if (global.__SRMS_MEMORY_SERVER__) {
    await global.__SRMS_MEMORY_SERVER__.stop().catch(() => {});
  }
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDB, disconnectDB, isDbConnected };
