const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  contactPhone: { type: String },
  status: { type: String, enum: ['pending', 'read', 'replied'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
