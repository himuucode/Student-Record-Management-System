/* ------------------------------------------------------------------
 * Settings model - single system-settings document
 * { administratorName, email, collegeName, theme }
 * ------------------------------------------------------------------ */
const mongoose = require('mongoose');

const THEMES = ['Light', 'Dark'];

const settingsSchema = new mongoose.Schema(
  {
    administratorName: {
      type: String,
      default: 'Administrator',
      trim: true,
      maxlength: [60, 'Administrator name must be at most 60 characters'],
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => v === '' || /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v),
        message: 'Please enter a valid email address',
      },
    },
    collegeName: {
      type: String,
      default: 'Lovely Professional University',
      trim: true,
      maxlength: [100, 'College name must be at most 100 characters'],
    },
    theme: {
      type: String,
      enum: { values: THEMES, message: 'Theme must be Light or Dark' },
      default: 'Light',
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSettings = async function getSettings() {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
module.exports.THEMES = THEMES;