// controllers/authController.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const apiResponse = require('../utils/apiResponse');
const { generateTokens } = require('../utils/generateToken');
const { sendEmail } = require('../utils/emailService');
const logger = require('../config/logger');

const TEST_OTP = '123456'; // Universal test mode OTP for development/testing

const register = async (req, res) => {
  const { fullName, email, phone, password, role, organizationName } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return apiResponse.error(res, 'An account with this email already exists', [], 409);
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

  const user = await User.create({
    fullName,
    email,
    phone: phone || '',
    password,
    role: role || 'donor',
    organizationName: organizationName || '',
    isVerified: false,
    otpCode,
    otpExpires,
  });

  logger.info(`🔑 [TEST MODE OTP] Email: ${email} | Real OTP: ${otpCode} | Test OTP: ${TEST_OTP}`);

  const emailHtml = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
      <div style="background: #2563EB; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🍱 ZeroHunger</h1>
      </div>
      <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <h2 style="color: #1E293B; margin-bottom: 16px;">Welcome, ${fullName}!</h2>
        <p style="color: #64748B; font-size: 16px;">Use the OTP below to verify your email address. It expires in 15 minutes.</p>
        <div style="background: #EFF6FF; border: 2px dashed #2563EB; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0;">
          <span style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #2563EB;">${otpCode}</span>
        </div>
        <p style="color: #64748B; font-size: 13px; text-align: center;">Note: In test mode, you can also use universal OTP <strong>${TEST_OTP}</strong></p>
      </div>
    </div>
  `;

  await sendEmail(email, 'Verify your ZeroHunger account', emailHtml);

  return apiResponse.success(
    res,
    { email, message: 'OTP sent to your email address', testOtp: TEST_OTP },
    'Registration successful. Please verify your email.',
    201
  );
};

const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+otpCode +otpExpires +refreshToken');
  if (!user) {
    return apiResponse.error(res, 'User not found', [], 404);
  }

  if (user.isVerified) {
    return apiResponse.error(res, 'Email already verified', [], 400);
  }

  const isTestOtp = otp === TEST_OTP;
  if (!isTestOtp && (!user.otpCode || user.otpCode !== otp)) {
    return apiResponse.error(res, 'Invalid OTP', [], 400);
  }

  if (!isTestOtp && user.otpExpires < new Date()) {
    return apiResponse.error(res, 'OTP has expired. Please request a new one.', [], 400);
  }

  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpires = undefined;

  const tokens = generateTokens({ id: user._id, role: user.role });
  user.refreshToken = tokens.refreshToken;
  await user.save();

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const sanitizedUser = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
    profileCompleted: user.profileCompleted,
    createdAt: user.createdAt,
  };

  return apiResponse.success(res, { user: sanitizedUser, accessToken: tokens.accessToken }, 'Email verified successfully');
};

const resendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+otpCode +otpExpires');
  if (!user) return apiResponse.error(res, 'User not found', [], 404);
  if (user.isVerified) return apiResponse.error(res, 'Email already verified', [], 400);

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.otpCode = otpCode;
  user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  logger.info(`🔑 [TEST MODE OTP RESEND] Email: ${email} | Real OTP: ${otpCode} | Test OTP: ${TEST_OTP}`);

  const emailHtml = `<p>Your new OTP: <strong>${otpCode}</strong></p><p>Expires in 15 minutes. (Test mode code: ${TEST_OTP})</p>`;
  await sendEmail(email, 'Resend OTP - ZeroHunger', emailHtml);

  return apiResponse.success(res, { email, testOtp: TEST_OTP }, 'New OTP sent to your email');
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const origin = req.headers.origin || req.get('Referrer') || 'no-origin';
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';

  logger.info(`Login attempt for ${email} from origin=${origin} ip=${ip}`);

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    logger.warn(`Login failed (no user) for ${email} from ${origin}`);
    return apiResponse.error(res, 'Invalid email or password', [], 401);
  }

  if (!user.isActive) {
    logger.warn(`Login blocked (disabled) for ${email}`);
    return apiResponse.error(res, 'Your account has been disabled. Contact support.', [], 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    logger.warn(`Login failed (bad password) for ${email}`);
    return apiResponse.error(res, 'Invalid email or password', [], 401);
  }

  if (!user.isVerified) {
    logger.warn(`Login blocked (unverified) for ${email}`);
    return apiResponse.error(res, 'Please verify your email before logging in', [], 403);
  }

  user.lastLogin = new Date();
  const tokens = generateTokens({ id: user._id, role: user.role });
  user.refreshToken = tokens.refreshToken;
  await user.save();

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const sanitizedUser = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    organizationName: user.organizationName,
    profileImage: user.profileImage,
    isVerified: user.isVerified,
    profileCompleted: user.profileCompleted,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };

  logger.info(`Login successful for ${email} from ${origin}`);
  return apiResponse.success(res, { user: sanitizedUser, accessToken: tokens.accessToken }, 'Login successful');
};

const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) return apiResponse.error(res, 'Refresh token required', [], 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'superrefreshsecretkey123');
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return apiResponse.error(res, 'Invalid refresh token', [], 401);
    }

    const tokens = generateTokens({ id: user._id, role: user.role });
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return apiResponse.success(res, { accessToken: tokens.accessToken }, 'Token refreshed successfully');
  } catch {
    return apiResponse.error(res, 'Invalid or expired refresh token', [], 401);
  }
};

const logout = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'superrefreshsecretkey123');
      await User.findByIdAndUpdate(decoded.id, { refreshToken: '' });
    } catch {}
  }
  res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' });
  return apiResponse.success(res, {}, 'Logged out successfully');
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+otpCode +otpExpires');
  if (!user) return apiResponse.success(res, { email, testOtp: TEST_OTP }, 'If the email exists, an OTP has been sent');

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.otpCode = otpCode;
  user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  logger.info(`🔑 [TEST MODE FORGOT PASSWORD] Email: ${email} | Real OTP: ${otpCode} | Test OTP: ${TEST_OTP}`);

  const emailHtml = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset OTP</h2>
      <p>Your OTP code is: <strong style="font-size: 24px; letter-spacing: 4px;">${otpCode}</strong></p>
      <p>This code expires in 15 minutes. (Test mode code: ${TEST_OTP})</p>
    </div>
  `;
  await sendEmail(email, 'Reset your ZeroHunger password', emailHtml);

  return apiResponse.success(res, { email, testOtp: TEST_OTP }, 'If the email exists, an OTP has been sent');
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email }).select('+otpCode +otpExpires');
  if (!user) return apiResponse.error(res, 'User not found', [], 404);

  const isTestOtp = otp === TEST_OTP;
  if (!isTestOtp && (!user.otpCode || user.otpCode !== otp)) return apiResponse.error(res, 'Invalid OTP', [], 400);
  if (!isTestOtp && user.otpExpires < new Date()) return apiResponse.error(res, 'OTP expired', [], 400);

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save();

  return apiResponse.success(res, { resetToken }, 'OTP verified successfully');
};

