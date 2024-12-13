const paypal = require('@paypal/checkout-server-sdk');
const User = require('../models/User');

const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

// Create PayPal Order
exports.createOrder = async (req, res) => {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '10.00', // Price for premium subscription
          },
        },
      ],
    });

    const order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Capture PayPal Payment
exports.captureOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client.execute(request);

    // Update user subscription
    const user = await User.findById(req.user.id);
    if (user) {
      user.subscription = 'premium';
      user.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await user.save();
    }

    res.json({ message: 'Payment successful. Subscription updated.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
