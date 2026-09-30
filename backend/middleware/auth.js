/* ------------------------------------------------------------------
 * Authentication middleware
 *
 * The administrator credential lives only on the server (environment
 * variables). A successful login returns an opaque bearer token that is
 * kept in memory for the lifetime of the server session.
 * ------------------------------------------------------------------ */
const crypto = require('crypto');

const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours
const sessions = new Map(); // token -> { username, expiresAt }

function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: process.env.ADMIN_NAME || 'Administrator',
  };
}

function verifyCredentials(username, password) {
  const admin = getAdminCredentials();
  if (typeof username !== 'string' || typeof password !== 'string') return false;
  if (username.trim().toLowerCase() !== admin.username.toLowerCase()) return false;
  // constant time comparison to avoid leaking the password length
  const a = Buffer.from(password);
  const b = Buffer.from(admin.password);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function createSession(username) {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { username, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

function destroySession(token) {
  if (token) sessions.delete(token);
}

function getSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

/* Express middleware - protects every /api route except login */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const session = getSession(token);
  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Session expired. Please login again.',
    });
  }
  req.admin = session;
  req.token = token;
  return next();
}

module.exports = {
  requireAuth,
  verifyCredentials,
  createSession,
  destroySession,
  getSession,
  getAdminCredentials,
};