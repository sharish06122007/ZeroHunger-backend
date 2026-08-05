// models/HomeFoodOrder.js
const mongoose = require('mongoose');

const HomeFoodOrderSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'HomeFoodRequest', required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    makerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    pricing: {
      foodCost: { type: Number, required: true },
      deliveryFee: { type: Number, required: true },
      commission: { type: Number, required: true },
      total: { type: Number, required: true }
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'assigned', 'collected', 'out_for_delivery', 'delivered'],
      default: 'pending'
    },
    temporaryChatId: { type: String, default: null } // Used for identifying room in Socket.io
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomeFoodOrder', HomeFoodOrderSchema);
