import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';
import PaymentForm from '../components/payment/PaymentForm';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toast } from 'react-hot-toast';
import { PaymentProvider } from '../context/PaymentContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51QSD8jRp5AnEBBv1N7jgC1AjA5CT48u4aAFw8Dtb1QA2cD2xciyOTgxXUFQg8ntIHlWxn6IQeBpSUGZmP87GOOYC00a3SciAc6';
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// For debugging
console.log('Stripe Key:', STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('address'); // 'address' or 'payment'
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    // Validate address
    if (!deliveryAddress.street || !deliveryAddress.city || 
        !deliveryAddress.state || !deliveryAddress.zipCode) {
      toast.error('Please fill in all address fields');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      setLoading(true);
      
      // Create order
      const orderData = {
        items: cart.map(item => ({
          menuItem: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddress,
        totalAmount: getTotal(),
        paymentId: paymentResult.id
      };

      await orderAPI.create(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some items to your cart to checkout</p>
        <Button onClick={() => navigate('/restaurants')}>
          Browse Restaurants
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className={`flex items-center ${step === 'address' ? 'text-indigo-600' : 'text-gray-500'}`}>
            <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2">
              1
            </span>
            <span>Address</span>
          </div>
          <div className="w-16 h-1 mx-4 bg-gray-200"></div>
          <div className={`flex items-center ${step === 'payment' ? 'text-indigo-600' : 'text-gray-500'}`}>
            <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2">
              2
            </span>
            <span>Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {step === 'address' ? (
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <Input
                label="Street"
                name="street"
                value={deliveryAddress.street}
                onChange={handleAddressChange}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  name="city"
                  value={deliveryAddress.city}
                  onChange={handleAddressChange}
                  required
                />
                <Input
                  label="State"
                  name="state"
                  value={deliveryAddress.state}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ZIP Code"
                  name="zipCode"
                  value={deliveryAddress.zipCode}
                  onChange={handleAddressChange}
                  required
                />
                <Input
                  label="Country"
                  name="country"
                  value={deliveryAddress.country}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="flex justify-end mt-6">
                <Button type="submit" loading={loading}>
                  Continue to Payment
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <Elements stripe={stripePromise}>
            <PaymentProvider>
              <PaymentForm onSuccess={handlePaymentSuccess} />
            </PaymentProvider>
          </Elements>
        )}
      </div>
    </div>
  );
};

export default Checkout;
