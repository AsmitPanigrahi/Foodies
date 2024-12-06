import api from './api.config';

export const menuAPI = {
  // Get all menu items for a restaurant
  getItems: async (restaurantId) => {
    try {
      const endpoint = `/restaurants/${restaurantId}/menu`;
      console.log('Making API request to:', endpoint);
      const response = await api.get(endpoint);
      console.log('Menu API Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error getting menu items:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        endpoint: `/restaurants/${restaurantId}/menu`,
        config: error.config
      });
      throw error;
    }
  },

  // Create a new menu item
  createItem: async (restaurantId, menuItemData) => {
    try {
      const endpoint = `/restaurants/${restaurantId}/menu`;
      console.log('Making API request to:', endpoint);
      const response = await api.post(endpoint, menuItemData);
      console.log('Menu API Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating menu item:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        endpoint: `/restaurants/${restaurantId}/menu`,
        config: error.config
      });
      throw error;
    }
  },

  // Update a menu item
  updateItem: async (restaurantId, itemId, menuItemData) => {
    try {
      const endpoint = `/restaurants/${restaurantId}/menu/${itemId}`;
      console.log('Making API request to:', endpoint);
      const response = await api.put(endpoint, menuItemData);
      console.log('Menu API Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error updating menu item:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        endpoint: `/restaurants/${restaurantId}/menu/${itemId}`,
        config: error.config
      });
      throw error;
    }
  },

  // Delete a menu item
  deleteItem: async (restaurantId, itemId) => {
    try {
      const endpoint = `/restaurants/${restaurantId}/menu/${itemId}`;
      console.log('Making API request to:', endpoint);
      const response = await api.delete(endpoint);
      console.log('Menu API Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error deleting menu item:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        endpoint: `/restaurants/${restaurantId}/menu/${itemId}`,
        config: error.config
      });
      throw error;
    }
  }
};

export default menuAPI;
