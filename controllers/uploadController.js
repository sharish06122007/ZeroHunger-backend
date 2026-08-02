// controllers/uploadController.js
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const apiResponse = require('../utils/apiResponse');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter (allow images and pdf documents)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|pdf/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpg, png, webp, gif) and PDF documents are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE, 10) : 5 * 1024 * 1024 }, // 5MB default
  fileFilter,
});

// @desc    Upload file handler
// @route   POST /api/upload
// @access  Private
const uploadFile = (req, res) => {
  if (!req.file) {
    return apiResponse.error(res, 'No file uploaded', [], 400);
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return apiResponse.success(
    res,
    {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
    },
    'File uploaded successfully',
    201
  );
};

module.exports = {
  upload,
  uploadFile,
};
