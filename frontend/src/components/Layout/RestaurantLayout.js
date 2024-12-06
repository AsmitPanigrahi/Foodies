import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RestaurantLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-indigo-700">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-indigo-800">
            <span className="text-white text-lg font-semibold">Restaurant Dashboard</span>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-2">
            <Link
              to="/restaurant/dashboard"
              className="block px-4 py-2 text-white hover:bg-indigo-600 rounded-md"
            >
              Dashboard
            </Link>
            <Link
              to="/restaurant/menu"
              className="block px-4 py-2 text-white hover:bg-indigo-600 rounded-md"
            >
              Menu Management
            </Link>
            <Link
              to="/restaurant/orders"
              className="block px-4 py-2 text-white hover:bg-indigo-600 rounded-md"
            >
              Orders
            </Link>
            <Link
              to="/restaurant/profile"
              className="block px-4 py-2 text-white hover:bg-indigo-600 rounded-md"
            >
              Restaurant Profile
            </Link>
          </nav>

          <div className="px-4 py-4">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default RestaurantLayout;
