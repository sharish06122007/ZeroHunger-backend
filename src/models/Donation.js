// models/Donation.js
const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    quantity: { type: String, default: '' },
    notes: { type: String, default: '' },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

DonationSchema.index({ donor: 1 });
DonationSchema.index({ status: 1 });

module.exports = mongoose.model('Donation', DonationSchema);
