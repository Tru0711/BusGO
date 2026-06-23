const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');

const OTP_VALIDITY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const ACCESS_TOKEN_TTL = '7d';
const REFRESH_TOKEN_TTL = '30d';
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_MINUTES = 15;

const getOtpExpiry = () => new Date(Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000);
const getAppName = () => process.env.APP_NAME || 'BusGo';
const getAppContext = () => process.env.APP_CONTEXT || 'Online Bus Ticket Booking Platform';
const isDevelopmentBypassEnabled = () => process.env.NODE_ENV !== 'production';
const normalizeEmail = (email) => String(email || '').toLowerCase().trim();
const normalizePhone = (phone) => String(phone || '').trim();
const parseServiceAreas = (serviceAreas) => {
  if (Array.isArray(serviceAreas)) {
    return serviceAreas.map((area) => String(area).trim()).filter(Boolean);
  }

  if (typeof serviceAreas === 'string') {
    return serviceAreas
      .split(',')
      .map((area) => area.trim())
      .filter(Boolean);
  }

  return [];
};

const createToken = (userId) => {
  return jwt.sign({ userId, tokenType: 'access' }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
};

const createRefreshToken = (userId) => {
  return jwt.sign({ userId, tokenType: 'refresh' }, process.env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
};

const hashRefreshToken = (refreshToken) => bcrypt.hash(refreshToken, 10);

const buildOtpEmail = (name, otp) => {
  const appName = getAppName();
  const appContext = getAppContext();

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #17313B;">
      <h2>${appName} OTP Verification</h2>
      <p>Hello ${name},</p>
      <p>You are receiving this email because you are creating an account on ${appName}, a ${appContext.toLowerCase()}.</p>
      <p>Your one-time password (OTP) for account verification is:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 12px 18px; background: #F7F4EE; display: inline-block; border-radius: 10px;">
        ${otp}
      </div>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;
};

const buildPasswordResetEmail = (name, otp) => {
  const appName = getAppName();

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #17313B;">
      <h2>${appName} Password Reset</h2>
      <p>Hello ${name},</p>
      <p>You requested a password reset for your ${appName} account.</p>
      <p>Your password reset OTP is:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 12px 18px; background: #F7F4EE; display: inline-block; border-radius: 10px;">
        ${otp}
      </div>
      <p>This code is valid for 10 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;
};

const buildAccountPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  companyName: user.companyName,
  businessType: user.businessType,
  address: user.address,
  gstNumber: user.gstNumber,
  serviceAreas: user.serviceAreas,
  isVerified: user.isVerified,
  isApproved: user.isApproved,
});

const registerAccount = async (req, res, role) => {
  try {
    const appName = getAppName();
    const devBypassEnabled = isDevelopmentBypassEnabled();
    const {
      name,
      email,
      password,
      phone,
      companyName,
      businessType,
      address,
      gstNumber,
      serviceAreas,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (role === 'vendor' && (!phone || !companyName || !businessType || !address)) {
      return res.status(400).json({
        success: false,
        message: 'Vendor registration requires phone, company name, business type, and address.',
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });
    const otp = generateOTP();
    const otpExpiry = getOtpExpiry();
    const hashedPassword = await bcrypt.hash(password, 10);
    const nextServiceAreas = parseServiceAreas(serviceAreas);
    const autoVerifyAccount = devBypassEnabled;

    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({
        success: false,
        message: 'User already exists. Please login instead.',
      });
    }

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name.trim();
      existingUser.password = hashedPassword;
      existingUser.role = role;
      existingUser.phone = normalizePhone(phone);
      existingUser.companyName = String(companyName || '').trim();
      existingUser.businessType = String(businessType || '').trim();
      existingUser.address = String(address || '').trim();
      existingUser.gstNumber = String(gstNumber || '').trim();
      existingUser.serviceAreas = nextServiceAreas;
      existingUser.isVerified = autoVerifyAccount;
      existingUser.isApproved = role === 'vendor' ? autoVerifyAccount : true;
      existingUser.otp = autoVerifyAccount ? null : otp;
      existingUser.otpExpiry = autoVerifyAccount ? null : otpExpiry;
      existingUser.otpLastSentAt = autoVerifyAccount ? null : new Date();
      await existingUser.save();

      return res.status(200).json({
        success: true,
        message: autoVerifyAccount
          ? 'Signup successful. Please login.'
          : 'Account already exists but is not verified. A new OTP has been sent to your email.',
        autoVerified: autoVerifyAccount,
        devOtp: autoVerifyAccount ? null : otp,
        resendAvailableIn: OTP_RESEND_COOLDOWN_SECONDS,
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      phone: normalizePhone(phone),
      companyName: String(companyName || '').trim(),
      businessType: String(businessType || '').trim(),
      address: String(address || '').trim(),
      gstNumber: String(gstNumber || '').trim(),
      serviceAreas: nextServiceAreas,
      isVerified: autoVerifyAccount,
      isApproved: role === 'vendor' ? autoVerifyAccount : true,
      otp: autoVerifyAccount ? null : otp,
      otpExpiry: autoVerifyAccount ? null : otpExpiry,
      otpLastSentAt: autoVerifyAccount ? null : new Date(),
    });

    if (!autoVerifyAccount) {
      await sendEmail({
        to: normalizedEmail,
        subject: `${appName} - Verify your account`,
        html: buildOtpEmail(user.name, otp),
      });
    }

    return res.status(201).json({
      success: true,
      message: autoVerifyAccount
        ? 'Signup successful. Please login.'
        : 'Signup successful. Please verify the OTP sent to your email.',
      autoVerified: autoVerifyAccount,
      devOtp: autoVerifyAccount ? null : otp,
      resendAvailableIn: OTP_RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Signup failed.',
      error: error.message,
    });
  }
};

// Signup creates a user, stores OTP, and sends the verification email.
const signupUser = async (req, res) => registerAccount(req, res, 'user');

const vendorRegister = async (req, res) => registerAccount(req, res, 'vendor');

// Verify OTP activates the account only when the code matches and is not expired.
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.',
      });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Account is already verified. You can login now.',
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired or is missing. Please resend OTP.',
      });
    }

    if (user.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    if (user.otpExpiry.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please resend OTP.',
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully. Account activated.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'OTP verification failed.',
      error: error.message,
    });
  }
};

