import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getRestaurantById } from '../api/restaurant.api';

const RestaurantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRestaurantDetails();
    }, [id]);

    const fetchRestaurantDetails = async () => {
        try {
            setLoading(true);
            const response = await getRestaurantById(id);
            const restaurantData = response.data?.restaurant;
            
            if (!restaurantData) {
                throw new Error('Restaurant not found');
            }
            
            setRestaurant(restaurantData);
            setError(null);
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
            setError(error.response?.data?.message || 'Failed to fetch restaurant details');
            toast.error('Failed to fetch restaurant details');
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
                <div className="text-red-500 text-xl mb-4">{error}</div>
                <button 
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-gray-500 text-xl mb-4">Restaurant not found</div>
                <button 
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="text-blue-500 hover:text-blue-600 flex items-center"
                    >
                        ← Back to Restaurants
                    </button>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="relative h-64 md:h-96">
                        <img
                            src={restaurant.image || 'https://via.placeholder.com/800x400'}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                            <div className="flex items-center bg-yellow-100 px-3 py-1 rounded">
                                <span className="text-yellow-500 mr-1">★</span>
                                <span className="font-semibold">{restaurant.rating || 'N/A'}</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Cuisine</h2>
                                <p className="text-gray-600">{Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}</p>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Location</h2>
                                <p className="text-gray-600">
                                    {restaurant.address?.street && `${restaurant.address.street}, `}
                                    {restaurant.address?.city || 'Location not available'}
                                </p>
                            </div>
                        </div>
                        
                        {restaurant.description && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">About</h2>
                                <p className="text-gray-600">{restaurant.description}</p>
                            </div>
                        )}
                        
                        {restaurant.openingHours && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">Opening Hours</h2>
                                <p className="text-gray-600">{restaurant.openingHours}</p>
                            </div>
                        )}
                        
                        {restaurant.contactNumber && (
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Contact</h2>
                                <p className="text-gray-600">{restaurant.contactNumber}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetail;
