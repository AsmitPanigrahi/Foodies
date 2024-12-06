import api from './api.config';

const customerMenuAPI = {
    // Get menu items for a specific restaurant
    getRestaurantMenu: async (restaurantId) => {
        try {
            const response = await api.get(`/restaurants/${restaurantId}/menu`);
            return response.data;
        } catch (error) {
            console.error('Error fetching restaurant menu:', error);
            throw error;
        }
    }
};

export default customerMenuAPI;
