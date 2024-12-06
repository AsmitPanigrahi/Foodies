const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  category: String,
  image: String,
  isVegetarian: Boolean,
  isVegan: Boolean,
  isGlutenFree: Boolean,
  spicyLevel: Number,
  ingredients: [String],
  allergens: [String],
  nutritionalInfo: Object,
  isAvailable: { type: Boolean, default: true },
  preparationTime: Number,
  ratings: Object,
  isPopular: Boolean,
  isSpecial: Boolean,
  discount: Number,
  customization: Array,
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
