const express = require("express");
const passport = require("passport");

const router = express.Router();

// ✅ Start Google OAuth (Redirect to Google)
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ Google OAuth Callback
router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/google/failure" }),
    (req, res) => {
      res.json({
        message: "Google Authentication Successful",
        user: req.user,
      });
    }
  );
  
  // Failure route (returns JSON instead of redirecting)
  router.get("/auth/google/failure", (req, res) => {
    res.status(401).json({ message: "Google Authentication Failed" });
  });
  

module.exports = router;
