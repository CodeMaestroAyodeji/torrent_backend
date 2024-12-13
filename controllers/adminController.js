// controllers/adminController.js

const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');
const Torrent = require('../models/Torrent');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user status (block/unblock)
exports.updateUserStatus = async (req, res) => {  
  const { userId, action } = req.body;  

  // Validate action  
  if (!['block', 'unblock'].includes(action)) {  
    return res.status(400).json({ message: 'Invalid action specified' });  
  }  

  try {  
    const user = await User.findById(userId);  
    if (!user) {  
      return res.status(404).json({ message: 'User not found' });  
    }  

    user.isBlocked = (action === 'block');  
    await user.save();  

    res.json({ message: `User ${action}ed successfully.` });  
  } catch (error) {  
    console.error(error); // Log detailed error   
    res.status(500).json({ error: error.message });  
  }  
}; 

// Delete user  
exports.deleteUser = async (req, res) => {  
  const { userId } = req.body;  

  try {  
    const user = await User.findById(userId);  
    if (!user) {  
      return res.status(404).json({ message: 'User not found.' });  // Check if user exists  
    }  

    await User.findByIdAndDelete(userId);  
    res.json({ message: 'User deleted successfully.' });  
  } catch (error) {  
    console.error(error); // Log error for debugging  
    res.status(500).json({ error: error.message });  
  }  
};

// Get all subscription plans from User schema
// exports.getAllPlans = async (req, res) => {  
//   try {  
//     const users = await User.find({}, 'subscription');
//     const plans = users.map(user => user.subscription).filter(Boolean);
//     res.json(plans);  
//   } catch (error) {  
//     res.status(500).json({ error: error.message });  
//   }  
// };

exports.getAllPlans = async (req, res) => {  
  try {  
    const plans = await SubscriptionPlan.find({});   
    res.json(plans);  
  } catch (error) {  
    res.status(500).json({ error: error.message });  
  }  
};

// Update subscription plan
exports.updatePlan = async (req, res) => {
  const { planId, updates } = req.body;

  try {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    Object.assign(plan, updates);
    await plan.save();

    res.json({ message: 'Plan updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new subscription plan
exports.createPlan = async (req, res) => {
  const { name, price, limits } = req.body;

  try {
    const newPlan = new SubscriptionPlan({ name, price, limits });
    await newPlan.save();

    res.json({ message: 'Plan created successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete subscription plan
exports.deletePlan = async (req, res) => {
  const { planId } = req.body;

  try {
    await SubscriptionPlan.findByIdAndDelete(planId);
    res.json({ message: 'Plan deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get basic analytics
exports.getAnalytics = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const activeSubscriptions = await User.countDocuments({ subscription: 'premium' });
    const storageUsed = await Torrent.aggregate([{ $group: { _id: null, totalSize: { $sum: '$size' } } }]);

    res.json({
      totalUsers: userCount,
      premiumUsers: activeSubscriptions,
      storageUsed: storageUsed[0]?.totalSize || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
