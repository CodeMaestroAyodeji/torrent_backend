// controllers/torrentController.js

const Torrent = require('../models/Torrent');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/uploadTorrent');  
const { sendEmail } = require('../utils/email');
const { downloadCompleteEmail } = require('../utils/templates/downloadCompleteEmail');

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

      if (progress >= 100) {
        clearInterval(interval);
      }
    }
  }, 1000);
};


// Add Torrent via Magnet Link  
exports.addMagnetLink = async (req, res) => {  
  const { magnetLink } = req.body;  

  try {  
    const fileName = getFileNameFromMagnetLink(magnetLink);

    const torrent = new Torrent({  
      user: req.user.id, 
      magnetLink,  
      fileName, 
    });  

    await torrent.save();  
    simulateDownload(torrent._id); 

    // Send an email notification after successfully storing the torrent  
    await sendEmail(req.user.email, 'Download Complete', downloadCompleteEmail(req.user.name, fileName));  

    res.status(201).json({ message: 'Torrent added successfully.', torrent });  
  } catch (error) {  
    res.status(500).json({ error: error.message });  
  }  
};


// Upload .torrent file  
exports.uploadTorrentFile = [  
  upload.single('torrentFile'), 
  async (req, res) => {  
    if (!req.file) {  
      return res.status(400).json({ message: 'No file uploaded.' });  
    }  

    const { filename, path: filePath } = req.file;  

    try {  
      const torrent = new Torrent({  
        user: req.user.id,  
        magnetLink: `file://${filePath}`,  
        status: 'queued',  
        fileName: filename,  
      });  

      await torrent.save();  
      simulateDownload(torrent._id);  

      await sendEmail(req.user.email, 'Torrent File Uploaded',   
        downloadCompleteEmail(req.user.name, filename));  

      res.status(201).json({ message: 'Torrent file uploaded successfully.', torrent });  
    } catch (error) {  
      res.status(500).json({ error: error.message });  
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

