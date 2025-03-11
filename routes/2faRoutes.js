const express = require('express');
const router = express.Router();
const twoFactorController = require('../controllers/2faController');
const { protect } = require('../middlewares/authMiddleware');

/*
 Enable 2FA
 POST /api/enable-2fa
 */
router.post('/enable-2fa', twoFactorController.enable2FA);

/*
 Verify 2FA token
 POST /api/verify-2fa
 */
router.post('/verify-2fa', twoFactorController.verify2FA);

/*
 Disable 2FA
 POST /api/disable-2fa
 */
router.post('/disable-2fa', twoFactorController.disable2FA);

module.exports = router;