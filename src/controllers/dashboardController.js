// controllers/dashboardController.js
const User = require('../models/User');
const Food = require('../models/Food');
const Request = require('../models/Request');
const Donation = require('../models/Donation');
const apiResponse = require('../utils/apiResponse');

const getStats = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  const [totalUsers, totalFood, totalRequests, availableFood, completedRequests] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Food.countDocuments({ isActive: true }),
    Request.countDocuments({}),
    Food.countDocuments({ status: 'available', isActive: true }),
    Request.countDocuments({ status: 'completed' }),
  ]);

  let roleStats = {};

  if (role === 'restaurant' || role === 'donor') {
    const [myFood, myPending, myCompleted] = await Promise.all([
      Food.countDocuments({ donatedBy: userId }),
      Request.countDocuments({ status: 'pending', food: { $in: await Food.find({ donatedBy: userId }).select('_id') } }),
      Food.countDocuments({ donatedBy: userId, status: 'collected' }),
    ]);
    roleStats = { myFood, myPending, myCompleted };
  }

  if (role === 'ngo' || role === 'receiver') {
    const [myRequests, pendingRequests, completedReceived] = await Promise.all([
      Request.countDocuments({ requestedBy: userId }),
      Request.countDocuments({ requestedBy: userId, status: 'pending' }),
      Request.countDocuments({ requestedBy: userId, status: 'completed' }),
    ]);
    roleStats = { myRequests, pendingRequests, completedReceived };
  }

  if (role === 'volunteer') {
    const [assigned, completed] = await Promise.all([
      Request.countDocuments({ assignedVolunteer: userId, status: 'in_transit' }),
      Request.countDocuments({ assignedVolunteer: userId, status: 'completed' }),
    ]);
    roleStats = { assigned, completed };
  }

  return apiResponse.success(res, {
    global: { totalUsers, totalFood, totalRequests, availableFood, completedRequests },
    role: roleStats,
  }, 'Dashboard stats retrieved');
};

const getRecentActivity = async (req, res) => {
  const [recentFood, recentRequests] = await Promise.all([
    Food.find({ isActive: true })
      .populate('donatedBy', 'fullName organizationName')
      .sort({ createdAt: -1 }).limit(5).select('title category status createdAt restaurantName images'),
    Request.find({})
      .populate('food', 'title')
      .populate('requestedBy', 'fullName role')
      .sort({ createdAt: -1 }).limit(5).select('status createdAt'),
  ]);

  return apiResponse.success(res, { recentFood, recentRequests }, 'Recent activity retrieved');
};

const getChartData = async (req, res) => {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (5 - i));
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short' }) };
  });

  const foodByMonth = await Promise.all(
    months.map(({ year, month }) =>
      Food.countDocuments({
        createdAt: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1),
        },
        isActive: true,
      }).then(count => ({ month: months.find(m => m.year === year && m.month === month)?.label, count }))
    )
  );

  const requestsByMonth = await Promise.all(
    months.map(({ year, month }) =>
      Request.countDocuments({
        createdAt: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1),
        },
      }).then(count => ({ month: months.find(m => m.year === year && m.month === month)?.label, count }))
    )
  );

  const foodByCategory = await Food.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const requestsByStatus = await Request.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return apiResponse.success(res, {
    foodByMonth,
    requestsByMonth,
    foodByCategory,
    requestsByStatus,
  }, 'Chart data retrieved');
};

const adminGetAllUsers = async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { fullName: new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return apiResponse.success(res, {
    users,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  }, 'Users retrieved');
};

const adminUpdateUser = async (req, res) => {
  const { role, isActive, isVerified } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return apiResponse.error(res, 'User not found', [], 404);

  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (isVerified !== undefined) user.isVerified = isVerified;

  await user.save();
  return apiResponse.success(res, user, 'User updated');
};

const adminDeleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return apiResponse.error(res, 'User not found', [], 404);
  user.isActive = false;
  await user.save();
  return apiResponse.success(res, {}, 'User deactivated');
};

module.exports = { getStats, getRecentActivity, getChartData, adminGetAllUsers, adminUpdateUser, adminDeleteUser };
