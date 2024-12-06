import React, { useEffect, useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import Loading from '../ui/Loading';

const OrderTracking = ({ orderId }) => {
  const { trackOrder, getOrderStatus } = useOrder();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      const orderData = await trackOrder(orderId);
      setOrder(orderData);
      setLoading(false);
    };

    loadOrder();
    // Set up polling for real-time updates
    const interval = setInterval(loadOrder, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [orderId, trackOrder]);

  if (loading) return <Loading />;
  if (!order) return <div>Order not found</div>;

  const status = getOrderStatus(order.status);
  const steps = [
    { key: 'pending', title: 'Order Placed' },
    { key: 'confirmed', title: 'Confirmed' },
    { key: 'preparing', title: 'Preparing' },
    { key: 'ready', title: 'Ready' },
    { key: 'out_for_delivery', title: 'Out for Delivery' },
    { key: 'delivered', title: 'Delivered' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === order.status);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Order #{order.orderNumber}</h3>
        <p className="mt-1 text-sm text-gray-500">
          Estimated delivery: {order.estimatedDeliveryTime}
        </p>
      </div>

      {/* Status Timeline */}
      <div className="relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-200" />
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div
              key={step.key}
              className={`relative flex items-center mb-8 ${
                index === steps.length - 1 ? 'mb-0' : ''
              }`}
            >
              <div className="flex-1 text-right pr-4">
                <div
                  className={`text-sm font-medium ${
                    isCompleted ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </div>
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    isCurrent
                      ? 'border-indigo-600 bg-white'
                      : isCompleted
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-300 bg-white'
                  }`}
                />
              </div>
              <div className="flex-1 pl-4">
                {isCurrent && (
                  <div className="text-sm text-gray-500">
                    {order.statusMessage || 'In Progress'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Details */}
      <div className="mt-8 border-t pt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Order Details</h4>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-500">
                {item.quantity}x {item.name}
              </span>
              <span className="text-gray-900">${item.price.toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Details */}
      {order.delivery && (
        <div className="mt-6 border-t pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Delivery Details
          </h4>
          <div className="text-sm text-gray-500">
            <p className="mb-1">{order.delivery.address}</p>
            <p className="mb-1">Driver: {order.delivery.driverName}</p>
            {order.delivery.phone && (
              <p>Contact: {order.delivery.phone}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
