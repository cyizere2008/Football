const express = require('express');
const router = express.Router();
const {
  getTrainingSessions,
  createTrainingSession,
  updateTrainingSession,
  deleteTrainingSession,
} = require('../controllers/training.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, getTrainingSessions);
router.post('/', protect, authorize('admin', 'coach'), createTrainingSession);
router.put('/:id', protect, authorize('admin', 'coach'), updateTrainingSession);
router.delete('/:id', protect, authorize('admin', 'coach'), deleteTrainingSession);

module.exports = router;