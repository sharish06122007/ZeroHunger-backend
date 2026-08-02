// controllers/requestController.js
const mongoose = require('mongoose');
const Request = require('../models/Request');
const Food = require('../models/Food');
const Notification = require('../models/Notification');
const apiResponse = require('../utils/apiResponse');
const { normalizeRequestStatus } = require('../utils/requestStatus');

const createRequest = async (req, res) => {
  const { foodId, notes, deliveryAddress } = req.body;

  const food = await Food.findById(foodId);
  if (!food) return apiResponse.error(res, 'Food listing not found', [], 404);
  if (food.status !== 'available') return apiResponse.error(res, 'This food is no longer available', [], 400);
  if (food.donatedBy.toString() === req.user._id.toString()) {
    return apiResponse.error(res, 'You cannot request your own food listing', [], 400);
  }

  const existingRequest = await Request.findOne({ food: foodId, requestedBy: req.user._id, status: { $in: ['pending', 'approved', 'accepted'] } });
  if (existingRequest) return apiResponse.error(res, 'You already have an active request for this food', [], 400);

  const request = await Request.create({
    food: foodId,
    requestedBy: req.user._id,
    notes: notes || '',
    deliveryAddress: deliveryAddress || req.user.address || '',
    pickupAddress: food.pickupAddress,
  });

  food.status = 'reserved';
  food.reservedBy = req.user._id;
  await food.save();

  await Notification.create({
    recipient: food.donatedBy,
    title: 'New Food Request',
    message: `${req.user.fullName} has requested your food listing: "${food.title}"`,
    type: 'request_update',
  });

  const populated = await request.populate(['food', 'requestedBy']);
  return apiResponse.success(res, populated, 'Request submitted successfully', 201);
};

const getMyRequests = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = { requestedBy: req.user._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [requests, total] = await Promise.all([
    Request.find(filter)
      .populate('food', 'title images status category pickupAddress restaurantName expiryTime')
      .populate('assignedVolunteer', 'fullName email phone')
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Request.countDocuments(filter),
  ]);

  return apiResponse.success(res, {
    requests,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  }, 'Requests retrieved');
};

const getIncomingRequests = async (req, res) => {
  const myFoods = await Food.find({ donatedBy: req.user._id }).select('_id');
  const foodIds = myFoods.map(f => f._id);

  const { page = 1, limit = 10, status } = req.query;
  const filter = { food: { $in: foodIds } };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [requests, total] = await Promise.all([
    Request.find(filter)
      .populate('food', 'title images status category')
      .populate('requestedBy', 'fullName email phone role organizationName')
      .populate('assignedVolunteer', 'fullName email phone')
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Request.countDocuments(filter),
  ]);

  return apiResponse.success(res, {
    requests,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  }, 'Incoming requests retrieved');
};

const updateRequestStatus = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return apiResponse.error(res, 'Invalid request ID', [], 400);
  }

  const { status, rejectionReason } = req.body;
  const request = await Request.findById(req.params.id).populate('food');
  if (!request) return apiResponse.error(res, 'Request not found', [], 404);

  const food = request.food;
  const isDonor = food.donatedBy.toString() === req.user._id.toString();
  const isRequester = request.requestedBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isVolunteer = req.user.role === 'volunteer';

  if (!isDonor && !isRequester && !isAdmin && !isVolunteer) {
    return apiResponse.error(res, 'Not authorized', [], 403);
  }

  const normalizedStatus = normalizeRequestStatus(status);
  const allowedTransitions = {
    approved: ['pending'],
    rejected: ['pending'],
    in_transit: ['approved', 'accepted'],
    completed: ['in_transit'],
    cancelled: ['pending', 'approved', 'accepted'],
  };

  if (!allowedTransitions[normalizedStatus]) {
    return apiResponse.error(res, `Unsupported request status: ${status}`, [], 400);
  }

  const currentStatus = normalizeRequestStatus(request.status);
  if (!allowedTransitions[normalizedStatus]?.includes(currentStatus)) {
    return apiResponse.error(res, `Cannot transition from "${currentStatus}" to "${normalizedStatus}"`, [], 400);
  }

  request.status = normalizedStatus;
  if (normalizedStatus === 'approved') request.acceptedAt = new Date();
  if (normalizedStatus === 'completed') {
    request.completedAt = new Date();
    await Food.findByIdAndUpdate(food._id, { status: 'collected', collectedBy: request.requestedBy });
  }
  if (normalizedStatus === 'rejected') {
    request.rejectionReason = rejectionReason || '';
    await Food.findByIdAndUpdate(food._id, { status: 'available', reservedBy: null });
  }
  if (normalizedStatus === 'cancelled') {
    request.cancelledAt = new Date();
    await Food.findByIdAndUpdate(food._id, { status: 'available', reservedBy: null });
  }
  if (normalizedStatus === 'in_transit' && isVolunteer) {
    request.assignedVolunteer = req.user._id;
  }

  await request.save();

  await Notification.create({
    recipient: request.requestedBy,
    title: 'Request Status Updated',
    message: `Your request for "${food.title}" is now: ${normalizedStatus.replace('_', ' ').toUpperCase()}`,
    type: normalizedStatus === 'approved' ? 'request_approved' : 'request_update',
  });

  return apiResponse.success(res, request, 'Request status updated');
};

const getRequestById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return apiResponse.error(res, 'Invalid request ID', [], 400);
  }

  const request = await Request.findById(req.params.id)
    .populate('food')
    .populate('requestedBy', 'fullName email phone role')
    .populate('assignedVolunteer', 'fullName email phone');

  if (!request) return apiResponse.error(res, 'Request not found', [], 404);
  return apiResponse.success(res, request, 'Request retrieved');
};

const adminGetAllRequests = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);
  const [requests, total] = await Promise.all([
    Request.find(filter)
      .populate('food', 'title images status')
      .populate('requestedBy', 'fullName email role')
      .populate('assignedVolunteer', 'fullName email')
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Request.countDocuments(filter),
  ]);

  return apiResponse.success(res, {
    requests,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  }, 'All requests retrieved');
};

module.exports = { createRequest, getMyRequests, getIncomingRequests, updateRequestStatus, getRequestById, adminGetAllRequests };
