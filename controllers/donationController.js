// controllers/donationController.js
const Donation = require('../models/Donation');
const Project = require('../models/Project');
const apiResponse = require('../utils/apiResponse');

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private
const createDonation = async (req, res) => {
  const { project: projectId, amount, paymentStatus, receiptUrl } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    return apiResponse.error(res, 'Target project not found', [], 404);
  }

  const donation = await Donation.create({
    donor: req.user.id,
    project: projectId,
    amount,
    paymentStatus: paymentStatus || 'succeeded',
    receiptUrl: receiptUrl || '',
  });

  const populated = await donation.populate([
    { path: 'donor', select: 'name email' },
    { path: 'project', select: 'title location' },
  ]);

  return apiResponse.success(res, populated, 'Donation processed successfully', 201);
};

// @desc    Get user's own donations
// @route   GET /api/donations/me
// @access  Private
const getMyDonations = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const total = await Donation.countDocuments({ donor: req.user.id });
  const donations = await Donation.find({ donor: req.user.id })
    .populate('project', 'title location')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return apiResponse.success(
    res,
    {
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    'Your donations retrieved successfully'
  );
};

// @desc    Get donation by ID
// @route   GET /api/donations/:id
// @access  Private (Donor or Admin)
const getDonationById = async (req, res) => {
  const donation = await Donation.findById(req.params.id)
    .populate('donor', 'name email')
    .populate('project', 'title location');

  if (!donation) {
    return apiResponse.error(res, 'Donation record not found', [], 404);
  }

  if (donation.donor._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return apiResponse.error(res, 'Forbidden - Access denied', [], 403);
  }

  return apiResponse.success(res, donation, 'Donation details retrieved successfully');
};

// @desc    Admin: Get all donations with stats
// @route   GET /api/admin/donations
// @access  Private (Admin)
const adminGetAllDonations = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const total = await Donation.countDocuments();
  const donations = await Donation.find()
    .populate('donor', 'name email')
    .populate('project', 'title location')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Aggregate total amount raised
  const totalAmountResult = await Donation.aggregate([
    { $match: { paymentStatus: 'succeeded' } },
    { $group: { _id: null, totalRaised: { $sum: '$amount' } } },
  ]);

  const totalRaised = totalAmountResult.length > 0 ? totalAmountResult[0].totalRaised : 0;

  return apiResponse.success(
    res,
    {
      donations,
      stats: {
        totalRaised,
        totalCount: total,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    'All donations retrieved successfully'
  );
};

module.exports = {
  createDonation,
  getMyDonations,
  getDonationById,
  adminGetAllDonations,
};
