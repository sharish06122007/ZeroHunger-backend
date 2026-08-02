// routes/dashboard.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const { getStats, getRecentActivity, getChartData, adminGetAllUsers, adminUpdateUser, adminDeleteUser } = require('../controllers/dashboardController');
const protect = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /api/v1/dashboard/stats:
 *   get:
 *     summary: Retrieve executive key metrics
 *     description: Returns aggregated dashboard metrics including active surplus, meals saved, completed deliveries, and CO2 offset.
 *     tags:
 *       - Dashboard & Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics payload
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 totalDonations: 142
 *                 availableFood: 18
 *                 completedRequests: 128
 *                 activeVolunteers: 45
 *                 mealsSaved: 1240
 *                 co2SavedKg: 850
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', asyncHandler(getStats));

/**
 * @openapi
 * /api/v1/dashboard/activity:
 *   get:
 *     summary: Get recent platform activity stream
 *     description: Retrieves live activity logs for food donations, claims, and courier dispatches.
 *     tags:
 *       - Dashboard & Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stream of recent activities
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/activity', asyncHandler(getRecentActivity));

/**
 * @openapi
 * /api/v1/dashboard/charts:
 *   get:
 *     summary: Get weekly rescue analytics trend data
 *     description: Returns weekly trend data for rendering SVG impact charts.
 *     tags:
 *       - Dashboard & Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly chart dataset
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/charts', asyncHandler(getChartData));

/**
 * @openapi
 * /api/v1/dashboard/users:
 *   get:
 *     summary: List all registered platform users
 *     description: Requires Admin role. Returns all user accounts across donors, NGOs, volunteers, and restaurants.
 *     tags:
 *       - Admin Control
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/users', role('admin'), asyncHandler(adminGetAllUsers));

/**
 * @openapi
 * /api/v1/dashboard/users/{id}:
 *   put:
 *     summary: Update user role or verification status
 *     description: Requires Admin role. Modify a user's role or verification status.
 *     tags:
 *       - Admin Control
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
 *               role: { type: string, enum: [restaurant, donor, ngo, volunteer, admin] }
 *               isVerified: { type: boolean }
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *   delete:
 *     summary: Suspend or delete user account
 *     description: Requires Admin role. Delete a user account from the platform.
 *     tags:
 *       - Admin Control
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User account deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.put('/users/:id', role('admin'), asyncHandler(adminUpdateUser));
router.delete('/users/:id', role('admin'), asyncHandler(adminDeleteUser));

module.exports = router;
