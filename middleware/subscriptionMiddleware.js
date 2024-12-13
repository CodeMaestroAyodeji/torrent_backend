// middleware/subscriptionMiddleware.js

exports.checkSubscription = (requiredPlan) => (req, res, next) => {
  if (req.user.subscription !== requiredPlan) {
    return res.status(403).json({ message: 'Access denied. Upgrade your plan to access this feature.' });
  }
  next();
};

  