import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../utils/api';
import { menuAPI } from '../../api/menu.api';
import { getRestaurantDashboard } from '../../api/restaurant.api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalMenuItems: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    fetchRestaurantId();
  }, []);

  useEffect(() => {
    if (restaurantId) {
      fetchDashboardStats();
    }
  }, [restaurantId]);

  const fetchRestaurantId = async () => {
    try {
      const response = await getRestaurantDashboard();
      if (response?.status === 'success') {
        setRestaurantId(response.data.restaurant._id);
      } else {
        toast.error('Failed to fetch restaurant information');
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Failed to fetch restaurant information');
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Fetch orders
      const ordersRes = await orderAPI.getRestaurantOrders();
      const orders = ordersRes.data?.data?.orders || [];
      
      // Calculate today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      }).length;

      // Calculate total revenue
      const totalRevenue = orders.reduce((total, order) => {
        return total + order.items.reduce((orderTotal, item) => {
          return orderTotal + (item.menuItem?.price || 0) * item.quantity;
        }, 0);
      }, 0);

      // Fetch menu items using restaurant ID
      const menuRes = await menuAPI.getItems(restaurantId);
      console.log('Menu response:', menuRes);
      // Use the results field for total menu items
      const totalMenuItems = menuRes?.results || 0;

      setStats({
        todayOrders,
        totalMenuItems,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user?.name}!</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Today's Orders</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.todayOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Menu Items</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.totalMenuItems}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">₹{stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
        <div className="text-gray-500 text-center py-8">
          No recent orders to display
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
