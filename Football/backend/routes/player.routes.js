const express = require('express');
const { getPlayers, createPlayer, updatePlayer, deletePlayer } = require('../controllers/player.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getPlayers);
router.post('/', protect, authorize('admin'), createPlayer);
router.put('/:id', protect, authorize('admin'), updatePlayer);
router.delete('/:id', protect, authorize('admin'), deletePlayer);

module.exports = router;