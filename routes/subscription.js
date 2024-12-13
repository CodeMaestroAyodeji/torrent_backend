// routes/subscription.js

const express = require('express');
const {
  createCheckoutSession,
  handleWebhook,
} = require('../controllers/subscriptionController');

const { protect } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

const router = express.Router();

// Routes
router.post('/checkout', protect, createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);


// Protect route for premium users
router.get('/premium-only', protect, checkSubscription('premium'), (req, res) => {
  res.send('This is a premium-only feature.');
});


module.exports = router;

