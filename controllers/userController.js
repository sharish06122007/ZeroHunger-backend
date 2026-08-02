// controllers/userController.js
const User = require('../models/User');
const apiResponse = require('../utils/apiResponse');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return apiResponse.error(res, 'User not found', [], 404);
  }
  return apiResponse.success(res, user, 'Profile retrieved successfully');
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    return apiResponse.error(res, 'User not found', [], 404);
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return apiResponse.error(res, 'Email already in use', [], 400);
    }
    user.email = email;
  }

  if (name) user.name = name;

  const updatedUser = await user.save();

  return apiResponse.success(
    res,
    {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
    },
    'Profile updated successfully'
  );
};

// @desc    Change user password
// @route   PUT /api/users/me/password
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

// @desc    Admin: Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
const adminGetAllUsers = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments();
  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return apiResponse.success(
    res,
    {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    'Users list retrieved successfully'
  );
};

// @desc    Admin: Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const adminUpdateUserRole = async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return apiResponse.error(res, 'User not found', [], 404);
  }

  user.role = role;
  await user.save();

  return apiResponse.success(
    res,
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    'User role updated successfully'
  );
};

// @desc    Admin: Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const adminDeleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return apiResponse.error(res, 'User not found', [], 404);
  }

  await user.deleteOne();
  return apiResponse.success(res, null, 'User deleted successfully');
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  adminGetAllUsers,
  adminUpdateUserRole,
  adminDeleteUser,
};
