// routes/requests.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const { createRequest, getMyRequests, getIncomingRequests, updateRequestStatus, getRequestById, adminGetAllRequests } = require('../controllers/requestController');
const protect = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /api/v1/requests:
 *   get:
 *     summary: Retrieve user's food requests
 *     description: Returns a list of all food claims and requirements submitted by the authenticated user or organization.
 *     tags:
 *       - Food Requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of food requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Request'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: Submit a new food request or claim
 *     description: Create a request for surplus food package allocation for an NGO shelter or community kitchen.
 *     tags:
 *       - Food Requests
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [foodTitle, quantityRequested]
 *             properties:
 *               foodId: { type: string, example: '66a9c80f8f413d29a01049c5' }
 *               foodTitle: { type: string, example: '50 Cooked Dinner Boxes' }
 *               quantityRequested: { type: string, example: '50 boxes' }
 *               notes: { type: string, example: 'Refrigerated van transport arranged for 6 PM pickup.' }
 *     responses:
 *       201:
 *         description: Request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', asyncHandler(getMyRequests));
router.post('/', asyncHandler(createRequest));

/**
 * @openapi
 * /api/v1/requests/mine:
 *   get:
 *     summary: Get my submitted requests
 *     description: Fetch food claims submitted by the currently logged-in account.
 *     tags:
 *       - Food Requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Request'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/mine', asyncHandler(getMyRequests));

/**
 * @openapi
 * /api/v1/requests/incoming:
 *   get:
 *     summary: Get incoming requests for donor listings
 *     description: Returns claim requests received by a donor for their published food items.
 *     tags:
 *       - Food Requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Incoming requests retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Request'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/incoming', asyncHandler(getIncomingRequests));

/**
 * @openapi
 * /api/v1/requests/admin/all:
 *   get:
 *     summary: System admin view of all platform requests
 *     description: Requires Administrator role. Returns complete system requests audit log across all users.
 *     tags:
 *       - Admin Control
 *       - Food Requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All requests array
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/admin/all', role('admin'), asyncHandler(adminGetAllRequests));

/**
 * @openapi
 * /api/v1/requests/{id}:
 *   get:
 *     summary: Get request details by ID
 *     description: Retrieve metadata and status for a single request document.
 *     tags:
 *       - Food Requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Request document
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', asyncHandler(getRequestById));

/**
 * @openapi
 * /api/v1/requests/{id}/status:
 *   put:
 *     summary: Update request fulfillment status
 *     description: Update status of a request (approved, rejected, completed, cancelled).
 *     tags:
 *       - Food Requests
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, completed, cancelled]
 *                 example: approved
 *     responses:
 *       200:
 *         description: Request status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id/status', asyncHandler(updateRequestStatus));

module.exports = router;
