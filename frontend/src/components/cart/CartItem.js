import React from 'react';
import { useCart } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { id, name, price, quantity, image } = item;

  return (
    <div className="flex items-center py-4 border-b">
      <div className="h-16 w-16 flex-shrink-0">
        <img
          src={image || 'https://via.placeholder.com/64?text=Food'}
          alt={name}
          className="h-full w-full object-cover rounded"
        />
      </div>
      
      <div className="ml-4 flex-1">
        <div className="flex justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-900">{name}</h3>
            <p className="mt-1 text-sm text-gray-500">${price.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-base font-medium text-gray-900">
              ${(price * quantity).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center border rounded">
            <button
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
              onClick={() => updateQuantity(id, Math.max(0, quantity - 1))}
            >
              -
            </button>
            <span className="px-3 py-1 text-gray-800 border-x">{quantity}</span>
            <button
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
              onClick={() => updateQuantity(id, quantity + 1)}
            >
              +
            </button>
          </div>
          
          <button
            onClick={() => removeFromCart(id)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
