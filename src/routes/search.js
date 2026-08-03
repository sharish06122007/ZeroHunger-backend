// routes/search.js - Global Search Route
const express = require('express');
const asyncHandler = require('express-async-handler');
const { globalSearch } = require('../controllers/searchController');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/', asyncHandler(globalSearch));

module.exports = router;
