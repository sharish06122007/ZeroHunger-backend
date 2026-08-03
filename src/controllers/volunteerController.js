// controllers/volunteerController.js - Volunteer Mission Control APIs
const Request = require('../models/Request');
const Food = require('../models/Food');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const apiResponse = require('../utils/apiResponse');
const { emitEvent } = require('../config/socket');

/**
 * GET /api/v1/volunteer/missions
 * Active available & assigned missions
 */
const getMissions = async (req, res) => {
  const volunteerId = req.user._id;

  const [available, assigned] = await Promise.all([
    Request.find({ status: 'approved' })
      .populate('food')
      .populate('requestedBy', 'fullName organizationName phone city address')
      .sort({ createdAt: -1 }),
    Request.find({ assignedVolunteer: volunteerId, status: { $in: ['accepted', 'in_transit'] } })
      .populate('food')
      .populate('requestedBy', 'fullName organizationName phone city address')
      .sort({ updatedAt: -1 }),
  ]);

  return apiResponse.success(res, { available, assigned }, 'Volunteer missions retrieved');
};

/**
 * GET /api/v1/volunteer/nearby
 */
const getNearbyMissions = async (req, res) => {
  const { city } = req.query;
  const filter = { status: { $in: ['approved', 'pending'] } };

  const missions = await Request.find(filter)
    .populate({
      path: 'food',
      match: city ? { city: new RegExp(city, 'i') } : {},
    })
    .populate('requestedBy', 'fullName organizationName phone city')
    .sort({ createdAt: -1 });

  const filtered = missions.filter(m => m.food !== null);
  return apiResponse.success(res, filtered, 'Nearby missions retrieved');
};

/**
 * GET /api/v1/volunteer/history
 */
const getHistory = async (req, res) => {
  const volunteerId = req.user._id;
  const history = await Request.find({
    assignedVolunteer: volunteerId,
    status: { $in: ['completed', 'rejected', 'cancelled'] },
  })
    .populate('food')
    .populate('requestedBy', 'fullName organizationName')
    .sort({ updatedAt: -1 });

  return apiResponse.success(res, history, 'Volunteer mission history retrieved');
};

/**
 * POST /api/v1/volunteer/accept
 */
const acceptMission = async (req, res) => {
  const { requestId } = req.body;
  const volunteerId = req.user._id;

  const request = await Request.findById(requestId).populate('food');
  if (!request) {
    return apiResponse.error(res, 'Mission request not found', [], 404);
  }

  if (request.status === 'in_transit' || request.status === 'completed') {
    return apiResponse.error(res, 'Mission is already taken or completed', [], 400);
  }

  request.assignedVolunteer = volunteerId;
  request.status = 'in_transit';
  request.acceptedAt = new Date();
  await request.save();

  if (request.food) {
    request.food.status = 'reserved';
    request.food.reservedBy = volunteerId;
    await request.food.save();
  }

  // Create notification for requester
  await Notification.create({
    recipient: request.requestedBy,
    title: 'Mission Accepted 🚗',
    message: `Volunteer ${req.user.fullName} has accepted your food rescue request.`,
    type: 'request_update',
  });

  // Emit Socket.IO Event
  emitEvent('mission:accepted', { requestId: request._id, volunteerName: req.user.fullName });
  emitEvent('analytics:update', { message: 'New mission accepted' });

  return apiResponse.success(res, request, 'Mission accepted successfully');
};

/**
 * POST /api/v1/volunteer/deliver
 */
const deliverMission = async (req, res) => {
  const { requestId, notes } = req.body;
  const volunteerId = req.user._id;

  const request = await Request.findById(requestId).populate('food');
  if (!request) {
    return apiResponse.error(res, 'Mission request not found', [], 404);
  }

  request.status = 'completed';
  request.completedAt = new Date();
  if (notes) request.notes = notes;
  await request.save();

  if (request.food) {
    request.food.status = 'collected';
    request.food.collectedBy = volunteerId;
    await request.food.save();

    // Record completed donation
    await Donation.create({
      food: request.food._id,
      donor: request.food.donatedBy,
      recipient: request.requestedBy,
      volunteer: volunteerId,
      status: 'delivered',
      quantity: request.food.quantity,
      deliveredAt: new Date(),
    });
  }

  // Create notification for requester
  await Notification.create({
    recipient: request.requestedBy,
    title: 'Food Delivered! 🎉',
    message: `Your food request for "${request.food?.title || 'Food'}" has been delivered successfully.`,
    type: 'request_approved',
  });

  // Emit Socket.IO Events
  emitEvent('mission:delivered', { requestId: request._id, volunteerName: req.user.fullName });
  emitEvent('analytics:update', { message: 'Mission completed' });

  return apiResponse.success(res, request, 'Mission completed and marked delivered');
};

/**
 * POST /api/v1/volunteer/reject
 */
const rejectMission = async (req, res) => {
  const { requestId, reason } = req.body;

  const request = await Request.findById(requestId);
  if (!request) return apiResponse.error(res, 'Request not found', [], 404);

  request.status = 'rejected';
  request.rejectionReason = reason || 'Declined by volunteer';
  await request.save();

  return apiResponse.success(res, request, 'Mission declined');
};

/**
 * GET /api/v1/volunteer/stats
 */
const getVolunteerStats = async (req, res) => {
  const volunteerId = req.user._id;

  const [completedCount, activeCount] = await Promise.all([
    Request.countDocuments({ assignedVolunteer: volunteerId, status: 'completed' }),
    Request.countDocuments({ assignedVolunteer: volunteerId, status: 'in_transit' }),
  ]);

  const mealsDelivered = completedCount * 35;
  const distanceCoveredKm = Math.round(completedCount * 4.2 * 10) / 10;
  const rescueScore = completedCount * 120 + 50;

  return apiResponse.success(res, {
    completedMissions: completedCount,
    activeMissions: activeCount,
    mealsDelivered,
    distanceCoveredKm,
    volunteerRating: 4.9,
    leaderboardRank: 3,
    rescueScore,
  }, 'Volunteer stats retrieved');
};

module.exports = {
  getMissions,
  getNearbyMissions,
  getHistory,
  acceptMission,
  deliverMission,
  rejectMission,
  getVolunteerStats,
};
