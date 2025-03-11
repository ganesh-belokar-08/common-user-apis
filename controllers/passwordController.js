const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const logger = require("../utils/logger"); // Custom logger utility

// Forgot Password - Send Reset Link
exports.forgotPassword = async (req, res) => {
    console.log("API HIT HERE SUCCESSFULLY...")
    try {
        console.log("📥 POST Request: /api/password/forgot-password");

        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate Reset Token & Save Hashed Version in DB
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour expiry
        await user.save();

        // Create Reset Link
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        console.log(`🔹 Reset Token: ${resetToken}`);

        // Send Email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        try {
            await transporter.sendMail({
                to: user.email,
                subject: "Password Reset Request",
                html: `<p>Click the link below to reset your password:</p>
                       <a href="${resetURL}">${resetURL}</a>
                       <p>This link will expire in 1 hour.</p>`,
            });

            console.log("✅ Email sent successfully");
            return res.json({ 
                message: "Password reset link sent to email",
                token : resetToken,
             });

        } catch (err) {
            console.error("❌ Email send failed:", err);
            return res.status(500).json({ message: "Failed to send email" });
        }

    } catch (error) {
        console.error("❌ Error in forgotPassword:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Reset Password - Verify Token & Update Password
/*
exports.resetPassword = async (req, res) => {
    try {
        console.log("📥 POST Request: /api/password/reset-password");
        console.log("🔹 Request Body:", req.body);

        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            console.log("❌ Missing Token or Password");
            return res.status(400).json({ message: "Token and new password are required" });
        }

        // Hash the provided token to match the stored one
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        console.log("🔹 Received Token (Plain):", token);
        console.log("🔹 Received Token (Hashed):", hashedToken);

        // Find user with the hashed token
        const user = await User.findOne({ 
            resetPasswordToken: hashedToken, 
            resetPasswordExpire: { $gt: Date.now() } 
        });

        console.log("🔹 User Found:", user ? "✅ Yes" : "❌ No");

        if (!user) {
            console.log("❌ Invalid or Expired Token");
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Check if the new password is different from the old one
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        console.log("🔹 Is New Password Same as Old?", isSamePassword ? "⚠️ Yes" : "✅ No");

        if (isSamePassword) {
            return res.status(400).json({ message: "New password must be different from the old password" });
        }

        // Hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        console.log("🔹 New Hashed Password:", user.password);

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // Save updated user details
        await user.save();
        console.log("✅ Password Updated & Token Cleared Successfully");

        return res.json({ message: "Password reset successful" });

    } catch (error) {
        console.error("❌ Error in resetPassword:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
*/
// Password complexity validation
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar
    );
};

// Reset Password - Verify Token & Update Password
exports.resetPassword = async (req, res) => {
    try {
        logger.info("📥 POST Request: /api/password/reset-password");
        logger.info("🔹 Request Body:", req.body);

        const { token, newPassword } = req.body;

        // Validate input
        if (!token || !newPassword) {
            logger.error("❌ Missing Token or Password");
            return res.status(400).json({ message: "Token and new password are required" });
        }

        // Validate password complexity
        if (!validatePassword(newPassword)) {
            logger.error("❌ Password does not meet complexity requirements");
            return res.status(400).json({ 
                message: "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters." 
            });
        }

        // Hash the provided token to match the stored one
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        logger.info("🔹 Received Token (Plain):", token);
        logger.info("🔹 Received Token (Hashed):", hashedToken);

        // Find user with the hashed token
        const user = await User.findOne({ 
            resetPasswordToken: hashedToken, 
            resetPasswordExpire: { $gt: Date.now() } // Check if token is not expired
        });

        logger.info("🔹 User Found:", user ? "✅ Yes" : "❌ No");

        if (!user) {
            logger.error("❌ Invalid or Expired Token");
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Check if the new password is different from the old one
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        logger.info("🔹 Is New Password Same as Old?", isSamePassword ? "⚠️ Yes" : "✅ No");

        if (isSamePassword) {
            return res.status(400).json({ message: "New password must be different from the old password" });
        }

        // Hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        logger.info("🔹 New Hashed Password:", user.password);

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // Save updated user details
        await user.save();
        logger.info("✅ Password Updated & Token Cleared Successfully");

        return res.json({ message: "Password reset successful" });

    } catch (error) {
        logger.error("❌ Error in resetPassword:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Change Password - For Logged-in Users
exports.changePassword = async (req, res) => {
    try {
       // console.log("📥 POST Request: /api/password/change-password");


        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

         // Validate password complexity
         if (!validatePassword(newPassword)) {
            logger.error("❌ Password does not meet complexity requirements");
            return res.status(400).json({ 
                message: "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters." 
            });
        }

        // Hash new password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.json({ message: "Password changed successfully" });

    } catch (error) {
        console.error("❌ Error in changePassword:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
