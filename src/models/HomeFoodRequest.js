// models/HomeFoodRequest.js
const mongoose = require('mongoose');

const HomeFoodRequestSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodCategory: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Traditional'],
      required: true
    },
    foodItemName: { type: String, required: true, trim: true },
    numberOfPeople: { type: Number, required: true, min: 1 },
    quantityRequired: { type: Number, required: true, min: 1 },
    budgetRange: { type: String, required: true },
    deliveryAddress: { type: String, required: true, trim: true },
    requiredDeliveryTime: { type: Date, required: true },
    specialInstructions: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomeFoodRequest', HomeFoodRequestSchema);
