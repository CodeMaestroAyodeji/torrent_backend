
const Torrent = require('../models/Torrent');
const User = require('../models/User');  
const { subscriptionplans} = require("../models/SubscriptionPlan")
const { getUserDownloads } = require('../utils/analytics');
const jwt = require('jsonwebtoken');  
const bcrypt = require('bcrypt'); // Add bcrypt for password hashing

exports.viewProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    const updates = req.body;

    try {
        // Add input validation here
        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
        res.json({ message: 'Profile updated successfully.', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    const { newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (newPassword) {
            user.password = await bcrypt.hash(newPassword, 10);
        }
        await user.save();

        res.json({ message: 'Settings updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const analytics = {
      subscription: user.subscription,
      expiry: user.subscriptionExpiry,
      downloads: await getUserDownloads(user.id),
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
};


