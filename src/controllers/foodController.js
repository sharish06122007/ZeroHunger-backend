// controllers/foodController.js
const mongoose = require('mongoose');
const Food = require('../models/Food');
const Request = require('../models/Request');
const apiResponse = require('../utils/apiResponse');
const { emitEvent } = require('../config/socket');

const createFood = async (req, res) => {
  const {
    title, description, category, quantity, quantityUnit,
    expiryTime, pickupTime, pickupAddress, city, restaurantName, tags,
  } = req.body;

  const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

  const food = await Food.create({
    title, description, category, quantity,
    quantityUnit: quantityUnit || 'servings',
    expiryTime, pickupTime, pickupAddress, city,
    restaurantName: restaurantName || req.user.organizationName || req.user.fullName,
    donatedBy: req.user._id,
    images,
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
  });

  emitEvent('food:created', food);
  emitEvent('analytics:update', { message: 'New food listing created' });

  return apiResponse.success(res, food, 'Food listing created successfully', 201);
};

const getAllFood = async (req, res) => {
  const { status, category, city, page = 1, limit = 12, search } = req.query;
  const filter = { isActive: true };

  if (status) filter.status = status;
  else filter.status = 'available';

  if (category) filter.category = category;
  if (city) filter.city = new RegExp(city, 'i');
  if (search) filter.title = new RegExp(search, 'i');

  const skip = (Number(page) - 1) * Number(limit);
  const [foods, total] = await Promise.all([
    Food.find(filter)
      .populate('donatedBy', 'fullName email role organizationName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Food.countDocuments(filter),
  ]);

  return apiResponse.success(res, {
    foods,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  }, 'Food listings retrieved');
};

const getFoodById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return apiResponse.error(res, 'Invalid food listing ID', [], 400);
  }

  const food = await Food.findById(req.params.id)
    .populate('donatedBy', 'fullName email organizationName phone')
    .populate('reservedBy', 'fullName email')
    .populate('collectedBy', 'fullName email');

  if (!food) return apiResponse.error(res, 'Food listing not found', [], 404);
  return apiResponse.success(res, food, 'Food listing retrieved');
};

const updateFood = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return apiResponse.error(res, 'Invalid food listing ID', [], 400);
  }

  const food = await Food.findById(req.params.id);
  if (!food) return apiResponse.error(res, 'Food listing not found', [], 404);

  if (food.donatedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return apiResponse.error(res, 'Not authorized to update this listing', [], 403);
  }

  const allowedFields = ['title', 'description', 'category', 'quantity', 'quantityUnit', 'expiryTime', 'pickupTime', 'pickupAddress', 'city', 'restaurantName', 'status', 'tags'];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) food[field] = req.body[field];
  });

  if (req.files && req.files.length > 0) {
    food.images = req.files.map(f => `/uploads/${f.filename}`);
  }

  await food.save();
  return apiResponse.success(res, food, 'Food listing updated');
};

const deleteFood = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return apiResponse.error(res, 'Invalid food listing ID', [], 400);
  }

  const food = await Food.findById(req.params.id);
  if (!food) return apiResponse.error(res, 'Food listing not found', [], 404);

  if (food.donatedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return apiResponse.error(res, 'Not authorized to delete this listing', [], 403);
  }

  food.isActive = false;
  await food.save();
  return apiResponse.success(res, {}, 'Food listing removed');
};

const getMyFood = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = { donatedBy: req.user._id, isActive: true };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [foods, total] = await Promise.all([
    Food.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Food.countDocuments(filter),
  ]);

  return apiResponse.success(res, {
    foods,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  }, 'My food listings retrieved');
};

module.exports = { createFood, getAllFood, getFoodById, updateFood, deleteFood, getMyFood };
