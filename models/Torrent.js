// models/Torrent.js  
const mongoose = require('mongoose');

const torrentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  magnetLink: {
    type: String,
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['queued', 'downloading', 'completed', 'paused', 'stopped'],
    default: 'queued',
  },
  fileName: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Torrent = mongoose.model('Torrent', torrentSchema);
module.exports = Torrent;
