const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  amenities: [{ type: String }],
  images: [{ type: String }],
  gender: { type: String, enum: ['boys', 'girls', 'co-ed', 'any'], default: 'any' },
  distance: { type: String, default: 'Not specified' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

propertySchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Property', propertySchema);
