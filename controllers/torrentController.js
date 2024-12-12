const Torrent = require('../models/Torrent');
const path = require('path');
const fs = require('fs');

// Simulate a torrent download process (replace with actual torrent client logic)
const simulateDownload = async (torrentId) => {
  let progress = 0;

  const interval = setInterval(async () => {
    progress += 10; // Simulate progress

    const torrent = await Torrent.findById(torrentId);
    if (torrent) {
      torrent.progress = progress;
      torrent.status = progress < 100 ? 'downloading' : 'completed';
      await torrent.save();

      if (progress >= 100) {
        clearInterval(interval);
      }
    }
  }, 1000); // Update every second
};

// Add Torrent via Magnet Link
exports.addMagnetLink = async (req, res) => {
  const { magnetLink } = req.body;

  try {
    const torrent = new Torrent({
      user: req.user.id,
      magnetLink,
    });

    await torrent.save();
    simulateDownload(torrent._id);

    res.status(201).json({ message: 'Torrent added successfully.', torrent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Torrents for a User
exports.getUserTorrents = async (req, res) => {
  try {
    const torrents = await Torrent.find({ user: req.user.id });
    res.json(torrents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a Torrent
exports.deleteTorrent = async (req, res) => {
  const { id } = req.params;

  try {
    const torrent = await Torrent.findById(id);

    if (!torrent) {
      return res.status(404).json({ message: 'Torrent not found.' });
    }

    if (torrent.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    await torrent.remove();

    res.json({ message: 'Torrent deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
