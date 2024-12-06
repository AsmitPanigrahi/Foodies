const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');

// Debug middleware
router.use((req, res, next) => {
  console.log('Menu Route:', req.method, req.url);
  next();
});

// Get all menu items for a restaurant
router.get('/:restaurantId/menu-items', authenticateToken, getMenuItems);

// Create a new menu item
router.post('/:restaurantId/menu-items', authenticateToken, createMenuItem);

// Update a menu item
router.put('/:restaurantId/menu-items/:id', authenticateToken, updateMenuItem);

// Delete a menu item
router.delete('/:restaurantId/menu-items/:id', authenticateToken, deleteMenuItem);

module.exports = router;
