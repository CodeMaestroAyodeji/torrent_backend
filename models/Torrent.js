// models/Torrent.js  
const mongoose = require('mongoose');  

const torrentSchema = new mongoose.Schema({  
  user: {  
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'User', // Reference to the User model  
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
    enum: ['queued', 'downloading', 'completed'],  
    default: 'queued',  
  },  
  fileName: {  
    type: String,  
    required: true, // Assuming we want to store the name of the downloaded file  
  },  
}, { timestamps: true });  

const Torrent = mongoose.model('Torrent', torrentSchema);  
module.exports = Torrent;