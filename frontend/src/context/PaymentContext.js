import React, { createContext, useContext, useState } from 'react';
import { paymentAPI } from '../services/api';
import toast from 'react-hot-toast';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);

  const createPaymentIntent = async (amount) => {
    try {
      setLoading(true);
      const response = await paymentAPI.createPaymentIntent(amount);
      setPaymentIntent(response.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to initialize payment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (paymentIntentId) => {
    try {
      setLoading(true);
      const response = await paymentAPI.confirmPayment(paymentIntentId);
      toast.success('Payment successful!');
      return response.data;
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    paymentIntent,
    createPaymentIntent,
    confirmPayment
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export default PaymentContext;
