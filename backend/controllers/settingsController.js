/* ------------------------------------------------------------------
 * Settings controller - system settings persist in MongoDB
 * ------------------------------------------------------------------ */
const Settings = require('../models/Settings');
const { asyncHandler } = require('../middleware/errorHandler');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

function serialize(settings) {
  return {
    administratorName: settings.administratorName,
    email: settings.email,
    collegeName: settings.collegeName,
    theme: settings.theme,
  };
}

/* GET /api/settings */
exports.getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();
  res.json({ success: true, settings: serialize(settings) });
});

/* PUT /api/settings */
exports.updateSettings = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const errors = [];
  const data = {};

  if (body.administratorName !== undefined) {
    const name = String(body.administratorName).trim();
    if (!name) errors.push('Administrator name is required');
    else if (name.length > 60) errors.push('Administrator name must be at most 60 characters');
    else data.administratorName = name;
  }

  if (body.email !== undefined) {
    const email = String(body.email).trim();
    if (!email) errors.push('Email is required');
    else if (!EMAIL_RE.test(email)) errors.push('Please enter a valid email address');
    else data.email = email.toLowerCase();
  }

  if (body.collegeName !== undefined) {
    const collegeName = String(body.collegeName).trim();
    if (!collegeName) errors.push('College name is required');
    else if (collegeName.length > 100) errors.push('College name must be at most 100 characters');
    else data.collegeName = collegeName;
  }

  if (body.theme !== undefined) {
    const theme = String(body.theme).trim();
    if (!Settings.THEMES.includes(theme)) errors.push(`Theme must be one of ${Settings.THEMES.join(', ')}`);
    else data.theme = theme;
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }

  const settings = await Settings.getSettings();
  Object.assign(settings, data);
  await settings.save();

  return res.json({
    success: true,
    message: 'Settings saved successfully.',
    settings: serialize(settings),
  });
});