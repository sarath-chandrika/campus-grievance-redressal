const express = require('express');
const router = express.Router();
const {
  getSummary,
  getSlaBreaches,
  generatePdfReport,
} = require('../controllers/analyticsController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All analytics routes require admin privileges
router.use(verifyToken, requireRole('admin'));

router.get('/summary', getSummary);
router.get('/sla-breaches', getSlaBreaches);
router.get('/report/pdf', generatePdfReport);

module.exports = router;
