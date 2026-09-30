/* ------------------------------------------------------------------
 * Report routes
 * GET /api/reports
 * GET /api/reports/dashboard
 * ------------------------------------------------------------------ */
const express = require('express');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.get('/', reportController.getReports);
router.get('/dashboard', reportController.getDashboard);

module.exports = router;