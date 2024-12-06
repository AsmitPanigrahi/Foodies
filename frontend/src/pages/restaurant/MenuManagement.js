import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { menuAPI, restaurantAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';
import MenuForm from '../../components/restaurant/MenuForm';

const MenuManagement = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  useEffect(() => {
    console.log('Current restaurantId:', restaurantId);
    if (restaurantId) {
      console.log('Fetching menu items for restaurant ID:', restaurantId);
      fetchMenuItems();
    }
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    try {
      const response = await restaurantAPI.getMyRestaurant();
      console.log('Full Restaurant Response:', response);
      console.log('Restaurant Data Response:', response.data);
      
      // Check if we have the restaurant data
      if (response.data?.status === 'success' && response.data?.data?.restaurant) {
        const restaurant = response.data.data.restaurant;
        console.log('Extracted Restaurant data:', restaurant);
        console.log('Restaurant ID from data:', restaurant._id || restaurant.id);
        
        // Check if we have an ID (it might be _id or id)
        const id = restaurant._id || restaurant.id;
        
        if (id) {
          console.log('Setting Restaurant ID:', id);
          setRestaurantId(id);
        } else {
          console.error('No ID found in restaurant data:', restaurant);
          toast.error('Restaurant ID not found');
          setLoading(false);
        }
      } else {
        console.error('Response structure:', {
          hasStatus: !!response.data?.status,
          status: response.data?.status,
          hasData: !!response.data?.data,
          hasRestaurant: !!response.data?.data?.restaurant
        });
        toast.error('No restaurant found. Please create a restaurant first.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      toast.error('Failed to load restaurant data');
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      console.log('Fetching menu items for restaurant:', restaurantId);
      const response = await menuAPI.getItems(restaurantId);
      console.log('Menu Items Response:', response.data);
      
      if (response.data?.status === 'success' && Array.isArray(response.data?.data?.menuItems)) {
        setMenuItems(response.data.data.menuItems);
      } else if (response.status === 404) {
        console.log('No menu items found for this restaurant');
        setMenuItems([]);
      } else {
        console.error('Unexpected response format:', response.data);
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (formData) => {
    if (!restaurantId) {
      console.error('Restaurant ID not found when adding item');
      toast.error('Restaurant ID not found');
      return;
    }
    
    try {
      console.log('Adding menu item:', { restaurantId, formData });
      
      // Prepare the menu item data
      const menuItemData = {
        ...formData,
        restaurant: restaurantId
      };
      
      const response = await menuAPI.createItem(restaurantId, menuItemData);
      console.log('Create menu item response:', response.data);
      
      if (response.data?.status === 'success') {
        toast.success('Menu item added successfully');
        setShowAddForm(false);
        fetchMenuItems();
      } else {
        console.error('Failed to add menu item:', response.data);
        toast.error(response.data?.message || 'Failed to add menu item');
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error(error.response?.data?.message || 'Failed to add menu item');
    }
  };

  const handleUpdateItem = async (id, formData) => {
    if (!restaurantId) {
      toast.error('Restaurant ID not found');
      return;
    }

    try {
      const response = await menuAPI.updateItem(restaurantId, id, formData);
      console.log('Update menu item response:', response.data);
      
      if (response.data?.success) {
        toast.success('Menu item updated successfully');
        setEditingItem(null);
        fetchMenuItems();
      } else {
        console.error('Failed to update menu item:', response.data);
        toast.error(response.data?.message || 'Failed to update menu item');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!restaurantId) {
      toast.error('Restaurant ID not found');
      return;
    }

    try {
      const response = await menuAPI.deleteItem(restaurantId, id);
      console.log('Delete menu item response:', response.data);
      
      if (response.data?.success) {
        toast.success('Menu item deleted successfully');
        fetchMenuItems();
      } else {
        console.error('Failed to delete menu item:', response.data);
        toast.error(response.data?.message || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const categories = ['all', 'appetizers', 'main-course', 'desserts', 'beverages', 'sides'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Menu Management</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowAddForm(!showAddForm);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {showAddForm ? 'Cancel' : 'Add New Item'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <MenuForm
            editItem={editingItem}
            onSuccess={(formData) => {
              if (editingItem) {
                handleUpdateItem(editingItem.id, formData);
              } else {
                handleAddItem(formData);
              }
            }}
          />
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items List */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{item.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setShowAddForm(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuManagement;
