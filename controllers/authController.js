// controllers/authController.js

const User = require('../models/User');  
const jwt = require('jsonwebtoken');  
const { sendEmail } = require('../utils/email');  
const { registrationEmail } = require('../utils/templates/registrationEmail');
const { successVerification } = require('../utils/templates/successVerification');

// Generate JWT Token  
const generateToken = (id) => {  
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });  
};  

// Register Admin  
exports.createAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new admin user
    const admin = new User({
      name,
      email,
      password,
      isAdmin: true,
      verified: true, // Admins are automatically verified
    });

    await admin.save();

    // Send a response back with admin details (excluding sensitive fields)
    res.status(201).json({
      message: 'Admin created successfully.',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        isAdmin: admin.isAdmin,
      },
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: error.message });
  }
};



// Register User  
exports.register = async (req, res) => {  
  const { name, email, password } = req.body;  

  try {  
    const existingUser = await User.findOne({ email });  
    if (existingUser) {  
      return res.status(400).json({ message: 'User already exists' });  
    }  

    const user = new User({ name, email, password });  
    await user.save();  

    const token = generateToken(user._id);  
    const verificationLink = `${process.env.FRONTEND_DEV_URL}/verify-email?token=${token}`; // Ensure BASE_URL is set correctly in .env  

    const emailContent = registrationEmail(user.name, verificationLink);  
    await sendEmail(user.email, 'Verify Your Email', emailContent);  
    
    res.status(201).json({ message: 'User registered. Please verify your email.' });  
  } catch (error) {  
    console.error('Error during registration:', error); // Log registration errors  
    res.status(500).json({ error: error.message });  
  }  
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.verified) {
      return res.status(403).json({ message: 'Please verify your email.' });
    }

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Email  
exports.verifyEmail = async (req, res) => {  
  const { token } = req.body;  // Change this line to get token from the body instead  

  try {  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
    const user = await User.findById(decoded.id);  

    if (!user) {  
      return res.status(400).json({ message: 'Invalid token: User not found.' });  
    }  

    if (user.verified) {  
      return res.status(400).json({ message: 'Email already verified.' });  
    }  

    user.verified = true;  
    await user.save();  

    const emailContent = successVerification(user.name);  
    await sendEmail(user.email, 'Email Verification Success', emailContent);  

    res.json({ message: 'Email verified successfully.' });  
  } catch (error) {  
    if (error.name === 'TokenExpiredError') {  
      return res.status(400).json({ message: 'Token expired.' });  
    }  
    res.status(500).json({ error: error.message });  
  }  
};