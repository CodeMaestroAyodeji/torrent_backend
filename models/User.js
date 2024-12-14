// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  subscription: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
  },
  storageUsed: { type: Number, default: 0 }, 
  subscriptionExpiry: { type: Date, default: null },
  isBlocked: { type: Boolean, default: false },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpiry: { type: Date, default: null },
}, { timestamps: true });

// Hash password before saving the user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password for login
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
