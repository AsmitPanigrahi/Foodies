import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import MainLayout from './components/Layout/MainLayout';
import RestaurantLayout from './components/Layout/RestaurantLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantList from './pages/RestaurantList';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UserOrders from './pages/UserOrders';
import RestaurantDashboard from './pages/restaurant/Dashboard';
import OrderManagement from './pages/restaurant/OrderManagement';
import RestaurantProfile from './pages/restaurant/RestaurantProfile';
import MenuManagement from './pages/restaurant/MenuManagement';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Restaurant Owner Routes */}
            <Route
              path="/restaurant"
              element={
                <ProtectedRoute allowedRoles={['restaurant-owner']}>
                  <RestaurantLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/restaurant/dashboard" replace />} />
              <Route path="dashboard" element={<RestaurantDashboard />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="profile" element={<RestaurantProfile />} />
              <Route path="menu" element={<MenuManagement />} />
            </Route>

            {/* Customer Routes */}
            <Route path="/" element={<MainLayout />}>
              {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="restaurants" element={<RestaurantList />} />
              <Route path="restaurant/:id" element={<RestaurantDetail />} />

              {/* Protected Customer Routes */}
              <Route
                path="cart"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="checkout"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <UserOrders />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
