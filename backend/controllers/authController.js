/* ------------------------------------------------------------------
 * Auth controller - administrator login / logout / session check
 * ------------------------------------------------------------------ */
const {
  verifyCredentials,
  createSession,
  destroySession,
  getAdminCredentials,
} = require('../middleware/auth');

/* POST /api/auth/login */
exports.login = (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please enter both username and password.' });
  }

  if (!verifyCredentials(username, password)) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  const admin = getAdminCredentials();
  const token = createSession(admin.username);

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    admin: { username: admin.username, name: admin.name },
  });
};

/* POST /api/auth/logout */
exports.logout = (req, res) => {
  destroySession(req.token);
  return res.json({ success: true, message: 'Logged out successfully' });
};

/* GET /api/auth/me */
exports.me = (req, res) => {
  const admin = getAdminCredentials();
  return res.json({
    success: true,
    admin: { username: admin.username, name: req.admin.username ? admin.name : admin.name },
  });
};