import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getRestaurantById } from '../../api/restaurant.api';
import customerMenuAPI from '../../api/customer.menu.api';
import { useCart } from '../../context/CartContext';
import { orderAPI, paymentAPI } from '../../services/api';
import PaymentForm from '../../components/payment/PaymentForm';

const RestaurantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuLoading, setMenuLoading] = useState(true);
    const [menuError, setMenuError] = useState(null);
    const [activeTab, setActiveTab] = useState('menu');
    const [reviews, setReviews] = useState([]);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const { cart, addToCart, removeFromCart, updateQuantity, setCart } = useCart();

    useEffect(() => {
        fetchRestaurantAndMenu();
        fetchReviews();
    }, [id]);

    useEffect(() => {
        console.log('createdOrder state changed:', createdOrder);
    }, [createdOrder]);

    useEffect(() => {
        console.log('showPaymentForm state changed:', showPaymentForm);
    }, [showPaymentForm]);

    const fetchRestaurantAndMenu = async () => {
        try {
            setLoading(true);
            setMenuLoading(true);
            setMenuError(null);
            console.log('Fetching data for restaurant ID:', id);
            
            // First fetch restaurant details
            const restaurantRes = await getRestaurantById(id);
            console.log('Restaurant response:', restaurantRes);
            setRestaurant(restaurantRes.data.restaurant);
            
            // Then fetch menu items using customer API
            try {
                console.log('Fetching menu items for restaurant:', id);
                const menuRes = await customerMenuAPI.getRestaurantMenu(id);
                console.log('Menu response:', menuRes);
                
                // Check if menuRes.data is an array (backward compatibility)
                const menuItems = Array.isArray(menuRes.data) 
                    ? menuRes.data 
                    : (menuRes.data?.menuItems || []);
                
                if (menuItems.length > 0) {
                    setMenuItems(menuItems);
                } else {
                    setMenuItems([]);
                    setMenuError('No menu items available');
                }
            } catch (menuError) {
                console.error('Error fetching menu items:', menuError);
                setMenuError('Failed to load menu items. Please try again later.');
                toast.error('Failed to load menu items');
            }
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
            toast.error('Failed to load restaurant details');
        } finally {
            setLoading(false);
            setMenuLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            // TODO: Implement API call to fetch reviews
            setReviews([
                { id: 1, user: 'John D.', rating: 4, comment: 'Great food and service!' },
                { id: 2, user: 'Sarah M.', rating: 5, comment: 'Best restaurant in town!' }
            ]);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const getFormattedLocation = (restaurant) => {
        if (restaurant.address) {
            return `${restaurant.address.street}, ${restaurant.address.city}`;
        }
        if (typeof restaurant.location === 'string') {
            return restaurant.location;
        }
        if (restaurant.location && restaurant.location.coordinates) {
            return `${restaurant.location.coordinates[1]}, ${restaurant.location.coordinates[0]}`;
        }
        return 'Location not available';
    };

    const placeOrder = async () => {
        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        try {
            // Format order request data
            const orderRequestData = {
                restaurant: restaurant._id,
                items: cart.map(item => ({
                    menuItem: item._id,
                    quantity: item.quantity,
                    specialInstructions: item.specialInstructions || ''
                })),
                deliveryAddress: {
                    street: '789 Customer St',  // TODO: Get from user input
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10003',
                    country: 'USA'
                },
                paymentMethod: 'card'  // TODO: Get from user input
            };

            console.log('Creating order with data:', orderRequestData);

            // Create order first
            const orderResponse = await orderAPI.create(orderRequestData);
            console.log('Full order response:', orderResponse);

            const createdOrderData = orderResponse?.data?.data?.order;
            console.log('Extracted order data:', createdOrderData);

            if (!createdOrderData?._id) {
                console.error('Invalid order response structure:', orderResponse);
                throw new Error('Invalid order response - missing order ID');
            }

            // First set the order data
            console.log('Setting created order with:', createdOrderData);
            setCreatedOrder(createdOrderData);
            
            // Then show the payment form
            console.log('Showing payment form');
            setShowPaymentForm(true);
            
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
        }
    };

    const handlePaymentSuccess = async (paymentIntent) => {
        console.log('Payment success with intent:', paymentIntent);
        toast.success('Order placed and payment processed successfully!');
        setCart([]); // Clear cart after successful order
        setShowPaymentForm(false);
        setCreatedOrder(null);
    };

    const handlePaymentCancel = async () => {
        if (createdOrder?._id) {
            console.log('Cancelling order:', createdOrder._id);
            try {
                await orderAPI.cancel(createdOrder._id);
                toast.success('Order cancelled');
            } catch (error) {
                console.error('Error canceling order:', error);
                toast.error('Failed to cancel order');
            }
        }
        setShowPaymentForm(false);
        setCreatedOrder(null);
    };

    const renderPaymentForm = () => {
        console.log('Rendering payment form. Order:', createdOrder, 'Show:', showPaymentForm);
        
        if (!showPaymentForm || !createdOrder) {
            console.log('Conditions not met for payment form. showPaymentForm:', showPaymentForm, 'createdOrder:', createdOrder);
            return null;
        }

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Complete Payment</h2>
                        <button
                            onClick={handlePaymentCancel}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ×
                        </button>
                    </div>
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Order ID: {createdOrder._id}</p>
                        <p className="text-sm text-gray-600">Total: ${createdOrder.total?.toFixed(2)}</p>
                    </div>
                    <PaymentForm
                        orderId={createdOrder._id}
                        amount={createdOrder.total}
                        onSuccess={handlePaymentSuccess}
                    />
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!restaurant) {
        return <div className="text-center py-8">Restaurant not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Restaurant Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
                <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <span>📍 {getFormattedLocation(restaurant)}</span>
                    <span>⭐ {restaurant.rating || '4.5'} ({restaurant.reviewCount || '50'} reviews)</span>
                    <span>🕒 {restaurant.timing || '10:00 AM - 10:00 PM'}</span>
                </div>
                <p className="text-gray-600">{restaurant.description}</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-6 border-b">
                <button 
                    className={`px-4 py-2 ${activeTab === 'menu' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('menu')}
                >
                    Menu
                </button>
                <button 
                    className={`px-4 py-2 ${activeTab === 'reviews' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    Reviews
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content Section */}
                <div className="md:col-span-2">
                    {activeTab === 'menu' && (
                        <div className="space-y-6">
                            {menuLoading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                                </div>
                            ) : menuError ? (
                                <div className="text-center py-8 text-red-500">
                                    {menuError}
                                    <button 
                                        onClick={fetchRestaurantAndMenu}
                                        className="block mx-auto mt-4 text-primary hover:text-primary-dark"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : menuItems.length > 0 ? (
                                <div className="grid gap-6">
                                    {/* Group items by category if available */}
                                    {Object.entries(menuItems.reduce((categories, item) => {
                                        const category = item.category || 'Other';
                                        if (!categories[category]) {
                                            categories[category] = [];
                                        }
                                        categories[category].push(item);
                                        return categories;
                                    }, {})).map(([category, items]) => (
                                        <div key={category}>
                                            <h2 className="text-xl font-semibold mb-4">{category}</h2>
                                            <div className="grid gap-4">
                                                {items.map((item) => (
                                                    <div key={item._id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                                                        <div className="flex gap-4">
                                                            {item.image && (
                                                                <img 
                                                                    src={item.image} 
                                                                    alt={item.name}
                                                                    className="w-24 h-24 object-cover rounded-lg"
                                                                />
                                                            )}
                                                            <div>
                                                                <h3 className="font-semibold text-lg">{item.name}</h3>
                                                                <p className="text-gray-600 text-sm">{item.description}</p>
                                                                <p className="text-primary font-semibold mt-2">₹{item.price}</p>
                                                                {item.isAvailable === false && (
                                                                    <p className="text-red-500 text-sm mt-1">Currently unavailable</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => addToCart(item, restaurant._id)}
                                                            className={`p-3 rounded-full transition-all transform ${
                                                                item.isAvailable === false 
                                                                ? 'bg-gray-300 cursor-not-allowed'
                                                                : 'bg-primary text-white hover:bg-primary-dark hover:scale-110'
                                                            }`}
                                                            disabled={item.isAvailable === false}
                                                            title="Add to Cart"
                                                            aria-label="Add to Cart"
                                                        >
                                                            🛒
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-600 py-8">No menu items available</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-lg shadow p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold">{review.user}</span>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Section */}
                <div className="bg-white rounded-lg shadow-lg p-4 h-fit sticky top-4">
                    <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
                    {cart.length === 0 ? (
                        <p className="text-gray-600">Your cart is empty</p>
                    ) : (
                        <>
                            <div className="space-y-4 mb-4">
                                {cart.map((item) => (
                                    <div key={item._id} className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-semibold">{item.name}</h3>
                                            <p className="text-gray-600">₹{item.price} x {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item._id)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between mb-4">
                                    <span className="font-semibold">Total:</span>
                                    <span className="font-semibold">₹{cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Go to Cart
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Add payment form modal */}
            {renderPaymentForm()}
        </div>
    );
};

export default RestaurantDetails;
