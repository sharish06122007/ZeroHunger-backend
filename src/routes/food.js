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

/**
 * @openapi
 * /api/v1/food:
 *   get:
 *     summary: Discover surplus food rescue listings
 *     description: Retrieve active surplus food listings filtered by category, status, city, or search term.
 *     tags:
 *       - Food Donations
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search keyword for title, city, or donor name
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [cooked, raw, packaged, beverage, bakery, dairy, other] }
 *         description: Filter by food category
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [available, reserved, collected, expired] }
 *         description: Filter by availability status
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *         description: Filter listings by city
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Array of food listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Food'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Post a new surplus food donation
 *     description: Publish a new surplus food listing. Requires authenticated donor or restaurant role. Supports optional multipart image attachments.
 *     tags:
 *       - Food Donations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, quantity, expiryTime]
 *             properties:
 *               title: { type: string, example: '50 Fresh Gourmet Dinner Boxes' }
 *               category: { type: string, enum: [cooked, raw, packaged, beverage, bakery, dairy, other], example: 'cooked' }
 *               quantity: { type: string, example: '50 boxes' }
 *               expiryTime: { type: string, format: 'date-time', example: '2026-08-05T18:00:00.000Z' }
 *               pickupTime: { type: string, example: 'Today between 5 PM - 8 PM' }
 *               city: { type: string, example: 'San Francisco' }
 *               pickupAddress: { type: string, example: '123 Market St, Dock 4' }
 *               description: { type: string, example: 'Surplus dinner meals stored in thermal food containers.' }
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, quantity, expiryTime]
 *             properties:
 *               title: { type: string }
 *               category: { type: string }
 *               quantity: { type: string }
 *               expiryTime: { type: string, format: 'date-time' }
 *               pickupTime: { type: string }
 *               city: { type: string }
 *               pickupAddress: { type: string }
 *               description: { type: string }
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Food donation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Food'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/', asyncHandler(getAllFood));

/**
 * @openapi
 * /api/v1/food/me:
 *   get:
 *     summary: Retrieve user's posted food listings
 *     description: Returns all surplus food donations posted by the authenticated user.
 *     tags:
 *       - Food Donations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's food donations retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Food'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', protect, asyncHandler(getMyFood));

/**
 * @openapi
 * /api/v1/food/{id}:
 *   get:
 *     summary: Get single food listing by ID
 *     description: Retrieve detailed metadata for a specific food rescue listing.
 *     tags:
 *       - Food Donations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB Food Document ObjectId
 *     responses:
 *       200:
 *         description: Food listing detail retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Food'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Update food listing details
 *     description: Update title, category, quantity, expiry time, or status of an existing food listing.
 *     tags:
 *       - Food Donations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               status: { type: string, enum: [available, reserved, collected, expired] }
 *               quantity: { type: string }
 *               expiryTime: { type: string, format: 'date-time' }
 *     responses:
 *       200:
 *         description: Food listing updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Food'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete a food listing
 *     description: Permanently remove a food donation listing.
 *     tags:
 *       - Food Donations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Food listing deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', asyncHandler(getFoodById));
router.post('/', protect, role('restaurant', 'donor', 'admin'), upload.array('images', 5), createFoodValidator, validate, asyncHandler(createFood));
router.put('/:id', protect, upload.array('images', 5), updateFoodValidator, validate, asyncHandler(updateFood));
router.delete('/:id', protect, asyncHandler(deleteFood));

module.exports = router;
