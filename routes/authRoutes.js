const express = require('express');
const {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
   
} = require('../controllers/authController');

const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");



// User Authentication Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshToken);

// Password Management Routes


module.exports = router;
