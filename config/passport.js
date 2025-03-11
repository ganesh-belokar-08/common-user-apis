const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // Ensure the path is correct
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/oauth/auth/google/callback", // 🔥 Ensure this matches in Google Cloud
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("✅ Google Profile Received:", profile);

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          console.log("🆕 Creating a new user...");
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName || "Unknown User",
            email: profile.emails?.[0]?.value || "No email provided",
          });
        } else {
          console.log("👤 User already exists:", user);
        }

        return done(null, user);
      } catch (err) {
        console.error("❌ Error in Google OAuth Strategy:", err);
        return done(err, null);
      }
    }
  )
);

// ✅ Serialize user into session
passport.serializeUser((user, done) => {
  console.log("🔐 Serializing User:", user.id);
  done(null, user.id);
});

// ✅ Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      console.log("⚠️ User not found during deserialization");
      return done(null, false);
    }
    console.log("🔄 Deserializing User:", user);
    done(null, user);
  } catch (err) {
    console.error("❌ Error in deserializing user:", err);
    done(err, null);
  }
});

module.exports = passport;
