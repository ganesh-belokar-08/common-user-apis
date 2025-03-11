const jwt = require("jsonwebtoken");

// Replace with your actual secret key from .env
const secretKey = "your_secret_key"; 

// Payload (modify as needed)
const payload = { userId: "12345", email: "test@example.com" };

// Generate Token
const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

console.log("Generated Token:", token);
