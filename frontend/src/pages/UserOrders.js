import React, { useState, useEffect } from 'react';
import { orderAPI } from '../utils/api';
import { toast } from 'react-hot-toast';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getUserOrders();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">No orders yet</h2>
          <p className="mt-2 text-gray-600">Your order history will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Order #{order._id.slice(-6)}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900">Order Items</h3>
                  <div className="mt-2 divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <div key={item._id} className="py-3 flex justify-between">
                        <div className="flex items-center">
                          <img
                            src={item.menuItem.image || 'https://via.placeholder.com/50'}
                            alt={item.menuItem.name}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              {item.menuItem.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Delivery Address</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {order.deliveryAddress.street}, {order.deliveryAddress.city},{' '}
                    {order.deliveryAddress.state} {order.deliveryAddress.zipCode},{' '}
                    {order.deliveryAddress.country}
                  </p>
                </div>

                <div className="mt-6 flex justify-between items-center pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Payment Status:{' '}
                    <span className="font-medium text-green-600">Paid</span>
                  </div>
                  <div className="text-lg font-medium text-gray-900">
                    Total: ${order.totalAmount.toFixed(2)}
                  </div>
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
