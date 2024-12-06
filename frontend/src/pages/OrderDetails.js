import React from 'react';
import { useParams } from 'react-router-dom';
import OrderTracking from '../components/order/OrderTracking';

const OrderDetails = () => {
  const { orderId } = useParams();

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <OrderTracking orderId={orderId} />
    </div>
  );
};

export default OrderDetails;
