const express = require('express');
const { createOrder, captureOrder } = require('../controllers/paypalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes
router.post('/create-order', protect, createOrder);
router.post('/capture-order', protect, captureOrder);

module.exports = router;
