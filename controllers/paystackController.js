const axios = require('axios');
const User = require('../models/User');

// Initialize Payment
exports.initializePayment = async (req, res) => {
  const { email } = req.user;
  const { amount } = req.body; // Amount in kobo (e.g., 1000 = NGN 10)

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount,
        callback_url: `${process.env.BASE_URL}/api/paystack/verify-payment`,
      },
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    res.json({ authorization_url: response.data.data.authorization_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  const { reference } = req.query;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    if (response.data.data.status === 'success') {
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
