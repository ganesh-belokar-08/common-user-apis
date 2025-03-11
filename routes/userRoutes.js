const express = require('express');
const { getUserProfile, updateUserProfile, deleteUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Debugging log to check if routes are being loaded
console.log("✅ User Routes Loaded");

// Middleware to log incoming requests
router.use((req, res, next) => {
    console.log(`📥 ${req.method} Request: ${req.originalUrl}`);
    console.log("🔹 Request Body:", req.body);
    console.log("🔹 Request Params:", req.params);
    next();
});

// ✅ User Profile Routes
router.get('/:userId',  protect, getUserProfile);
router.put('/:userId', protect, updateUserProfile);
router.delete('/:userId', protect, deleteUserProfile);

module.exports = router;
