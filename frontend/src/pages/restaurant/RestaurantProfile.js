import React, { useState, useEffect } from 'react';
import { restaurantAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';

const RestaurantProfile = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: [],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    location: {
      type: 'Point',
      coordinates: [0, 0]
    },
    images: [],
    priceRange: '$',
    openingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '09:00', close: '22:00', closed: false }
    },
    contactNumber: '',
    email: '',
    preparationTime: 30,
    deliveryRadius: 5,
    minimumOrder: 0,
    features: {
      hasDelivery: true,
      hasTableBooking: false,
      hasTakeaway: true
    }
  });

  useEffect(() => {
    fetchRestaurantProfile();
  }, []);

  const fetchRestaurantProfile = async () => {
    try {
      const response = await restaurantAPI.getMyRestaurant();
      if (response.data && response.data.data && response.data.data.restaurant) {
        const restaurantData = response.data.data.restaurant;
        setRestaurant(restaurantData);
        setFormData({
          name: restaurantData.name || '',
          description: restaurantData.description || '',
          cuisine: restaurantData.cuisine || [],
          address: {
            street: restaurantData.address?.street || '',
            city: restaurantData.address?.city || '',
            state: restaurantData.address?.state || '',
            zipCode: restaurantData.address?.zipCode || '',
            country: restaurantData.address?.country || ''
          },
          location: restaurantData.location || {
            type: 'Point',
            coordinates: [0, 0]
          },
          images: restaurantData.images || [],
          priceRange: restaurantData.priceRange || '$',
          openingHours: restaurantData.openingHours || {
            monday: { open: '09:00', close: '22:00', closed: false },
            tuesday: { open: '09:00', close: '22:00', closed: false },
            wednesday: { open: '09:00', close: '22:00', closed: false },
            thursday: { open: '09:00', close: '22:00', closed: false },
            friday: { open: '09:00', close: '22:00', closed: false },
            saturday: { open: '09:00', close: '22:00', closed: false },
            sunday: { open: '09:00', close: '22:00', closed: false }
          },
          contactNumber: restaurantData.contactNumber || '',
          email: restaurantData.email || '',
          preparationTime: restaurantData.preparationTime || 30,
          deliveryRadius: restaurantData.deliveryRadius || 5,
          minimumOrder: restaurantData.minimumOrder || 0,
          features: restaurantData.features || {
            hasDelivery: true,
            hasTableBooking: false,
            hasTakeaway: true
          }
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('You haven\'t created a restaurant profile yet. Please create one.');
      } else if (error.response?.status === 401) {
        toast.error('Please log in to view your restaurant profile');
      } else {
        toast.error('Error fetching restaurant profile. Please try again later.');
      }
      console.error('Error fetching restaurant profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      // Handle nested objects (address fields)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name === 'cuisine') {
      // Handle cuisine array
      const cuisineArray = value.split(',').map(item => item.trim());
      setFormData(prev => ({
        ...prev,
        cuisine: cuisineArray
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare the data for submission
      const submitData = {
        ...formData,
        cuisine: formData.cuisine.filter(c => c), // Remove empty values
      };

      if (restaurant) {
        // Update existing restaurant
        await restaurantAPI.update(restaurant._id, submitData);
        toast.success('Profile updated successfully');
      } else {
        // Create new restaurant
        const response = await restaurantAPI.create(submitData);
        setRestaurant(response.data.data);
        toast.success('Restaurant created successfully');
      }
      setIsEditing(false);
      fetchRestaurantProfile();
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error(restaurant ? 'Failed to update profile' : 'Failed to create restaurant');
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Restaurant Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cuisine Types</label>
        <input
          type="text"
          name="cuisine"
          value={formData.cuisine.join(', ')}
          onChange={handleInputChange}
          placeholder="Enter cuisines separated by commas"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Price Range</label>
        <select
          name="priceRange"
          value={formData.priceRange}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="$">$ (Budget)</option>
          <option value="$$">$$ (Moderate)</option>
          <option value="$$$">$$$ (Expensive)</option>
          <option value="$$$$">$$$$ (Very Expensive)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Number</label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Preparation Time (mins)</label>
          <input
            type="number"
            name="preparationTime"
            value={formData.preparationTime}
            onChange={handleInputChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery Radius (km)</label>
          <input
            type="number"
            name="deliveryRadius"
            value={formData.deliveryRadius}
            onChange={handleInputChange}
            min="0"
            step="0.1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Minimum Order ($)</label>
          <input
            type="number"
            name="minimumOrder"
            value={formData.minimumOrder}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Street Address</label>
          <input
            type="text"
            name="address.street"
            value={formData.address.street}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            name="address.city"
            value={formData.address.city}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            type="text"
            name="address.state"
            value={formData.address.state}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
          <input
            type="text"
            name="address.zipCode"
            value={formData.address.zipCode}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Country</label>
          <input
            type="text"
            name="address.country"
            value={formData.address.country}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Features</label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="features.hasDelivery"
              checked={formData.features.hasDelivery}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                features: {
                  ...prev.features,
                  hasDelivery: e.target.checked
                }
              }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Delivery Available</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="features.hasTableBooking"
              checked={formData.features.hasTableBooking}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                features: {
                  ...prev.features,
                  hasTableBooking: e.target.checked
                }
              }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Table Booking</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="features.hasTakeaway"
              checked={formData.features.hasTakeaway}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                features: {
                  ...prev.features,
                  hasTakeaway: e.target.checked
                }
              }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Takeaway Available</label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Restaurant Images</label>
        <input
          type="text"
          name="images"
          value={formData.images.join(', ')}
          onChange={(e) => {
            const imagesArray = e.target.value.split(',').map(url => url.trim());
            setFormData(prev => ({
              ...prev,
              images: imagesArray
            }));
          }}
          placeholder="Enter image URLs separated by commas"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-end space-x-3">
        {isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              fetchRestaurantProfile();
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {restaurant ? 'Update Profile' : 'Create Restaurant'}
        </button>
      </div>
    </form>
  );

  const renderProfile = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!restaurant && !isEditing) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">You haven't created a restaurant profile yet.</p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Restaurant Profile
          </button>
        </div>
      );
    }

    if (isEditing) {
      return renderForm();
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{restaurant?.name}</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
            <p><strong>Description:</strong> {restaurant?.description}</p>
            <p><strong>Cuisine:</strong> {restaurant?.cuisine?.join(', ') || 'Not specified'}</p>
            <p><strong>Price Range:</strong> {restaurant?.priceRange}</p>
            <p><strong>Contact:</strong> {restaurant?.contactNumber}</p>
            <p><strong>Email:</strong> {restaurant?.email}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Location</h3>
            <p><strong>Address:</strong></p>
            <p>{restaurant?.address?.street}</p>
            <p>{restaurant?.address?.city}, {restaurant?.address?.state} {restaurant?.address?.zipCode}</p>
            <p>{restaurant?.address?.country}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Business Details</h3>
            <p><strong>Preparation Time:</strong> {restaurant?.preparationTime} minutes</p>
            <p><strong>Delivery Radius:</strong> {restaurant?.deliveryRadius} km</p>
            <p><strong>Minimum Order:</strong> ${restaurant?.minimumOrder}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Features</h3>
            <ul>
              {restaurant?.features?.hasDelivery && <li>✓ Delivery Available</li>}
              {restaurant?.features?.hasTableBooking && <li>✓ Table Booking</li>}
              {restaurant?.features?.hasTakeaway && <li>✓ Takeaway Available</li>}
            </ul>
          </div>
        </div>

        {restaurant?.images?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {restaurant.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Restaurant ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              {restaurant ? 'Restaurant Profile' : 'Create Restaurant'}
            </h2>
            {restaurant && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-4">
          {renderProfile()}
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;
