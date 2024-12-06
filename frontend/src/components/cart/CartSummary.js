import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';

const CartSummary = () => {
  const navigate = useNavigate();
  const { items, getCartTotal } = useCart();
  
  const subtotal = getCartTotal();
  const deliveryFee = 5.00;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal ({items.length} items)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>Delivery Fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between font-medium text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <Button
        className="w-full mt-6"
        onClick={handleCheckout}
        disabled={items.length === 0}
      >
        Proceed to Checkout
      </Button>
      
      <p className="mt-4 text-xs text-gray-500 text-center">
        By proceeding to checkout, you agree to our terms and conditions.
      </p>
    </div>
  );
};

export default CartSummary;
