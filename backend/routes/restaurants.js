const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// Debug middleware
router.use((req, res, next) => {
  console.log('Restaurant Route:', req.method, req.url);
  next();
});

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
router.get('/:id', authenticateToken, async (req, res) => {
  console.log('Getting restaurant by ID:', req.params.id);
  try {
    const restaurant = await Restaurant.findById(req.params.id);
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

// Get menu items for a restaurant
router.get('/:restaurantId/menu-items', authenticateToken, async (req, res) => {
  console.log('Getting menu items for restaurant:', req.params.restaurantId);
  try {
    const menuItems = await MenuItem.find({ restaurant: req.params.restaurantId });
    console.log('Found menu items:', menuItems);
    res.json({
      status: 'success',
      data: menuItems
    });
  } catch (error) {
    console.error('Error getting menu items:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create menu item for a restaurant
router.post('/:restaurantId/menu-items', authenticateToken, async (req, res) => {
  console.log('Creating menu item for restaurant:', req.params.restaurantId);
  try {
    const newMenuItem = new MenuItem({
      ...req.body,
      restaurant: req.params.restaurantId
    });
    await newMenuItem.save();
    console.log('Created menu item:', newMenuItem);
    res.status(201).json({
      status: 'success',
      data: newMenuItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update menu item
router.put('/:restaurantId/menu-items/:id', authenticateToken, async (req, res) => {
  console.log('Updating menu item for restaurant:', req.params.restaurantId);
  try {
    const updatedItem = await MenuItem.findOneAndUpdate(
      { 
        _id: req.params.id,
        restaurant: req.params.restaurantId
      },
      req.body,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        status: 'fail',
        message: 'Menu item not found'
      });
    }

    res.json({
      status: 'success',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete menu item
router.delete('/:restaurantId/menu-items/:id', authenticateToken, async (req, res) => {
  console.log('Deleting menu item for restaurant:', req.params.restaurantId);
  try {
    const deletedItem = await MenuItem.findOneAndDelete({
      _id: req.params.id,
      restaurant: req.params.restaurantId
    });

    if (!deletedItem) {
      return res.status(404).json({
        status: 'fail',
        message: 'Menu item not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Menu item deleted successfully'
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
