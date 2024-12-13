const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { viewProfile, updateProfile, getAnalytics, updateSettings } = require('../controllers/userProfileController');

router.get('/profile', protect, viewProfile);
router.put('/profile', protect, updateProfile);
router.get('/analytics', protect, getAnalytics);
router.put('/settings', protect, updateSettings);

module.exports = router;
