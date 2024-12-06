const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/Menu'); // Ensure this path is correct
const mongoose = require('mongoose');

// Debug middleware for all restaurant routes
router.use((req, res, next) => {
  console.log('Restaurant Route Request:', {
    method: req.method,
    url: req.url,
    path: req.path,
    params: req.params,
    query: req.query,
    auth: !!req.user
  });
  next();
});

// Validate MongoDB ObjectId middleware
const validateObjectId = (req, res, next) => {
  const { restaurantId } = req.params;
  if (restaurantId && !mongoose.Types.ObjectId.isValid(restaurantId)) {
    console.log('Invalid restaurant ID format:', restaurantId);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid restaurant ID format'
    });
  }
  next();
};

// Validate restaurant ID middleware
const validateRestaurantId = async (req, res, next) => {
  const { restaurantId } = req.params;
  
  // Check if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid restaurant ID format'
    });
  }

  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }
    req.restaurant = restaurant; // Attach restaurant to request
    next();
  } catch (error) {
    console.error('Error validating restaurant:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all restaurants
router.get('/', authenticateToken, async (req, res) => {
  console.log('Getting all restaurants');
  try {
    const restaurants = await Restaurant.find();
    res.json({
      status: 'success',
      data: restaurants
    });
  } catch (error) {
    console.error('Error getting restaurants:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get current user's restaurant
router.get('/me', authenticateToken, async (req, res) => {
  console.log('Getting user restaurant');
  try {
    const restaurant = await Restaurant.findById(req.user.restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        status: 'fail',
        message: 'Restaurant not found'
      });
    }
    res.json({
      status: 'success',
      data: restaurant
    });
  } catch (error) {
    console.error('Error getting user restaurant:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get restaurant by ID
router.get('/:id', authenticateToken, validateObjectId, validateRestaurantId, async (req, res) => {
  console.log('Getting restaurant by ID:', req.params.id);
  try {
    res.json({
      status: 'success',
      data: req.restaurant
    });
  } catch (error) {
    console.error('Error getting restaurant:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create restaurant
router.post('/', authenticateToken, async (req, res) => {
  console.log('Creating restaurant');
  try {
    const newRestaurant = new Restaurant({
      ...req.body
    });
    await newRestaurant.save();
    res.status(201).json({
      status: 'success',
      data: newRestaurant
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get restaurant dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  console.log('Getting restaurant dashboard for user:', req.user._id);
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'No restaurant found for this user'
      });
    }

    res.json({
      status: 'success',
      data: {
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          description: restaurant.description,
          address: restaurant.address,
          phone: restaurant.phone,
          cuisine: restaurant.cuisine,
          owner: restaurant.owner
        }
      }
    });
  } catch (error) {
    console.error('Error getting restaurant dashboard:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get menu items for a restaurant
router.get('/:restaurantId/menu-items', authenticateToken, validateObjectId, validateRestaurantId, async (req, res) => {
  const { restaurantId } = req.params;
  console.log('Getting menu items for restaurant:', restaurantId);
  
  try {
    const menuItems = await MenuItem.find({ restaurant: restaurantId })
      .select('-__v')
      .lean();

    console.log(`Found ${menuItems.length} menu items`);
    
    res.json({
      status: 'success',
      data: menuItems
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching menu items'
    });
  }
});

// Create menu item for a restaurant
router.post('/:restaurantId/menu-items', authenticateToken, validateObjectId, validateRestaurantId, async (req, res) => {
  console.log('Creating menu item for restaurant:', req.params.restaurantId);
  try {
    const menuItem = new MenuItem({
      ...req.body,
      restaurant: req.params.restaurantId
    });
    await menuItem.save();
    res.status(201).json({
      status: 'success',
      data: menuItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update menu item
router.put('/:restaurantId/menu-items/:id', authenticateToken, validateObjectId, validateRestaurantId, async (req, res) => {
  console.log('Updating menu item:', req.params.id);
  try {
    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, restaurant: req.params.restaurantId },
      req.body,
      { new: true }
    );
    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found'
      });
    }
    res.json({
      status: 'success',
      data: menuItem
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete menu item
router.delete('/:restaurantId/menu-items/:id', authenticateToken, validateObjectId, validateRestaurantId, async (req, res) => {
  console.log('Deleting menu item:', req.params.id);
  try {
    const menuItem = await MenuItem.findOneAndDelete({
      _id: req.params.id,
      restaurant: req.params.restaurantId
    });
    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found'
      });
    }
    res.json({
      status: 'success',
      data: menuItem
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
