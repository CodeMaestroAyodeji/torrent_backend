const express = require('express');
const { searchTorrents, addMagnetLink, uploadTorrentFile, getUserTorrents, deleteTorrent } = require('../controllers/torrentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes
router.get('/search', protect, searchTorrents);
router.post('/add-magnet', protect, addMagnetLink);
router.post('/upload', protect, uploadTorrentFile);
router.get('/', protect, getUserTorrents);
router.delete('/:id', protect, deleteTorrent);

module.exports = router;
