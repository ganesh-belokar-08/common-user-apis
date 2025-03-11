const express = require('express');
const {  forgotPassword,resetPassword,changePassword} = require('../controllers/passwordController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Debugging log to check if routes are being loaded
console.log("✅ Password Routes Loaded");

// Middleware to log incoming requests
router.use((req, res, next) => {
    console.log(`📥 ${req.method} Request: ${req.originalUrl}`);
    console.log("🔹 Request Body:", req.body);
    console.log("🔹 Request Params:", req.params);
    next();
});

// Password Management Routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", protect, changePassword);


module.exports = router;
