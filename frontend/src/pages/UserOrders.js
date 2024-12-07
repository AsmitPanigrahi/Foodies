import React, { useEffect, useState } from 'react';
import { orderAPI } from '../utils/api';
import toast from 'react-hot-toast';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getUserOrders();
      if (response.data?.status === 'success') {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Set up polling to refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': {
        color: 'bg-yellow-100 text-yellow-800',
        text: 'Order Placed'
      },
      'confirmed': {
        color: 'bg-blue-100 text-blue-800',
        text: 'Order Confirmed'
      },
      'preparing': {
        color: 'bg-orange-100 text-orange-800',
        text: 'Being Prepared'
      },
      'ready': {
        color: 'bg-green-100 text-green-800',
        text: 'Ready for Pickup'
      },
      'delivered': {
        color: 'bg-gray-100 text-gray-800',
        text: 'Delivered'
      },
      'cancelled': {
        color: 'bg-red-100 text-red-800',
        text: 'Cancelled'
      }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading your orders...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order._id.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-gray-600">{item.quantity}x</span>
                        <span className="ml-2 text-gray-900">{item.menuItem?.name || 'Unknown Item'}</span>
                      </div>
                      <span className="text-gray-600">
                        ${((item.menuItem?.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Amount</span>
                    <span className="font-medium text-gray-900">
                      ${order.items.reduce((total, item) => 
                        total + ((item.menuItem?.price || 0) * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  {order.status === 'ready' && (
                    <div className="mt-4 text-sm text-green-600 font-medium">
                      Your order is ready for pickup! 🎉
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
