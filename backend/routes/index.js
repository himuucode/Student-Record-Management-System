/* ------------------------------------------------------------------
 * API router - every route below (except login) requires a valid
 * administrator session and a live MongoDB connection.
 * ------------------------------------------------------------------ */
const express = require('express');
const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const reportRoutes = require('./reportRoutes');
const settingsRoutes = require('./settingsRoutes');
const { requireAuth } = require('../middleware/auth');
const { databaseGuard } = require('../middleware/errorHandler');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/students', requireAuth, databaseGuard, studentRoutes);
router.use('/reports', requireAuth, databaseGuard, reportRoutes);
router.use('/settings', requireAuth, databaseGuard, settingsRoutes);

router.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    success: true,
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

module.exports = router;