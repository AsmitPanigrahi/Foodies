import React, { useState, useEffect, useRef } from 'react';
import { getRestaurantDashboard } from '../../api/restaurant.api';
import { toast } from 'react-hot-toast';

const RestaurantSelector = ({ onRestaurantSelect }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await getRestaurantDashboard();
      console.log('Restaurant dashboard response:', response); // Debug log
      
      // Check if response has the restaurant data
      const restaurantData = response?.data?.restaurant ? [response.data.restaurant] : [];
      console.log('Restaurant data:', restaurantData); // Debug log
      
      setRestaurants(restaurantData);

      // Only auto-select if we haven't done it before and there's exactly one restaurant
      if (restaurantData.length === 1 && !hasAutoSelected.current) {
        const restaurant = restaurantData[0];
        const restaurantId = restaurant._id;
        console.log('Auto-selecting restaurant:', { id: restaurantId, restaurant }); // Debug log
        setSelectedRestaurant(restaurantId);
        onRestaurantSelect(restaurantId);
        hasAutoSelected.current = true;
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to fetch restaurants');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantChange = (e) => {
    const restaurantId = e.target.value;
    console.log('Restaurant selected:', restaurantId); // Debug log
    setSelectedRestaurant(restaurantId);
    onRestaurantSelect(restaurantId);
  };

  if (loading) {
    return <div className="text-gray-600">Loading restaurants...</div>;
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">No restaurants found. Please create a restaurant first.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 mb-2">
        Select Restaurant
      </label>
      <select
        id="restaurant"
        value={selectedRestaurant}
        onChange={handleRestaurantChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="">Select a restaurant</option>
        {restaurants.map((restaurant) => (
          <option key={restaurant._id} value={restaurant._id}>
            {restaurant.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RestaurantSelector;
