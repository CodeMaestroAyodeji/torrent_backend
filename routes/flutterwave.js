const express = require('express');
const { initializePayment, verifyPayment } = require('../controllers/flutterwaveController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes
router.post('/initialize', protect, initializePayment);
router.get('/verify-payment', protect, verifyPayment);

module.exports = router;
