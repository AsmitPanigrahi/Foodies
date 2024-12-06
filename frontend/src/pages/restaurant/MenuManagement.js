import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { menuAPI } from '../../api/menu.api';
import { toast } from 'react-hot-toast';
import RestaurantSelector from '../../components/restaurant/RestaurantSelector';
import MenuForm from '../../components/restaurant/MenuForm';

const MenuManagement = () => {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Memoize the handleRestaurantSelect function to prevent unnecessary re-renders
  const handleRestaurantSelect = useCallback((id) => {
    console.log('Restaurant selected in MenuManagement:', id);
    if (id) {
      setRestaurantId(id);
      // Don't clear menu items here, let the useEffect handle it
    }
  }, []);

  // Fetch menu items when restaurantId changes
  useEffect(() => {
    if (restaurantId) {
      console.log('Restaurant ID changed, fetching menu items for:', restaurantId);
      fetchMenuItems();
    }
  }, [restaurantId]); // Only depend on restaurantId

  const fetchMenuItems = async () => {
    if (!restaurantId) {
      console.log('No restaurant ID provided, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching menu items for restaurant:', restaurantId);
      const response = await menuAPI.getItems(restaurantId);
      console.log('Menu items response:', response);
      
      if (response?.status === 'success' && Array.isArray(response?.data?.menuItems)) {
        console.log('Setting menu items:', response.data.menuItems);
        setMenuItems(response.data.menuItems);
      } else {
        console.warn('Unexpected response structure:', response);
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error fetching menu items:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Failed to load menu items. Please try again.');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (formData) => {
    if (!restaurantId) {
      toast.error('Please select a restaurant first');
      return;
    }

    try {
      console.log('Adding menu item for restaurant:', restaurantId); // Debug log
      console.log('Form data:', formData); // Debug log
      const response = await menuAPI.createItem(restaurantId, formData);
      
      if (response?.status === 'success') {
        toast.success('Menu item added successfully');
        setShowAddForm(false);
        fetchMenuItems(); // Refresh the menu items list
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
    }
  };

  const handleUpdateItem = async (itemId, formData) => {
    if (!restaurantId) {
      toast.error('Please select a restaurant first');
      return;
    }

    try {
      console.log('Updating menu item:', itemId, 'for restaurant:', restaurantId); // Debug log
      console.log('Update form data:', formData); // Debug log
      const response = await menuAPI.updateItem(restaurantId, itemId, formData);
      
      if (response?.status === 'success') {
        toast.success('Menu item updated successfully');
        setEditingItem(null);
        fetchMenuItems(); // Refresh the menu items list
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      console.log('Deleting menu item:', itemId, 'for restaurant:', restaurantId); // Debug log
      const response = await menuAPI.deleteItem(restaurantId, itemId);
      console.log('Delete response:', response); // Debug log
      if (response?.status === 'success') {
        toast.success('Menu item deleted successfully');
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  // Memoize filteredMenuItems to prevent unnecessary recalculations
  const filteredMenuItems = useMemo(() => {
    console.log('Filtering menu items:', { menuItems, selectedCategory });
    if (!Array.isArray(menuItems)) {
      console.warn('menuItems is not an array:', menuItems);
      return [];
    }
    return selectedCategory === 'all'
      ? menuItems
      : menuItems.filter(item => 
          item.category && item.category.toLowerCase() === selectedCategory.toLowerCase()
        );
  }, [menuItems, selectedCategory]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RestaurantSelector onRestaurantSelect={handleRestaurantSelect} />
      
      {restaurantId && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Menu Management</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Menu Item
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="appetizers">Appetizers</option>
              <option value="main-course">Main Course</option>
              <option value="desserts">Desserts</option>
              <option value="beverages">Beverages</option>
              <option value="sides">Sides</option>
            </select>
          </div>

          {showAddForm && (
            <MenuForm
              onSubmit={handleAddItem}
              onCancel={() => setShowAddForm(false)}
              restaurantId={restaurantId}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(filteredMenuItems) && filteredMenuItems.length > 0 ? (
              filteredMenuItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  {editingItem === item._id ? (
                    <MenuForm
                      initialData={item}
                      onSubmit={(formData) => handleUpdateItem(item._id, formData)}
                      onCancel={() => setEditingItem(null)}
                      restaurantId={restaurantId}
                      editingItem={item._id}
                    />
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                      <p className="text-gray-600 mb-2">{item.description || 'No description available'}</p>
                      <p className="text-gray-800 font-medium mb-2">${item.price}</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Category: {item.category || 'Uncategorized'}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingItem(item._id)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500">
                No menu items found. {selectedCategory !== 'all' && 'Try changing the category filter or '} 
                Click "Add Menu Item" to create one.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MenuManagement;
