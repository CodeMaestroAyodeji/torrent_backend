// routes/admin.js

const express = require('express');
const {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllPlans,
  updatePlan,
  createPlan,
  deletePlan,
  getAnalytics,
} = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');


const router = express.Router();

// User Management
router.get('/users', adminMiddleware, getAllUsers);
router.post('/users/update-user-status', adminMiddleware, updateUserStatus);
router.delete('/users/delete', adminMiddleware, deleteUser);

// Subscription Management
router.get('/plans', adminMiddleware, getAllPlans);
router.post('/plans/update', adminMiddleware, updatePlan);
router.post('/plans/create', adminMiddleware, createPlan);
router.delete('/plans/delete', adminMiddleware, deletePlan);

// Analytics
router.get('/analytics', adminMiddleware, getAnalytics);

module.exports = router;
