const mongoose = require("mongoose");

const EmailVerificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model("EmailVerification", EmailVerificationSchema);
