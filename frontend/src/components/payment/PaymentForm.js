import React, { useState, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const PaymentForm = ({ orderId, amount, onSuccess }) => {
  const navigate = useNavigate();
  const { createPaymentIntent, loading: contextLoading } = usePayment();
  const { clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    console.log('PaymentForm mounted with orderId:', orderId, 'amount:', amount);
  }, [orderId, amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Payment form submitted with orderId:', orderId, 'amount:', amount);

    if (!stripe || !elements) {
      console.error('Stripe.js has not loaded');
      return;
    }

    if (!orderId) {
      console.error('Order ID is missing');
      toast.error('Order ID is required for payment');
      return;
    }

    if (!amount) {
      console.error('Amount is missing');
      toast.error('Payment amount is required');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      console.log('Creating payment intent with:', { amount: Math.round(amount * 100), orderId });

      // Create payment intent
      const response = await createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents and ensure it's an integer
        orderId
      });

      console.log('Payment intent response:', response);

      if (!response?.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        response.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              // You can add billing details here if needed
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      console.log('Payment confirmed:', paymentIntent);

      if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        clearCart();
        if (onSuccess) {
          onSuccess(paymentIntent);
        }
        // Redirect to orders page after successful payment
        navigate('/orders');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment');
      toast.error(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true, // Since we're not collecting postal code
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="text-sm text-gray-600 mb-2">Order Total</div>
        <div className="text-2xl font-bold text-gray-900">${amount?.toFixed(2)}</div>
      </div>

      <div className="bg-white p-4 rounded border">
        <CardElement options={cardElementOptions} />
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        loading={processing || contextLoading}
        disabled={!stripe || processing || contextLoading}
      >
        {processing ? 'Processing...' : `Pay $${amount?.toFixed(2)}`}
      </Button>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Your payment information is secure and encrypted</p>
      </div>
    </form>
  );
};

export default PaymentForm;