const resetPassword = async (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');
  if (!user) return apiResponse.error(res, 'User not found', [], 404);

  if (!user.resetPasswordToken || user.resetPasswordToken !== resetToken) {
    return apiResponse.error(res, 'Invalid or expired reset token', [], 400);
  }
  if (user.resetPasswordExpires < new Date()) {
    return apiResponse.error(res, 'Reset token expired', [], 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return apiResponse.success(res, {}, 'Password reset successfully. Please login.');
};

const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return apiResponse.error(res, 'User not found', [], 404);
  return apiResponse.success(res, user, 'Profile retrieved');
};

const updateProfile = async (req, res) => {
  const { fullName, phone, organizationName, address, city, bio, profileImage } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return apiResponse.error(res, 'User not found', [], 404);

  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;
  if (organizationName !== undefined) user.organizationName = organizationName;
  if (address !== undefined) user.address = address;
  if (city !== undefined) user.city = city;
  if (bio !== undefined) user.bio = bio;
  if (profileImage !== undefined) user.profileImage = profileImage;
  user.profileCompleted = true;

  await user.save();
  return apiResponse.success(res, user, 'Profile updated successfully');
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!user) return apiResponse.error(res, 'User not found', [], 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return apiResponse.error(res, 'Current password is incorrect', [], 400);

  user.password = newPassword;
  await user.save();
  return apiResponse.success(res, {}, 'Password changed successfully');
};

module.exports = {
  register, verifyEmail, resendOtp, login, refreshToken, logout,
  forgotPassword, verifyOtp, resetPassword,
  getProfile, updateProfile, changePassword,
};
