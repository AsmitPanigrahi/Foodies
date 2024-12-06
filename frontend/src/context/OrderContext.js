import React, { createContext, useContext, useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (orderId) => {
    try {
      const response = await orderAPI.getById(orderId);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch order details');
      return null;
    }
  };

  const trackOrder = async (orderId) => {
    try {
      const order = await getOrderById(orderId);
      setActiveOrder(order);
      return order;
    } catch (error) {
      toast.error('Failed to track order');
      return null;
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await orderAPI.cancel(orderId);
      toast.success('Order cancelled successfully');
      fetchOrders(); // Refresh orders list
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  const getOrderStatus = (status) => {
    const statusMap = {
      'pending': { label: 'Order Placed', color: 'yellow' },
      'confirmed': { label: 'Confirmed', color: 'blue' },
      'preparing': { label: 'Preparing', color: 'indigo' },
      'ready': { label: 'Ready for Pickup', color: 'purple' },
      'out_for_delivery': { label: 'Out for Delivery', color: 'orange' },
      'delivered': { label: 'Delivered', color: 'green' },
      'cancelled': { label: 'Cancelled', color: 'red' }
    };
    return statusMap[status] || { label: status, color: 'gray' };
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const value = {
    orders,
    loading,
    activeOrder,
    fetchOrders,
    trackOrder,
    cancelOrder,
    getOrderStatus
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;
