const express = require('express');
const {
  signupUser,
  vendorRegister,
  verifyOtp,
  loginUser,
  resendOtp,
  requestPasswordReset,
  resetPassword,
  refreshAccessToken,
  logoutUser,
} = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signupUser);
router.post('/vendor-register', vendorRegister);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logoutUser);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Example protected route so the JWT middleware is already wired and ready for future booking APIs.
router.get('/me', protect, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Authenticated user found.',
    user: req.user,
  });
});

module.exports = router;
