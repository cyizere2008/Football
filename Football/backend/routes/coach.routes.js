const express = require('express');
const { getCoaches, createCoach, updateCoach, deleteCoach } = require('../controllers/coach.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getCoaches);
router.post('/', protect, authorize('admin'), createCoach);
router.put('/:id', protect, authorize('admin'), updateCoach);
router.delete('/:id', protect, authorize('admin'), deleteCoach);

module.exports = router;