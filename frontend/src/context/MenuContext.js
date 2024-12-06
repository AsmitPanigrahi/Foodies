import React, { createContext, useContext, useState } from 'react';
import { restaurantAPI } from '../services/api';
import toast from 'react-hot-toast';

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMenu = async (restaurantId) => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getMenu(restaurantId);
      setMenuItems(response.data.items);
      setCategories(response.data.categories);
    } catch (error) {
      toast.error('Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (restaurantId, itemData) => {
    try {
      setLoading(true);
      const response = await restaurantAPI.addMenuItem(restaurantId, itemData);
      setMenuItems([...menuItems, response.data]);
      toast.success('Menu item added successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to add menu item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMenuItem = async (restaurantId, itemId, itemData) => {
    try {
      setLoading(true);
      const response = await restaurantAPI.updateMenuItem(restaurantId, itemId, itemData);
      setMenuItems(menuItems.map(item => 
        item.id === itemId ? response.data : item
      ));
      toast.success('Menu item updated successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to update menu item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteMenuItem = async (restaurantId, itemId) => {
    try {
      setLoading(true);
      await restaurantAPI.deleteMenuItem(restaurantId, itemId);
      setMenuItems(menuItems.filter(item => item.id !== itemId));
      toast.success('Menu item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (restaurantId, categoryData) => {
    try {
      setLoading(true);
      const response = await restaurantAPI.addCategory(restaurantId, categoryData);
      setCategories([...categories, response.data]);
      toast.success('Category added successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to add category');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (restaurantId, categoryId, categoryData) => {
    try {
      setLoading(true);
      const response = await restaurantAPI.updateCategory(restaurantId, categoryId, categoryData);
      setCategories(categories.map(category => 
        category.id === categoryId ? response.data : category
      ));
      toast.success('Category updated successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to update category');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (restaurantId, categoryId) => {
    try {
      setLoading(true);
      await restaurantAPI.deleteCategory(restaurantId, categoryId);
      setCategories(categories.filter(category => category.id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    menuItems,
    categories,
    loading,
    fetchMenu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
    updateCategory,
    deleteCategory
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

export default MenuContext;
