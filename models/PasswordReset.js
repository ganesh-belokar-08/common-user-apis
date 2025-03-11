const mongoose = require("mongoose");

const PasswordResetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  token: { type: String, required: true },
  otp: { type: String, default: null }, // OTP for mobile-based reset
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model("PasswordReset", PasswordResetSchema);
