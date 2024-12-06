const MenuItem = require('../models/Menu');
const Restaurant = require('../models/Restaurant');

// Get all menu items for a restaurant
exports.getMenuItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    const menuItems = await MenuItem.find({ restaurantId });
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
};

// Create a new menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    // Create menu item
    const menuItem = new MenuItem({
      ...req.body,
      restaurantId
    });
    
    await menuItem.save();
    
    res.status(201).json({
      status: 'success',
      data: menuItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { restaurantId, id } = req.params;
    
    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: id, restaurantId },
      req.body,
      { new: true, runValidators: true }
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
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { restaurantId, id } = req.params;
    
    const menuItem = await MenuItem.findOneAndDelete({ _id: id, restaurantId });
    
    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found'
      });
    }
    
    res.json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
