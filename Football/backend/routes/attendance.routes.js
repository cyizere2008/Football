const express = require('express');
const { getAttendance, createAttendance, updateAttendance } = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getAttendance);
router.post('/', protect, authorize('admin', 'coach'), createAttendance);
router.put('/:id', protect, authorize('admin', 'coach'), updateAttendance);

module.exports = router;