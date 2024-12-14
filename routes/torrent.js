const express = require('express');
const { searchTorrents, addMagnetLink, uploadTorrentFile, getUserTorrents, deleteTorrent } = require('../controllers/torrentController');
const { protect } = require('../middleware/authMiddleware');
const { broadcastTorrentProgress } = require('../websocket/websocketServer');
const Torrent = require('../models/Torrent');
const { pauseTorrent, resumeTorrent, stopTorrent, zipAndDownload, completeTorrent, downloadFile } = require('../controllers/eventController');



const router = express.Router();

// Routes
router.get('/search', protect, searchTorrents);
router.post('/add-magnet', protect, addMagnetLink);
router.post('/upload', protect, uploadTorrentFile);
router.get('/', protect, getUserTorrents);
router.delete('/:id', protect, deleteTorrent);
router.post('/pause', pauseTorrent);
router.post('/resume', resumeTorrent);
router.post('/stop', stopTorrent);
router.get('/zip-download/:torrentId', zipAndDownload);
router.get('/download/:torrentId/files/:fileName', downloadFile);
router.post('/complete', completeTorrent);

router.post('/simulate-progress', async (req, res) => {
    const { userId, torrentId, progress, status } = req.body;
  
    // Mock Torrent Data
    await Torrent.findByIdAndUpdate(torrentId, { progress, status });
  
    // Trigger WebSocket broadcast
    broadcastTorrentProgress(userId, torrentId);
  
    res.json({ message: 'Progress broadcasted' });
  });

module.exports = router;
