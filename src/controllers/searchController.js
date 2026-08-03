// controllers/searchController.js - Global Search API
const Food = require('../models/Food');
const Request = require('../models/Request');
const User = require('../models/User');
const apiResponse = require('../utils/apiResponse');

const globalSearch = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return apiResponse.success(res, { foods: [], requests: [], users: [] }, 'Empty search query');
  }

  const regex = new RegExp(q.trim(), 'i');

  const [foods, requests, users] = await Promise.all([
    Food.find({
      isActive: true,
      $or: [
        { title: regex },
        { category: regex },
        { city: regex },
        { restaurantName: regex },
        { pickupAddress: regex },
      ],
    }).limit(10),
    Request.find({
      $or: [{ notes: regex }, { status: regex }, { pickupAddress: regex }],
    })
      .populate('food', 'title category')
      .populate('requestedBy', 'fullName role organizationName')
      .limit(10),
    User.find({
      isActive: true,
      $or: [{ fullName: regex }, { email: regex }, { organizationName: regex }, { city: regex }],
    }).limit(10),
  ]);

  return apiResponse.success(res, { foods, requests, users }, 'Search results retrieved');
};

module.exports = { globalSearch };
