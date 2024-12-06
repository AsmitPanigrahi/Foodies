import api from './api.config';

export const menuAPI = {
  // Get all menu items for a restaurant
  getItems: async (restaurantId) => {
    try {
      console.log('Making API request to:', `/restaurants/${restaurantId}/menu`);
      const response = await api.get(`/restaurants/${restaurantId}/menu`);
      console.log('API Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error getting menu items:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  },

  // Create a new menu item
  createItem: async (restaurantId, menuItemData) => {
    try {
      const response = await api.post(`/restaurants/${restaurantId}/menu`, menuItemData);
      return response.data;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  },

  // Update a menu item
  updateItem: async (restaurantId, itemId, menuItemData) => {
    try {
      const response = await api.put(`/restaurants/${restaurantId}/menu/${itemId}`, menuItemData);
      return response.data;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },

  // Delete a menu item
  deleteItem: async (restaurantId, itemId) => {
    try {
      const response = await api.delete(`/restaurants/${restaurantId}/menu/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }
};

export default menuAPI;
