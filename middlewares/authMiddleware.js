const jwt = require('jsonwebtoken');
const User = require('../models/User');
require("dotenv").config();

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log("🔹 Received Token:", token);

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("✅ Token Decoded:", decoded);

            // Ensure decoded userId exists
            if (!decoded.userId) {
                console.log("❌ Invalid Token Structure: No userId found");
                return res.status(401).json({ message: 'Invalid token structure' });
            }

            // Find user by ID from token
            req.user = await User.findById(decoded.userId).select('-password');

            if (!req.user) {
                console.log("❌ User Not Found for ID:", decoded.userId);
                return res.status(401).json({ message: 'User not found' });
            }

            console.log("✅ Authenticated User:", req.user.email);
            next();
        } catch (error) {
            console.log("❌ Token Verification Failed:", error.message);
            return res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    } else {
        console.log("❌ No Token Provided");
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
