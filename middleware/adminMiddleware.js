// middleware/adminMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    // Check for token in headers
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user and verify admin status
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    req.user = user; // Attach the user object to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Authorization Error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = adminMiddleware;
