const mongoose = require('mongoose');

const TorrentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  magnetLink: { type: String, required: true },
  status: { type: String, enum: ['queued', 'downloading', 'completed', 'error'], default: 'queued' },
  progress: { type: Number, default: 0 },
  files: [{ name: String, path: String, size: Number }],
  error: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Torrent', TorrentSchema);