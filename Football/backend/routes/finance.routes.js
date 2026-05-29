const express = require('express');
const { getTransactions, createTransaction, getFinancialSummary, deleteTransaction } = require('../controllers/finance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getTransactions);
router.get('/summary', protect, getFinancialSummary);
router.post('/', protect, authorize('admin', 'accountant'), createTransaction);
router.delete('/:id', protect, authorize('admin', 'accountant'), deleteTransaction);

module.exports = router;