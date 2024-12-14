// utils/analytics.js

const Torrent = require('../models/Torrent');

const getUserDownloads = async (userId) => {
  try {
    // Count the number of completed torrents for the user
    const completedDownloads = await Torrent.countDocuments({
      user: userId,
      status: 'completed',
    });
    return completedDownloads;
  } catch (error) {
    console.error('Error fetching user downloads:', error);
    throw new Error('Unable to fetch user downloads.');
  }
};

module.exports = { getUserDownloads };
