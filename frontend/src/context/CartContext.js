import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [restaurantId, setRestaurantId] = useState(() => {
    return localStorage.getItem('cartRestaurantId') || null;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (restaurantId) {
      localStorage.setItem('cartRestaurantId', restaurantId);
    } else {
      localStorage.removeItem('cartRestaurantId');
    }
  }, [restaurantId]);

  const addToCart = (item, currentRestaurantId) => {
    if (cart.length > 0 && restaurantId !== currentRestaurantId) {
      if (window.confirm('Adding items from a different restaurant will clear your current cart. Do you want to proceed?')) {
        setCart([{ ...item, quantity: 1, restaurantId: currentRestaurantId }]);
        setRestaurantId(currentRestaurantId);
      }
    } else {
      setCart(prevCart => {
        const existingItem = prevCart.find(i => i._id === item._id);
        if (existingItem) {
          return prevCart.map(i =>
            i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        setRestaurantId(currentRestaurantId);
        return [...prevCart, { ...item, quantity: 1, restaurantId: currentRestaurantId }];
      });
    }
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item._id !== itemId);
      if (newCart.length === 0) {
        setRestaurantId(null);
      }
      return newCart;
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setRestaurantId(null);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      restaurantId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
