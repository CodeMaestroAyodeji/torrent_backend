// controllers/torrentController.js

const Torrent = require('../models/Torrent');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { uploadFileToB2 } = require('../utils/backblaze');
const upload = require('../middleware/uploadTorrent');  
const { sendEmail } = require('../utils/email');
const { downloadCompleteEmail } = require('../utils/templates/downloadCompleteEmail');
const { broadcastTorrentProgress } = require('../websocket/websocketServer');


// Helper function to extract the file name from a magnet link  
const getFileNameFromMagnetLink = (magnetLink) => {  
  const urlParams = new URLSearchParams(magnetLink.split('?')[1]);  
  return urlParams.get('dn') || 'defaultFileName.torrent';  
};  

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

      // Notify the user via WebSocket
      broadcastTorrentProgress(torrent.user.toString(), torrentId);

      if (progress >= 100) {
        clearInterval(interval);
      }
    }
  }, 1000);
};


exports.addMagnetLink = async (req, res) => {
  const { magnetLink } = req.body;

  try {
    const user = await User.findById(req.user.id);

    // Check storage usage (assign arbitrary size for magnet links if needed)
    const estimatedSize = 10 * 1024 * 1024; // Assume each magnet link represents 10 MB
    const planLimit = user.subscription === 'premium' ? 50 * 1024 * 1024 * 1024 : 10 * 1024 * 1024 * 1024;

    if (user.storageUsed + estimatedSize > planLimit) {
      return res.status(400).json({ error: 'Storage limit exceeded' });
    }

    const torrent = new Torrent({
      user: req.user.id,
      magnetLink,
      fileName: 'Magnet Link',
    });

    await torrent.save();

    // Update user storage usage
    user.storageUsed += estimatedSize;
    await user.save();

    res.status(201).json({ message: 'Magnet link added successfully.', torrent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Upload torrent file handler
exports.uploadTorrentFile = [
  upload.single('torrentFile'), // Middleware to handle file upload
  async (req, res) => {
      if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded.' });
      }

      const { filename, path: filePath } = req.file;

      try {
          // Upload the file to Backblaze B2
          const b2Response = await uploadFileToB2(filePath, filename);

          // Construct the public URL using the file name
          const magnetLink = `https://f${process.env.B2_BUCKET_ID}.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${b2Response.fileName}`;

          // Save the torrent details
          const torrent = new Torrent({
              user: req.user.id,
              magnetLink, // Use the generated public URL
              fileName: filename,
              status: 'queued',
          });

          await torrent.save();

          simulateDownload(torrent._id);

          await sendEmail(
              req.user.email,
              'Torrent File Uploaded',
              downloadCompleteEmail(req.user.name, filename)
          );

          res.status(201).json({ message: 'Torrent file uploaded successfully.', torrent });
      } catch (error) {
          console.error('Error uploading file or saving torrent:', error);
          res.status(500).json({ error: 'Failed to upload file to Backblaze B2.' });
      }
  },
];


// Search Torrents via External API  
exports.searchTorrents = async (req, res) => {  
  const { query, page = 1, limit = 10 } = req.query; // Added limit for pagination

  // Parse page and limit to integers
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  if (!query) {  
    return res.status(400).json({ message: 'Search query is required.' });  
  }  

  try {  
    const response = await axios.get(process.env.EXTERNAL_TORRENT_API_URL, {  
      params: { q: query, page: parsedPage, limit: parsedLimit }, // Adjusting params based on expected API  
    });  

    // Log the entire response to debug
    console.log('External API Response:', response.data);

    // Check if the response is an array and has results
    if (Array.isArray(response.data) && response.data.length > 0) {  
      const totalResults = response.data.length; // Total number of results
      const totalPages = Math.ceil(totalResults / parsedLimit); // Calculate total pages based on limit

      // Map through results to add magnet link
      const resultsWithMagnetLink = response.data.map(item => ({
        ...item,
        magnetLink: `magnet:?xt=urn:btih:${item.info_hash}` // Construct the magnet link
      }));

      res.json({  
        currentPage: parsedPage,  
        totalPages: totalPages,  
        totalResults: totalResults,  
        results: resultsWithMagnetLink, // The actual list of results with magnet links  
      });  
    } else {  
      res.status(404).json({ message: 'No results found.' });  
    }  
  } catch (error) {  
    console.error('Error fetching torrents from the external search engine:', error.message);  
    res.status(500).json({ error: 'Error fetching torrents from the external search engine.' });  
  }  
};




// Get All Torrents for a User with Pagination
exports.getUserTorrents = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10

  // Parse page and limit to integers
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  try {
    // Calculate the number of documents to skip
    const skip = (parsedPage - 1) * parsedLimit;

    // Fetch torrents with pagination
    const torrents = await Torrent.find({ user: req.user.id })
      .skip(skip)
      .limit(parsedLimit);

    // Get total count of torrents for calculating total pages
    const totalTorrents = await Torrent.countDocuments({ user: req.user.id });
    const totalPages = Math.ceil(totalTorrents / parsedLimit);

    res.json({
      currentPage: parsedPage,
      totalPages: totalPages,
      totalResults: totalTorrents,
      results: torrents,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete a Torrent
exports.deleteTorrent = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the torrent by ID
    const torrent = await Torrent.findById(id);

    if (!torrent) {
      return res.status(404).json({ message: 'Torrent not found.' });
    }

    // Check if the user is authorized to delete the torrent
    if (torrent.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    // Delete the torrent
    await Torrent.findByIdAndDelete(id);

    res.json({ message: 'Torrent deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

