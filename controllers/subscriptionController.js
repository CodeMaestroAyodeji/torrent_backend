// controllers/subscriptionController.js

const User = require('../models/User');
const { validatePlan } = require('../utils/validators');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session for Subscription
exports.createCheckoutSession = async (req, res) => {
  const { plan } = req.body;
  
  // Validate plan
  const { error } = validatePlan(plan);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: plan === 'premium' ? process.env.STRIPE_PREMIUM_PLAN_ID : null,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_DEV_URL}/subscription/success`,
      cancel_url: `${process.env.FRONTEND_DEV_URL}/subscription/cancel`,
    });

    return res.status(201).json({ url: session.url });
  } catch (error) {
    console.error('Stripe session creation error:', error.message);
    return res.status(500).json({ error: 'Internal server error. Try again later.' });
  }
};


// Handle Webhook for Payment Success
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const user = await User.findOne({ email: session.customer_email });

      if (!user) {
        console.warn('User not found for email:', session.customer_email);
        return res.status(404).json({ error: 'User not found.' });
      }

      // Update user subscription
      user.subscription = 'premium';
      user.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await user.save();
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};



