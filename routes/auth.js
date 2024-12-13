const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, createAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');


// Routes
router.post('/create-admin', protect, adminMiddleware, createAdmin);
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);


module.exports = router;
