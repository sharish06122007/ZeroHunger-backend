// routes/upload.js
const express = require('express');
const { upload, uploadFile } = require('../controllers/uploadController');
const protect = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadFile);

module.exports = router;
