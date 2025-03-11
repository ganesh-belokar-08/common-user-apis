require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const emailRoutes = require("./routes/emailRoutes");
const oauthRoutes = require("./routes/oauthRoutes");
const twoFactorRoutes = require('./routes/2faRoutes');


// Load Passport Configurations
require("./config/passport");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(morgan("dev"));
app.use(helmet());

// Session Middleware (Required for OAuth)
app.use(
  session({
    secret: process.env.COOKIE_SECRET || "your_cookie_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Rate Limiting (Prevents API abuse)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use("/api", apiLimiter);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env file!");
  process.exit(1);
}

console.log("🔗 Connecting to MongoDB...");
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// Base route
//app.use("/api", twoFARoutes); 
// Active Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/oauth", oauthRoutes); // OAuth Authentication Routes
app.use('/api', twoFactorRoutes);


// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Handle Uncaught Errors
process.on("unhandledRejection", (err) => {
  console.error("🚨 Unhandled Rejection:", err);
  process.exit(1);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
