import api from './api.config';

export const getAllRestaurants = async () => {
    try {
        const response = await api.get('/restaurants');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const searchRestaurants = async (params) => {
    try {
        const response = await api.get('/restaurants/search', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRestaurantById = async (id) => {
    try {
        const response = await api.get(`/restaurants/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRestaurantDashboard = async () => {
    try {
        const response = await api.get('/restaurants/dashboard');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateRestaurant = async (id, data) => {
    try {
        const response = await api.patch(`/restaurants/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteRestaurant = async (id) => {
    try {
        const response = await api.delete(`/restaurants/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
