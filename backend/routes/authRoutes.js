/* ------------------------------------------------------------------
 * Auth routes
 * POST /api/auth/login
 * POST /api/auth/logout
 * GET  /api/auth/me
 * ------------------------------------------------------------------ */
const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);

module.exports = router;