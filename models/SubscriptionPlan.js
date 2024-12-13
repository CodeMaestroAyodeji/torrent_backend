const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  limits: {
    downloads: {
      type: Number,
      required: true,
      default: 0, // Number of downloads allowed
    },
    speed: {
      type: Number,
      required: true,
      default: 0, // Download speed limit in Mbps
    },
    storage: {
      type: Number,
      required: true,
      default: 0, // Storage limit in GB
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
