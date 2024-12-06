import React, { useState } from 'react';
import { useMenu } from '../../context/MenuContext';
import MenuItemCard from './MenuItemCard';
import Button from '../ui/Button';
import MenuItemForm from './MenuItemForm';
import CategoryForm from './CategoryForm';
import Modal from '../ui/Modal';

const MenuList = ({ restaurantId }) => {
  const { menuItems, categories, loading } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.categoryId === selectedCategory);

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowItemModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleItemSuccess = () => {
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleCategorySuccess = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Category Management */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
          <Button onClick={() => setShowCategoryModal(true)}>
            Add Category
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
          <Button onClick={() => setShowItemModal(true)}>
            Add Menu Item
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              restaurantId={restaurantId}
              onEdit={handleEditItem}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No menu items found
            </h3>
            <p className="text-gray-500">
              {selectedCategory === 'all'
                ? 'Start by adding your first menu item'
                : 'No items in this category'}
            </p>
          </div>
        )}
      </div>

      {/* Menu Item Modal */}
      <Modal
        isOpen={showItemModal}
        onClose={() => {
          setShowItemModal(false);
          setEditingItem(null);
        }}
        title={`${editingItem ? 'Edit' : 'Add'} Menu Item`}
      >
        <MenuItemForm
          restaurantId={restaurantId}
          item={editingItem}
          onSuccess={handleItemSuccess}
          onCancel={() => {
            setShowItemModal(false);
            setEditingItem(null);
          }}
        />
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        title={`${editingCategory ? 'Edit' : 'Add'} Category`}
      >
        <CategoryForm
          restaurantId={restaurantId}
          category={editingCategory}
          onSuccess={handleCategorySuccess}
          onCancel={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default MenuList;
