require("dotenv").config();

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Helper function to generate tokens
const generateTokens = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY || "1h" });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" });

    return { token, refreshToken };
};

// Register User
exports.registerUser = async (req, res) => {
    try {
        const { fullname, email, mobile, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        // Hash password if not handled in Mongoose middleware
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({ fullname, email, mobile, password: hashedPassword });

        // Generate tokens
        const { token, refreshToken } = generateTokens(user._id);

        // Save refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        // Set refresh token as an HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
        });

        res.status(201).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            token,
        });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// User Login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid email or password" });

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

        // Generate tokens
        const { token, refreshToken } = generateTokens(user._id);

        // Save refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            token,
            refreshToken,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate password reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour expiry
        await user.save();

        // Send reset email
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request",
            text: `You have requested to reset your password. Click the link below to reset your password: \n\n ${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "Password reset link sent to email" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Find user by reset token
        const user = await User.findOne({ 
            resetPasswordToken: token, 
            resetPasswordExpire: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: "Password has been reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// User Logout (Clears Refresh Token)
exports.logoutUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.refreshToken = undefined;
        await user.save();

        res.clearCookie("refreshToken");
        res.json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Refresh Token Endpoint
exports.refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(401).json({ message: "Refresh token required" });

        // Verify refresh token
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || user.refreshToken !== token) {
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

        // Generate new access token
        const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token: newToken });
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired refresh token", error: error.message });
    }
};
