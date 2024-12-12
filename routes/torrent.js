const express = require('express');
const { addMagnetLink, getUserTorrents, deleteTorrent } = require('../controllers/torrentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes
router.post('/add-magnet', protect, addMagnetLink);
router.get('/', protect, getUserTorrents);
router.delete('/:id', protect, deleteTorrent);

module.exports = router;
