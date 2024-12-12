const multer = require('multer');  
const path = require('path');  
const fs = require('fs');  

// Multer storage for .torrent files  
const storage = multer.diskStorage({  
  destination: (req, file, cb) => {  
    const uploadDir = path.join(__dirname, '../storage/torrents/');  
    if (!fs.existsSync(uploadDir)) {  
      fs.mkdirSync(uploadDir, { recursive: true });  
    }  
    cb(null, uploadDir);  
  },  
  filename: (req, file, cb) => {  
    cb(null, `${Date.now()}-${file.originalname}`);  
  },  
});  

// File filter for .torrent files  
const fileFilter = (req, file, cb) => {  
  if (file.mimetype === 'application/x-bittorrent') {  
    cb(null, true);  
  } else {  
    cb(new Error('Invalid file type. Only .torrent files are allowed.'));  
  }  
};  

// Multer configuration  
const upload = multer({  
  storage,  
  fileFilter,  
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB  
});  

module.exports = upload; 