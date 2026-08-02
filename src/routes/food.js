// routes/food.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const { createFood, getAllFood, getFoodById, updateFood, deleteFood, getMyFood } = require('../controllers/foodController');
const { createFoodValidator, updateFoodValidator } = require('../validators/foodValidator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `food-${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

router.get('/', asyncHandler(getAllFood));
router.get('/me', protect, asyncHandler(getMyFood));
router.get('/:id', asyncHandler(getFoodById));
router.post('/', protect, role('restaurant', 'donor', 'admin'), upload.array('images', 5), createFoodValidator, validate, asyncHandler(createFood));
router.put('/:id', protect, upload.array('images', 5), updateFoodValidator, validate, asyncHandler(updateFood));
router.delete('/:id', protect, asyncHandler(deleteFood));

module.exports = router;
