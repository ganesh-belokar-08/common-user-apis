const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// 🔹 Send Email Verification
exports.sendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.isVerified) return res.status(400).json({ message: "Email already verified" });

        const verificationToken = crypto.randomBytes(32).toString("hex");
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpire = Date.now() + 15 * 60 * 1000; // 15 minutes validity
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Verify Your Email",
            html: `<p>Click the link below to verify your email:</p><a href="${verificationLink}">${verificationLink}</a>`,
        };

        await transporter.sendMail(mailOptions);

        // ✅ Return the token in the response
        res.json({
            message: "Verification email sent. Please check your inbox.",
            token: verificationToken, // 🔹 Returning token for testing in Postman
            link : verificationLink, // Optional: Include the full link
        });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// 🔹 Verify Email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpire: { $gt: Date.now() }, // Check if token is still valid
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // ✅ Mark email as verified
        user.isVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpire = null;
        await user.save();

        res.json({ message: "Email verification successful. You can now log in." });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
