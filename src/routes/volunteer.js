// routes/volunteer.js - Volunteer Mission Control Routes
const express = require('express');
const asyncHandler = require('express-async-handler');
const {
  getMissions,
  getNearbyMissions,
  getHistory,
  acceptMission,
  deliverMission,
  rejectMission,
  getVolunteerStats,
} = require('../controllers/volunteerController');
const protect = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.get('/missions', asyncHandler(getMissions));
router.get('/nearby', asyncHandler(getNearbyMissions));
router.get('/history', asyncHandler(getHistory));
router.get('/stats', asyncHandler(getVolunteerStats));

router.post('/accept', asyncHandler(acceptMission));
router.post('/deliver', asyncHandler(deliverMission));
router.post('/reject', asyncHandler(rejectMission));

module.exports = router;
