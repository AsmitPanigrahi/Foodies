import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getAllRestaurants } from '../api/restaurant.api';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const response = await getAllRestaurants();
            
            // Extract restaurants from the correct response structure
            const restaurantData = response.data?.restaurants || [];
            
            if (!Array.isArray(restaurantData)) {
                console.error('Restaurant data is not an array:', restaurantData);
                setError('Invalid restaurant data format');
                setRestaurants([]);
                return;
            }
            
            setRestaurants(restaurantData);
            setError(null);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            setError(error.response?.data?.message || 'Failed to fetch restaurants');
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    if (!restaurants.length) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-gray-500 text-xl mb-4">No restaurants found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Restaurants</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                    <Link 
                        key={restaurant._id} 
                        to={`/restaurant/${restaurant._id}`}
                        className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                        <div className="relative h-48">
                            <img
                                src={restaurant.image || 'https://via.placeholder.com/400x300'}
                                alt={restaurant.name}
                                className="w-full h-full object-cover rounded-t-lg"
                            />
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xl font-semibold">{restaurant.name}</h2>
                                <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
                                    <span className="text-yellow-500 mr-1">★</span>
                                    <span>{restaurant.rating || 'N/A'}</span>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-2">{restaurant.cuisine.join(', ')}</p>
                            <p className="text-gray-500 text-sm">
                                {restaurant.address?.city || 'Location not available'}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RestaurantList;
