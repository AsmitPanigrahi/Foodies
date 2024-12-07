require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

async function setupTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Create test restaurant
    const restaurant = await Restaurant.create({
      name: 'Test Restaurant',
      description: 'A test restaurant for development',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'Test Country'
      },
      cuisine: 'Test Cuisine',
      rating: 4.5,
      priceRange: '$$'
    });
    console.log('Created test restaurant:', restaurant);

    // Create test restaurant owner
    const user = await User.create({
      name: 'Test Owner',
      email: 'owner@test.com',
      password: 'password123',
      role: 'owner',
      restaurantId: restaurant._id,
      phone: '123-456-7890',
      address: {
        street: '456 Owner St',
        city: 'Owner City',
        state: 'OS',
        zipCode: '67890',
        country: 'Owner Country'
      }
    });
    console.log('Created test user:', user);

    // Create test order
    const Order = require('../models/Order');
    const order = await Order.create({
      user: user._id,
      restaurant: restaurant._id,
      items: [{
        menuItem: mongoose.Types.ObjectId(), // This is just a placeholder
        quantity: 2,
        price: 10.99,
        name: 'Test Item',
        notes: 'Extra spicy'
      }],
      totalAmount: 21.98,
      status: 'pending',
      deliveryAddress: {
        street: '789 Customer St',
        city: 'Customer City',
        state: 'CS',
        zipCode: '13579',
        country: 'Customer Country'
      },
      paymentStatus: 'pending',
      paymentMethod: 'card'
    });
    console.log('Created test order:', order);

    console.log('\nTest data setup complete!');
    console.log('\nTest User Credentials:');
    console.log('Email: owner@test.com');
    console.log('Password: password123');
    console.log('\nRestaurant ID:', restaurant._id);
  } catch (error) {
    console.error('Error setting up test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setupTestData();
