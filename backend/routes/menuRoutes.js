const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// In-memory storage for menu items (replace with database in production)
let menuItems = [];

// Get all menu items for a restaurant
router.get('/restaurants/:restaurantId/menu-items', authenticateToken, (req, res) => {
  try {
    const restaurantItems = menuItems.filter(item => item.restaurantId === req.params.restaurantId);
    res.json({
      status: 'success',
      data: restaurantItems
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

// Create a new menu item for a restaurant
router.post('/restaurants/:restaurantId/menu-items', authenticateToken, (req, res) => {
  try {
    const newItem = {
      id: Date.now().toString(), // Simple ID generation
      ...req.body,
      restaurantId: req.params.restaurantId,
    };
    menuItems.push(newItem);
    res.status(201).json({
      status: 'success',
      data: newItem
    });
  } catch (error) {
    res.status(400).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

// Update a menu item
router.put('/restaurants/:restaurantId/menu-items/:id', authenticateToken, (req, res) => {
  try {
    const itemIndex = menuItems.findIndex(item => 
      item.id === req.params.id && 
      item.restaurantId === req.params.restaurantId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        status: 'fail',
        message: 'Menu item not found' 
      });
    }

    menuItems[itemIndex] = {
      ...menuItems[itemIndex],
      ...req.body,
      id: req.params.id,
      restaurantId: req.params.restaurantId,
    };

    res.json({
      status: 'success',
      data: menuItems[itemIndex]
    });
  } catch (error) {
    res.status(400).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

// Delete a menu item
router.delete('/restaurants/:restaurantId/menu-items/:id', authenticateToken, (req, res) => {
  try {
    const itemIndex = menuItems.findIndex(item => 
      item.id === req.params.id && 
      item.restaurantId === req.params.restaurantId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        status: 'fail',
        message: 'Menu item not found' 
      });
    }

    menuItems = menuItems.filter(item => item.id !== req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

module.exports = router;
