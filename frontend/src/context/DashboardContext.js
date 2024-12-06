import React, { createContext, useContext, useState, useEffect } from 'react';
import { restaurantAPI } from '../services/api';
import toast from 'react-hot-toast';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [stats, setStats] = useState({
    revenue: { daily: 0, weekly: 0, monthly: 0 },
    orders: { pending: 0, preparing: 0, delivered: 0, total: 0 },
    topItems: [],
    recentOrders: [],
    ratings: { average: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const fetchDashboardData = async (restaurantId) => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getDashboardStats(restaurantId, dateRange);
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async (restaurantId) => {
    try {
      const response = await restaurantAPI.getRecentOrders(restaurantId);
      setStats(prev => ({
        ...prev,
        recentOrders: response.data
      }));
    } catch (error) {
      toast.error('Failed to fetch recent orders');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await restaurantAPI.updateOrderStatus(orderId, status);
      toast.success('Order status updated');
      // Update local state
      setStats(prev => ({
        ...prev,
        recentOrders: prev.recentOrders.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      }));
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getAnalytics = async (restaurantId, type, startDate, endDate) => {
    try {
      const response = await restaurantAPI.getAnalytics(restaurantId, type, startDate, endDate);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch analytics');
      return null;
    }
  };

  const getRatingsAndReviews = async (restaurantId) => {
    try {
      const response = await restaurantAPI.getRatingsAndReviews(restaurantId);
      setStats(prev => ({
        ...prev,
        ratings: response.data
      }));
    } catch (error) {
      toast.error('Failed to fetch ratings and reviews');
    }
  };

  const respondToReview = async (reviewId, response) => {
    try {
      await restaurantAPI.respondToReview(reviewId, response);
      toast.success('Response posted successfully');
      // Refresh ratings and reviews
      getRatingsAndReviews();
    } catch (error) {
      toast.error('Failed to post response');
    }
  };

  const value = {
    stats,
    loading,
    dateRange,
    setDateRange,
    refreshInterval,
    setRefreshInterval,
    fetchDashboardData,
    fetchRecentOrders,
    updateOrderStatus,
    getAnalytics,
    getRatingsAndReviews,
    respondToReview
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardContext;