// Login is allowed only after the account has been verified.
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const devBypassEnabled = isDevelopmentBypassEnabled();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to multiple failed login attempts. Please try again later.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOGIN_LOCK_MINUTES * 60 * 1000);
      }
      await user.save();

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isVerified) {
      if (devBypassEnabled) {
        user.isVerified = true;
        if (user.role === 'vendor') {
          user.isApproved = true;
        }
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
      } else {
        return res.status(403).json({
          success: false,
          message: 'Please verify your account before logging in.',
        });
      }
    }

    if (user.role === 'vendor' && !user.isApproved) {
      if (devBypassEnabled) {
        user.isApproved = true;
        await user.save();
      } else {
        return res.status(403).json({
          success: false,
          message: 'Your vendor account is pending approval.',
        });
      }
    }

    const token = createToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.refreshTokenHash = await hashRefreshToken(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      refreshToken,
      user: buildAccountPayload(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: error.message,
    });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.tokenType !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.',
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired.',
      });
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalid.',
      });
    }

    return res.status(200).json({
      success: true,
      token: createToken(user._id),
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unable to refresh token.',
      error: error.message,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      await User.findByIdAndUpdate(decoded.userId, { refreshTokenHash: null });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  }
};

// Resend OTP creates a fresh code and updates the expiry time.
const resendOtp = async (req, res) => {
  try {
    const appName = getAppName();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified.',
      });
    }

    const now = Date.now();
    if (user.otpLastSentAt) {
      const elapsedMs = now - user.otpLastSentAt.getTime();
      const cooldownMs = OTP_RESEND_COOLDOWN_SECONDS * 1000;
      if (elapsedMs < cooldownMs) {
        const retryAfter = Math.ceil((cooldownMs - elapsedMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${retryAfter}s before requesting a new OTP.`,
          retryAfter,
        });
      }
    }

    const otp = generateOTP();
    const otpExpiry = getOtpExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpLastSentAt = new Date();
    await user.save();

    await sendEmail({
      to: user.email,
      subject: `${appName} - New OTP for verification`,
      html: buildOtpEmail(user.name, otp),
    });

    return res.status(200).json({
      success: true,
      message: 'A new OTP has been sent to your email.',
      resendAvailableIn: OTP_RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to resend OTP.',
      error: error.message,
    });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const appName = getAppName();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const now = Date.now();
    if (user.resetOtpLastSentAt) {
      const elapsedMs = now - user.resetOtpLastSentAt.getTime();
      const cooldownMs = OTP_RESEND_COOLDOWN_SECONDS * 1000;
      if (elapsedMs < cooldownMs) {
        const retryAfter = Math.ceil((cooldownMs - elapsedMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${retryAfter}s before requesting a new reset code.`,
          retryAfter,
        });
      }
    }

    const resetOtp = generateOTP();
    const resetOtpExpiry = getOtpExpiry();

    user.resetOtp = resetOtp;
    user.resetOtpExpiry = resetOtpExpiry;
    user.resetOtpLastSentAt = new Date();
    await user.save();

    await sendEmail({
      to: user.email,
      subject: `${appName} - Password reset code`,
      html: buildPasswordResetEmail(user.name, resetOtp),
    });

    return res.status(200).json({
      success: true,
      message: 'A password reset code has been sent to your email.',
      resendAvailableIn: OTP_RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to request password reset.',
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (!user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired or is missing. Please request a new one.',
      });
    }

    if (user.resetOtp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset code.',
      });
    }

    if (user.resetOtpExpiry.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new one.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    user.resetOtpLastSentAt = null;
    user.refreshTokenHash = null;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password.',
      error: error.message,
    });
  }
};

module.exports = {
  signupUser,
  vendorRegister,
  verifyOtp,
  loginUser,
  resendOtp,
  requestPasswordReset,
  resetPassword,
  refreshAccessToken,
  logoutUser,
};
