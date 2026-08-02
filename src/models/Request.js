// models/Request.js
const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'in_transit', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String, trim: true, default: '' },
    pickupAddress: { type: String, trim: true, default: '' },
    deliveryAddress: { type: String, trim: true, default: '' },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

RequestSchema.index({ requestedBy: 1 });
RequestSchema.index({ food: 1 });
RequestSchema.index({ status: 1 });

module.exports = mongoose.model('Request', RequestSchema);
