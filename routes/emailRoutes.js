const express = require("express");
const { sendVerificationEmail, verifyEmail } = require("../controllers/emailController");
const router = express.Router();

router.post("/send-verification-email", sendVerificationEmail);
router.post("/verify-email", verifyEmail);

module.exports = router;
