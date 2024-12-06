import React from 'react';
import Navbar from '../Navbar';
import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-800 text-white">
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Foodies</h3>
          <p className="text-gray-400">
            Your favorite food, delivered hot and fresh to your doorstep.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="/restaurants" className="text-gray-400 hover:text-white">Restaurants</a></li>
            <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
            <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-2 text-gray-400">
            <li>Email: support@foodies.com</li>
            <li>Phone: (555) 123-4567</li>
            <li>Address: 123 Food Street, Cuisine City</li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} Foodies. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
};

export default MainLayout;
