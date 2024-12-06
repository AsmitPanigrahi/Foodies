import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import useForm from '../../hooks/useForm';

const PaymentForm = ({ onSuccess }) => {
  const { createPaymentIntent, confirmPayment, loading } = usePayment();
  const { total, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);

  const { values, errors, handleChange, handleBlur, validateForm } = useForm(
    {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      name: '',
    },
    {
      cardNumber: [
        { type: 'required' },
        { type: 'length', min: 16, max: 16 },
        { type: 'pattern', pattern: /^\d+$/, message: 'Must contain only numbers' }
      ],
      expiryDate: [
        { type: 'required' },
        { type: 'pattern', pattern: /^\d{2}\/\d{2}$/, message: 'Format: MM/YY' }
      ],
      cvv: [
        { type: 'required' },
        { type: 'length', min: 3, max: 4 },
        { type: 'pattern', pattern: /^\d+$/, message: 'Must contain only numbers' }
      ],
      name: [
        { type: 'required' },
        { type: 'length', min: 2, max: 50 }
      ]
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setProcessing(true);

      // Create payment intent
      const paymentIntent = await createPaymentIntent(total * 100); // Convert to cents
      if (!paymentIntent) return;

      // Simulate card processing
      const paymentResult = await confirmPayment(paymentIntent.id);
      
      if (paymentResult) {
        clearCart();
        onSuccess(paymentResult);
      }
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="text-sm text-gray-600 mb-2">Order Total</div>
        <div className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</div>
      </div>

      <Input
        label="Card Number"
        name="cardNumber"
        value={formatCardNumber(values.cardNumber)}
        onChange={(e) => {
          const value = e.target.value.replace(/\s/g, '');
          if (value.length <= 16) {
            handleChange({ target: { name: 'cardNumber', value } });
          }
        }}
        onBlur={handleBlur}
        error={errors.cardNumber}
        placeholder="1234 5678 9012 3456"
        maxLength={19}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Expiry Date"
          name="expiryDate"
          value={values.expiryDate}
          onChange={(e) => {
            const formatted = formatExpiryDate(e.target.value);
            if (formatted.length <= 5) {
              handleChange({ target: { name: 'expiryDate', value: formatted } });
            }
          }}
          onBlur={handleBlur}
          error={errors.expiryDate}
          placeholder="MM/YY"
          maxLength={5}
          required
        />

        <Input
          label="CVV"
          name="cvv"
          value={values.cvv}
          onChange={(e) => {
            if (e.target.value.length <= 4) {
              handleChange(e);
            }
          }}
          onBlur={handleBlur}
          error={errors.cvv}
          placeholder="123"
          maxLength={4}
          type="password"
          required
        />
      </div>

      <Input
        label="Cardholder Name"
        name="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.name}
        placeholder="John Doe"
        required
      />

      <Button
        type="submit"
        className="w-full"
        loading={loading || processing}
        disabled={loading || processing}
      >
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </Button>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Your payment information is secure and encrypted</p>
      </div>
    </form>
  );
};

export default PaymentForm;
