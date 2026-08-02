// models/Donation.js
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'succeeded', 'failed'],
      default: 'pending',
    },
    receiptUrl: { type: String }, // URL to stored receipt (e.g., PDF or image)
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);
