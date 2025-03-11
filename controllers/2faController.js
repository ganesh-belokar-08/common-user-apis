const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User'); // User model

const twoFactorController = {
    /**
     * Enable 2FA for a user
     * POST /api/enable-2fa
     */
    enable2FA: async (req, res) => {
        try {
            const { userId } = req.body;
            if (!userId) return res.status(400).json({ error: 'User ID is required' });

            // Generate a secret key
            const secret = speakeasy.generateSecret({ length: 20 });

            // Store the secret key securely
            await User.findOneAndUpdate({ _id: userId }, { two_factor_secret: secret.base32 });

            // Generate QR code
            const otpauthUrl = speakeasy.otpauthURL({
                secret: secret.base32,
                label: `YourApp:${userId}`,
                issuer: 'YourApp',
            });

            const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

            res.json({ qrCodeUrl, secret: secret.base32 });
        } catch (error) {
            console.error('Error enabling 2FA:', error);
            res.status(500).json({ error: 'Failed to enable 2FA' });
        }
    },

    /**
     * Verify 2FA token
     * POST /api/verify-2fa
     */
    verify2FA: async (req, res) => {
        try {
            const { userId, token } = req.body;
            if (!userId || !token) {
                return res.status(400).json({ error: 'User ID and token are required' });
            }
    
            // Retrieve the user's secret key
            const user = await User.findById(userId);
            if (!user || !user.two_factor_secret) {
                return res.status(400).json({ error: '2FA not enabled for this user' });
            }
    
            console.log('Stored Secret:', user.two_factor_secret);
            console.log('Received Token:', token);
    
            // Verify the token
            const verified = speakeasy.totp.verify({
                secret: user.two_factor_secret,
                encoding: 'base32',
                token: token,
                window: 4, // Allows slight time drift
            });
    
            console.log('Verification Result:', verified);
    
            if (verified) {
                return res.json({ success: true, message: '2FA verification successful' });
            } else {
                return res.status(400).json({ error: 'Invalid token' });
            }
        } catch (error) {
            console.error('Error verifying 2FA token:', error);
            res.status(500).json({ error: 'Failed to verify 2FA' });
        }
    },
    

    /**
     * Disable 2FA for a user
     * POST /api/disable-2fa
     */
    disable2FA: async (req, res) => {
        try {
            const { userId } = req.body;
            if (!userId) return res.status(400).json({ error: 'User ID is required' });

            await User.findOneAndUpdate({ _id: userId }, { $unset: { two_factor_secret: 1 } });

            res.json({ success: true, message: '2FA disabled successfully' });
        } catch (error) {
            console.error('Error disabling 2FA:', error);
            res.status(500).json({ error: 'Failed to disable 2FA' });
        }
    },
};

module.exports = twoFactorController;
