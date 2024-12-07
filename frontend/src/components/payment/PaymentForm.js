import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentForm = ({ onSuccess }) => {
  const { createPaymentIntent, loading: contextLoading } = usePayment();
  const { getTotal, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    try {
      setProcessing(true);
      setError(null);

      // Create payment intent
      const { clientSecret } = await createPaymentIntent(getTotal() * 100); // Convert to cents
      if (!clientSecret) return;

      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        clearCart();
        onSuccess(paymentIntent);
      }
    } catch (error) {
      setError('An error occurred while processing your payment. Please try again.');
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
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="text-sm text-gray-600 mb-2">Order Total</div>
        <div className="text-2xl font-bold text-gray-900">${getTotal().toFixed(2)}</div>
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
        {processing ? 'Processing...' : `Pay $${getTotal().toFixed(2)}`}
      </Button>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Your payment information is secure and encrypted</p>
      </div>
    </form>
  );
};

export default PaymentForm;
