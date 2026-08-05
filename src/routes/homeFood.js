// routes/homeFood.js
const express = require('express');
const router = express.Router();
const homeFoodController = require('../controllers/homeFoodController');
const protect = require('../middleware/auth');
const role = require('../middleware/role');

router.use(protect);

router.post('/requests', role('customer', 'receiver', 'admin'), homeFoodController.createRequest);
router.get('/requests/nearby', role('home_food_maker', 'admin'), homeFoodController.getNearbyRequests);
router.post('/requests/:id/accept', role('home_food_maker', 'admin'), homeFoodController.acceptRequest);
router.patch('/orders/:id/status', role('home_food_maker', 'delivery_partner', 'admin'), homeFoodController.updateOrderStatus);

module.exports = router;
