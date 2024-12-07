import React, { useEffect, useState } from 'react';
import { orderAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getRestaurantOrders();
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
    // Set up polling to refresh orders every 2 minutes
    const interval = setInterval(fetchOrders, 120000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'ready_for_pickup': 'bg-green-100 text-green-800',
      'delivered': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log('Starting status update:', { orderId, newStatus });
      
      // Map frontend status to backend status
      const statusMapping = {
        'confirmed': 'confirmed',
        'preparing': 'preparing',
        'ready': 'ready_for_pickup',
        'delivered': 'delivered'
      };

      const backendStatus = statusMapping[newStatus] || newStatus;
      console.log('Mapped status:', { frontend: newStatus, backend: backendStatus });
      
      const response = await orderAPI.updateStatus(orderId, backendStatus);
      console.log('Status update response:', response);
      
      if (response.data?.status === 'success') {
        toast.success(`Order ${newStatus === 'confirmed' ? 'confirmed' : 
          newStatus === 'preparing' ? 'is being prepared' :
          newStatus === 'ready' ? 'is ready for pickup' :
          newStatus === 'delivered' ? 'has been delivered' : 'updated'}`);
          
        // Refresh orders list
        console.log('Refreshing orders after status update');
        await fetchOrders();
      } else {
        console.error('Status update failed:', response.data);
        toast.error(response.data?.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', {
        error,
        response: error.response,
        message: error.message,
        data: error.response?.data
      });
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading orders...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order._id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.items.map((item, index) => (
                      <div key={index}>
                        {item.quantity}x {item.menuItem?.name || 'Unknown Item'}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.items.reduce((total, item) => 
                      total + ((item.menuItem?.price || 0) * item.quantity), 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 transition-colors"
                      >
                        Confirm Order
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'preparing')}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded mr-2 transition-colors"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'ready')}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2 transition-colors"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready_for_pickup' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'delivered')}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded transition-colors"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
