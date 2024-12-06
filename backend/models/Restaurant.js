const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  address: Object,
  cuisine: String,
  menu: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }]
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
