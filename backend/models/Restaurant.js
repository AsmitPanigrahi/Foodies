const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    default: ''
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  cuisine: { 
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phone: {
    type: String
  },
  menu: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MenuItem' 
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
