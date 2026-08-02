// controllers/authController.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const apiResponse = require('../utils/apiResponse');
const { generateTokens } = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { fullName, name, email, phone, password, role, organizationName, profileImage } = req.body;

  const userFullName = fullName || name;
  if (!userFullName) {
    return apiResponse.error(res, 'Full Name is required', [], 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return apiResponse.error(res, 'Email already exists', [], 400);
  }

  const user = await User.create({
    fullName: userFullName,
    email,
    phone: phone || '',
    password,
    role: role || 'user',
    organizationName: organizationName || '',
    profileImage: profileImage || '',
    isVerified: true,
    isActive: true,
    lastLogin: new Date(),
  });

  const tokens = generateTokens({ id: user._id, role: user.role });
  user.refreshToken = tokens.refreshToken;
  await user.save();

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return apiResponse.success(
    res,
    {
      user: {
        id: user._id,
        fullName: user.fullName,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        organizationName: user.organizationName,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
    'Registration successful',
    201
  );
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return apiResponse.error(res, 'Email not registered', [], 401);
  }

  if (user.isActive === false) {
    return apiResponse.error(res, 'Account Disabled', [], 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return apiResponse.error(res, 'Incorrect Password', [], 401);
  }

  user.lastLogin = new Date();
  const tokens = generateTokens({ id: user._id, role: user.role });
  user.refreshToken = tokens.refreshToken;
  await user.save();

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return apiResponse.success(
    res,
    {
      user: {
        id: user._id,
        fullName: user.fullName,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        organizationName: user.organizationName,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
    'Logged in successfully'
  );
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: '' });
  }
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return apiResponse.success(res, null, 'Logged out successfully');
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) {
    return apiResponse.error(res, 'Refresh Token Required', [], 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return apiResponse.error(res, 'Invalid Refresh Token', [], 401);
    }

    const tokens = generateTokens({ id: user._id, role: user.role });
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return apiResponse.success(
      res,
      { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
      'Token refreshed successfully'
    );
  } catch (err) {
    return apiResponse.error(res, 'Invalid or Expired Refresh Token', [], 401);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return apiResponse.error(res, 'User not found', [], 404);
  }
  return apiResponse.success(res, user, 'Profile retrieved successfully');
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const { fullName, name, phone, organizationName, profileImage } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return apiResponse.error(res, 'User not found', [], 404);
  }

  if (fullName || name) user.fullName = fullName || name;
  if (phone) user.phone = phone;
  if (organizationName !== undefined) user.organizationName = organizationName;
  if (profileImage !== undefined) user.profileImage = profileImage;

  await user.save();
  return apiResponse.success(res, user, 'Profile updated successfully');
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return apiResponse.error(res, 'User not found', [], 404);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return apiResponse.error(res, 'Current password is incorrect', [], 400);
  }

  user.password = newPassword;
  await user.save();
  return apiResponse.success(res, null, 'Password changed successfully');
};

// @desc    Delete account
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return apiResponse.error(res, 'User not found', [], 404);
  }

  await user.deleteOne();
  return apiResponse.success(res, null, 'Account deleted successfully');
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};
