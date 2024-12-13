const axios = require('axios');
const User = require('../models/User');

// Initialize Payment
exports.initializePayment = async (req, res) => {
  const { email } = req.user;
  const { amount } = req.body; // Amount in kobo (e.g., 1000 = NGN 10)

  try {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: `${Date.now()}`,
        amount,
        currency: 'NGN',
        redirect_url: `${process.env.BASE_URL}/api/flutterwave/verify-payment`,
        customer: { email },
      },
      {
        headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
      }
    );

    res.json({ payment_url: response.data.data.link });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  const { transaction_id } = req.query;

  try {
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
      }
    );

    if (response.data.data.status === 'successful') {
      // Update user subscription
      const user = await User.findById(req.user.id);
      user.subscription = 'premium';
      user.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await user.save();

      res.json({ message: 'Payment successful. Subscription updated.' });
    } else {
      res.status(400).json({ error: 'Payment verification failed.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
