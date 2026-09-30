/* ------------------------------------------------------------------
 * Async wrapper + central error handler
 * ------------------------------------------------------------------ */
const { isDbConnected } = require('../config/db');

/* Wraps async route handlers so rejected promises reach the error handler */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* Friendly message for a failed MongoDB connection */
function databaseGuard(req, res, next) {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Please make sure MongoDB is running and try again.',
    });
  }
  return next();
}

/* 404 for unknown API routes */
function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/* Central error handler - never lets the server crash on a bad request */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Mongoose validation errors -> readable message
  if (err && err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({ success: false, message });
  }

  // Duplicate key (e.g. roll number already exists)
  if (err && err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    const label = field === 'rollNumber' ? 'Roll number' : field;
    return res.status(409).json({
      success: false,
      message: `${label} "${value}" already exists. Please use a different one.`,
    });
  }

  // Invalid ObjectId
  if (err && err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid value for ${err.path}` });
  }

  // Mongoose/network connection problem
  if (err && /buffering timed out|ECONNREFUSED|topology was destroyed/i.test(err.message || '')) {
    return res.status(503).json({
      success: false,
      message: 'Database is not reachable. Please make sure MongoDB is running and try again.',
    });
  }

  const status = err.statusCode || 500;
  console.error('[error]', err && err.stack ? err.stack : err);
  return res.status(status).json({
    success: false,
    message: err.message || 'Something went wrong on the server.',
  });
}

module.exports = { asyncHandler, databaseGuard, notFound, errorHandler };