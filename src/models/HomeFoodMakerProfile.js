// models/HomeFoodMakerProfile.js
const mongoose = require('mongoose');

const HomeFoodMakerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    foodCategories: [{ type: String }],
    experience: { type: String, trim: true, default: '' },
    locationArea: { type: String, trim: true, default: '' },
    ratings: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    availableFoodItems: [{
      name: { type: String, required: true },
      price: { type: Number, required: true },
      description: { type: String, default: '' }
    }],
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomeFoodMakerProfile', HomeFoodMakerProfileSchema);
