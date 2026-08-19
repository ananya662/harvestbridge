const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'quintal' },
  pricePerUnit: { type: Number, required: true },
  location: { type: String, required: true },
  description: { type: String },
  photoUrl: { type: String },
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);