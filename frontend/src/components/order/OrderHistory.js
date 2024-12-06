import React from 'react';
import { Link } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';
import Button from '../ui/Button';
import Loading from '../ui/Loading';

const OrderHistory = () => {
  const { orders, loading, cancelOrder, getOrderStatus } = useOrder();

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500 mb-6">
            When you place orders, they will appear here
          </p>
          <Link to="/restaurants">
            <Button>Browse Restaurants</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = getOrderStatus(order.status);
            
            return (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Order Summary
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-500">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-gray-900">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Total</span>
                      <span className="font-medium text-gray-900">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <Link to={`/orders/${order.id}`}>
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                  </Link>
                  {order.status === 'pending' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => cancelOrder(order.id)}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
