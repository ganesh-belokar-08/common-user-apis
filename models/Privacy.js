const mongoose = require("mongoose");

const PrivacySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dataRequest: { type: Boolean, default: false },
  dataDeletion: { type: Boolean, default: false },
  requestedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Privacy", PrivacySchema);
