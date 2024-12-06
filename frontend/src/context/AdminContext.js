import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  // Restaurant Management
  const getRestaurants = async (params) => {
    try {
      setLoading(true);
      const response = await api.get('/admin/restaurants', { params });
      setRestaurants(response.data);
    } catch (error) {
      toast.error('Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  const approveRestaurant = async (restaurantId) => {
    try {
      await api.post(`/admin/restaurants/${restaurantId}/approve`);
      toast.success('Restaurant approved successfully');
      getRestaurants();
    } catch (error) {
      toast.error('Failed to approve restaurant');
    }
  };

  const suspendRestaurant = async (restaurantId) => {
    try {
      await api.post(`/admin/restaurants/${restaurantId}/suspend`);
      toast.success('Restaurant suspended successfully');
      getRestaurants();
    } catch (error) {
      toast.error('Failed to suspend restaurant');
    }
  };

  // User Management
  const getUsers = async (params) => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users', { params });
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success('User role updated successfully');
      getUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const suspendUser = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/suspend`);
      toast.success('User suspended successfully');
      getUsers();
    } catch (error) {
      toast.error('Failed to suspend user');
    }
  };

  // Platform Settings
  const updatePlatformSettings = async (settings) => {
    try {
      await api.put('/admin/settings', settings);
      toast.success('Platform settings updated successfully');
    } catch (error) {
      toast.error('Failed to update platform settings');
    }
  };

  // Platform Statistics
  const getPlatformStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch platform statistics');
    }
  };

  const value = {
    restaurants,
    users,
    loading,
    stats,
    getRestaurants,
    approveRestaurant,
    suspendRestaurant,
    getUsers,
    updateUserRole,
    suspendUser,
    updatePlatformSettings,
    getPlatformStats
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminContext;
