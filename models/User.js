const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        mobile: { type: String, unique: true, sparse: true },
        password: { type: String, required: true },
        isVerified: { type: Boolean, default: false },
        isMobileVerified: { type: Boolean, default: false },

        // 🔹 2FA Fields
        is2FAEnabled: { type: Boolean, default: false },  // If 2FA is enabled
        twoFASecret: { type: String, default: null },  // Stores encrypted TOTP secret
        twoFAToken: { type: String, default: null },  // Temporary 2FA token
        twoFATokenExpires: { type: Date, default: null },  // Expiry time for token
        twoFABackupCodes: { type: [String], default: [] },  // Hashed backup codes

        role: { type: String, default: "user", enum: ["user", "admin", "moderator"] },
        refreshToken: { type: String, default: null },
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpire: { type: Date, default: null },
        resetAttempts: { type: Number, default: 0 },
        lastResetAttempt: { type: Date, default: null },

        // 🔹 Email Verification Fields
        emailVerificationToken: { type: String, default: null },
        emailVerificationExpire: { type: Date, default: null },

    },
    { timestamps: true }
);

// 🔹 Hash password before saving (Prevent double hashing)
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    if (this.password.startsWith("$2a$")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 🔹 Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// 🔹 Hash 2FA Secret before saving
UserSchema.methods.setTwoFASecret = async function (secret) {
    const salt = await bcrypt.genSalt(10);
    this.twoFASecret = await bcrypt.hash(secret, salt);
};

// 🔹 Verify 2FA Token
UserSchema.methods.verifyTwoFASecret = async function (secret) {
    return await bcrypt.compare(secret, this.twoFASecret);
};

// 🔹 Hash Backup Codes
UserSchema.methods.setTwoFABackupCodes = async function (codes) {
    const salt = await bcrypt.genSalt(10);
    this.twoFABackupCodes = await Promise.all(codes.map(async (code) => bcrypt.hash(code, salt)));
};

// 🔹 Verify Backup Code
UserSchema.methods.verifyTwoFABackupCode = async function (enteredCode) {
    for (let code of this.twoFABackupCodes) {
        if (await bcrypt.compare(enteredCode, code)) {
            return true; // Valid backup code
        }
    }
    return false;
};

module.exports = mongoose.model("User", UserSchema);
