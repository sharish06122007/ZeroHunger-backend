// controllers/homeFoodController.js
const HomeFoodRequest = require('../models/HomeFoodRequest');
const HomeFoodOrder = require('../models/HomeFoodOrder');
const HomeFoodMakerProfile = require('../models/HomeFoodMakerProfile');
const Chat = require('../models/Chat');
const { emitEvent } = require('../config/socket');

// Customer creates a food request
exports.createRequest = async (req, res, next) => {
  try {
    const { foodCategory, foodItemName, numberOfPeople, quantityRequired, budgetRange, deliveryAddress, requiredDeliveryTime, specialInstructions } = req.body;
    
    const newRequest = new HomeFoodRequest({
      customerId: req.user.id,
      foodCategory,
      foodItemName,
      numberOfPeople,
      quantityRequired,
      budgetRange,
      deliveryAddress,
      requiredDeliveryTime,
      specialInstructions
    });
    
    await newRequest.save();

    // Emit event to notify nearby makers
    emitEvent('new_home_food_request', newRequest);

    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    next(error);
  }
};

// Maker views nearby pending requests
exports.getNearbyRequests = async (req, res, next) => {
  try {
    // Basic implementation: fetch all pending for now
    const requests = await HomeFoodRequest.find({ status: 'pending' }).populate('customerId', 'fullName');
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// Maker accepts a request
exports.acceptRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await HomeFoodRequest.findById(id);
    
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Request is no longer available' });

    request.status = 'accepted';
    await request.save();

    // Generate pricing (Mock simple logic)
    const foodCost = 400; // Mock calculation
    const deliveryFee = 40;
    const commission = 20;
    const total = foodCost + deliveryFee + commission;

    // Create Order
    const newOrder = new HomeFoodOrder({
      requestId: request._id,
      customerId: request.customerId,
      makerId: req.user.id,
      pricing: { foodCost, deliveryFee, commission, total }
    });
    await newOrder.save();

    // Create secure chat
    const newChat = new Chat({
      orderId: newOrder._id,
      participants: [request.customerId, req.user.id]
    });
    await newChat.save();

    // Notify customer
    emitEvent(`request_accepted_${request.customerId}`, newOrder);

    res.status(200).json({ success: true, data: newOrder });
  } catch (error) {
    next(error);
  }
};

// Update order/delivery status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await HomeFoodOrder.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    const request = await HomeFoodRequest.findById(order.requestId);

    if (['preparing', 'ready', 'out_for_delivery', 'delivered'].includes(status)) {
      request.status = status;
      await request.save();
    }
    
    if (['assigned', 'collected', 'out_for_delivery', 'delivered'].includes(status)) {
      order.deliveryStatus = status;
    }

    if (status === 'delivered') {
      order.paymentStatus = 'completed';
      // Disable chat after delivery
      await Chat.findOneAndUpdate({ orderId: order._id }, { isActive: false });
    }

    await order.save();

    // Notify participants
    emitEvent(`order_status_update_${order.customerId}`, { orderId: order._id, status });
    emitEvent(`order_status_update_${order.makerId}`, { orderId: order._id, status });
    if(order.deliveryPartnerId) {
       emitEvent(`order_status_update_${order.deliveryPartnerId}`, { orderId: order._id, status });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
