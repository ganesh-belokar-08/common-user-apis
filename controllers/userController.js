const mongoose = require('mongoose');
const User = require('../models/User');

// ✅ Get user profile
exports.getUserProfile = async (req, res) => {
    console.log("📥 GET Request:", req.originalUrl);
    console.log("🔹 Request Params:", req.params);
    console.log("🔹 Authenticated User:", req.user); // Debugging line

    try {
        if (!req.user) {
            console.error("🚨 Authentication failed: req.user is undefined");
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        const userId = req.params.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            console.error("🚨 Invalid or missing userId:", userId);
            return res.status(400).json({ message: 'Invalid User ID format' });
        }

        if (req.user._id.toString() !== userId) {
            console.error("🚨 Unauthorized access attempt by:", req.user._id);
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            console.error("🚨 User not found for ID:", userId);
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error("🔥 Error in getUserProfile:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// ✅ Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        // Convert both IDs to string for proper comparison
        if (req.user._id.toString() !== req.params.userId.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { fullname, email, mobile } = req.body;
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.mobile = mobile || user.mobile;

        await user.save();
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ✅ Delete user account
exports.deleteUserProfile = async (req, res) => {
    try {
        if (req.user.id !== req.params.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await User.findByIdAndDelete(req.params.userId);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
