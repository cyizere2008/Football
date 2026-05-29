const express = require('express');
const router = express.Router();
const {
  generateClubReport,
  generatePlayerReport,
  generateFinancialReport,
} = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/club', protect, authorize('admin'), generateClubReport);
router.get('/player/:playerId', protect, authorize('admin', 'coach'), generatePlayerReport);
router.get('/financial', protect, authorize('admin', 'accountant'), generateFinancialReport);

module.exports = router;