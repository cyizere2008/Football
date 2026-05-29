const express = require('express');
const { getMatches, createMatch, updateMatch, deleteMatch, getMatchById } = require('../controllers/match.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getMatches);
router.get('/:id', protect, getMatchById);
router.post('/', protect, authorize('admin', 'coach'), createMatch);
router.put('/:id', protect, authorize('admin', 'coach'), updateMatch);
router.delete('/:id', protect, authorize('admin'), deleteMatch);

module.exports = router;