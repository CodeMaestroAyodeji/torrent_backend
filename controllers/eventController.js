const Torrent = require('../models/Torrent');  
const { broadcastTorrentProgress, broadcastTorrentEvent } = require('../websocket/websocketServer');  
const { uploadFileToB2 } = require('../utils/backblaze');  
const fs = require('fs');  
const archiver = require('archiver');  
const path = require('path');  

// Pause a torrent  
const pauseTorrent = async (req, res) => {  
  const { torrentId } = req.body;  
  const torrent = await Torrent.findById(torrentId);  

  if (!torrent) {  
    return res.status(404).json({ message: 'Torrent not found.' });  
  }  

  torrent.status = 'paused';  
  await torrent.save();  

  broadcastTorrentEvent(torrent.user.toString(), torrentId, 'Paused');  
  res.json({ message: 'Torrent paused successfully.' });  
};  

// Resume a torrent  
const resumeTorrent = async (req, res) => {  
  const { torrentId } = req.body;  
  const torrent = await Torrent.findById(torrentId);  

  if (!torrent) {  
    return res.status(404).json({ message: 'Torrent not found.' });  
  }  

  torrent.status = 'downloading';  
  await torrent.save();  

  broadcastTorrentEvent(torrent.user.toString(), torrentId, 'Resumed');  
  res.json({ message: 'Torrent resumed successfully.' });  
};  

// Stop a torrent  
const stopTorrent = async (req, res) => {  
  const { torrentId } = req.body;  
  const torrent = await Torrent.findById(torrentId);  

  if (!torrent) {  
    return res.status(404).json({ message: 'Torrent not found.' });  
  }  

  torrent.status = 'stopped';  
  await torrent.save();  

  broadcastTorrentEvent(torrent.user.toString(), torrentId, 'Stopped');  
  res.json({ message: 'Torrent stopped successfully.' });  
};  

// Download and Zip Files  
const zipAndDownload = async (req, res) => {  
  const { torrentId } = req.params;  

  try {  
    console.log('Received request to zip and download torrent:', torrentId);  

    const torrent = await Torrent.findById(torrentId);  
    if (!torrent) {  
      console.log('Torrent not found in database.');  
      return res.status(404).json({ message: 'Torrent not found.' });  
    }  

    const torrentFilesPath = path.join(__dirname, '../storage/torrents/', torrentId);  
    const zipFilePath = path.join(__dirname, '../storage/zips/', `${torrentId}.zip`);  

    console.log('Checking if torrent files directory exists:', torrentFilesPath);  
    if (!fs.existsSync(torrentFilesPath)) {  
      console.log('Torrent files directory not found:', torrentFilesPath);  
      return res.status(404).json({ message: 'Torrent files not found.' });  
    }  

    console.log('Ensuring ZIP directory exists.');  
    const zipDir = path.join(__dirname, '../storage/zips/');  
    if (!fs.existsSync(zipDir)) {  
      fs.mkdirSync(zipDir, { recursive: true });  
    }  

    console.log('Creating ZIP archive for torrent:', torrentId);  
    const output = fs.createWriteStream(zipFilePath);  
    const archive = archiver('zip', { zlib: { level: 9 } });  

    // Handle the 'close' event to manage the download  
    output.on('close', () => {  
      console.log('ZIP archive created successfully. Sending download.');  
      res.download(zipFilePath, `${torrent.fileName}.zip`, (err) => {  
        if (err) {  
          console.error('Error during download:', err);  
        }  
        fs.unlinkSync(zipFilePath); // Clean up after download  
      });  
    });  

    // Handle errors from the archive creation process  
    archive.on('error', (err) => {  
      console.error('Error creating archive:', err);  
      res.status(500).json({ message: 'Error creating archive.' });  
    });  

    // Pipe the archive data to the file  
    archive.pipe(output);  
    archive.directory(torrentFilesPath, false);  

    // Finalize the archive  
    await new Promise((resolve, reject) => {  
      archive.finalize((err) => {  
        if (err) {  
          return reject(err);  
        }  
        resolve();  
      });  
    });  

  } catch (error) {  
    console.error('Error in zipAndDownload function:', error);  
    res.status(500).json({ message: 'An error occurred while processing the download.' });  
  }  
};  

// Download a single file without zipping  
const downloadFile = async (req, res) => {  
  const { torrentId, fileName } = req.params;  

  // Log the received parameters  
  console.log('Torrent ID:', torrentId);  
  console.log('Requested File Name:', fileName);  

  // Construct the path to verify if the file exists  
  const torrentFilesPath = path.join(__dirname, '../storage/torrents/', torrentId, fileName);  
  console.log('Checking file path:', torrentFilesPath);  
  
  if (!fs.existsSync(torrentFilesPath)) {  
    console.log('Requested file does not exist:', torrentFilesPath);  
    return res.status(404).json({ message: 'File not found.' });  
  }  

  res.download(torrentFilesPath, fileName, (err) => {  
    if (err) {  
      console.error('Error during file download:', err);  
      return res.status(500).json({ message: 'Internal server error during file download.' });  
    }  
  });  
};  

// Complete a torrent  
const completeTorrent = async (req, res) => {  
  const { torrentId } = req.body;  
  const torrent = await Torrent.findById(torrentId);  

  if (!torrent) {  
    return res.status(404).json({ message: 'Torrent not found.' });  
  }  

  torrent.status = 'completed';  
  await torrent.save();  

  broadcastTorrentEvent(torrent.user.toString(), torrentId, 'Completed');  
  res.json({ message: 'Torrent marked as completed.' });  
};  

module.exports = {  
  pauseTorrent,  
  resumeTorrent,  
  stopTorrent,  
  zipAndDownload,  
  downloadFile,  
  completeTorrent,  
};