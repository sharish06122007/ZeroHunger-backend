// routes/requests.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const { createRequest, getMyRequests, getIncomingRequests, updateRequestStatus, getRequestById, adminGetAllRequests } = require('../controllers/requestController');
const protect = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.get('/', asyncHandler(getMyRequests));
router.post('/', asyncHandler(createRequest));
router.get('/mine', asyncHandler(getMyRequests));
router.get('/incoming', asyncHandler(getIncomingRequests));
router.get('/admin/all', role('admin'), asyncHandler(adminGetAllRequests));
router.get('/:id', asyncHandler(getRequestById));
router.put('/:id/status', asyncHandler(updateRequestStatus));

module.exports = router;
