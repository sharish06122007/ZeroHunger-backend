// models/Food.js
const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['cooked', 'raw', 'packaged', 'beverage', 'bakery', 'dairy', 'other'],
      default: 'other',
    },
    quantity: { type: String, required: true, trim: true },
    quantityUnit: { type: String, default: 'servings' },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['available', 'reserved', 'collected', 'expired'],
      default: 'available',
    },
    expiryTime: { type: Date, required: true },
    pickupTime: { type: String, trim: true, default: '' },
    pickupAddress: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    donatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantName: { type: String, trim: true, default: '' },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

FoodSchema.index({ location: '2dsphere' });
FoodSchema.index({ status: 1 });
FoodSchema.index({ donatedBy: 1 });
FoodSchema.index({ expiryTime: 1 });

module.exports = mongoose.model('Food', FoodSchema);
