const express = require('express');
const { searchTorrents, addMagnetLink, uploadTorrentFile, getUserTorrents, deleteTorrent } = require('../controllers/torrentController');
const { protect } = require('../middleware/authMiddleware');
const { broadcastTorrentProgress } = require('../websocket/websocketServer');
const Torrent = require('../models/Torrent');


const router = express.Router();

// Routes
router.get('/search', protect, searchTorrents);
router.post('/add-magnet', protect, addMagnetLink);
router.post('/upload', protect, uploadTorrentFile);
router.get('/', protect, getUserTorrents);
router.delete('/:id', protect, deleteTorrent);

router.post('/simulate-progress', async (req, res) => {
    const { userId, torrentId, progress, status } = req.body;
  
    // Mock Torrent Data
    await Torrent.findByIdAndUpdate(torrentId, { progress, status });
  
    // Trigger WebSocket broadcast
    broadcastTorrentProgress(userId, torrentId);
  
    res.json({ message: 'Progress broadcasted' });
  });

module.exports = router;
