import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const MenuForm = ({ onSuccess, editItem = null }) => {
  const [formData, setFormData] = useState({
    name: editItem?.name || '',
    description: editItem?.description || '',
    price: editItem?.price || '',
    category: editItem?.category || '',
    image: editItem?.image || '',
    isVegetarian: editItem?.isVegetarian || false,
    isVegan: editItem?.isVegan || false,
    isGlutenFree: editItem?.isGlutenFree || false,
    spicyLevel: editItem?.spicyLevel || 'mild',
    ingredients: editItem?.ingredients || [],
    allergens: editItem?.allergens || [],
    nutritionalInfo: editItem?.nutritionalInfo || {
      calories: '',
      protein: '',
      carbohydrates: '',
      fat: ''
    },
    isAvailable: editItem?.isAvailable || true,
    preparationTime: editItem?.preparationTime || '',
    isPopular: editItem?.isPopular || false,
    isSpecial: editItem?.isSpecial || false,
    discount: editItem?.discount || {
      percentage: 0,
      isActive: false
    },
    customization: editItem?.customization || []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSuccess(formData);
      
      if (!editItem) {
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          image: '',
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          spicyLevel: 'mild',
          ingredients: [],
          allergens: [],
          nutritionalInfo: {
            calories: '',
            protein: '',
            carbohydrates: '',
            fat: ''
          },
          isAvailable: true,
          preparationTime: '',
          isPopular: false,
          isSpecial: false,
          discount: {
            percentage: 0,
            isActive: false
          },
          customization: []
        });
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'ingredients' || name === 'allergens') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim())
      }));
    } else if (name.startsWith('nutritionalInfo.')) {
      const nutritionField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        nutritionalInfo: {
          ...prev.nutritionalInfo,
          [nutritionField]: value
        }
      }));
    } else if (name === 'discount.percentage') {
      setFormData(prev => ({
        ...prev,
        discount: {
          ...prev.discount,
          percentage: Number(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Preparation Time (minutes)</label>
          <input
            type="number"
            name="preparationTime"
            value={formData.preparationTime}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Dietary Information */}
        <div className="col-span-2">
          <h3 className="text-lg font-medium text-gray-900">Dietary Information</h3>
          <div className="mt-2 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isVegetarian"
                checked={formData.isVegetarian}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2">Vegetarian</span>
            </label>
            <label className="inline-flex items-center ml-4">
              <input
                type="checkbox"
                name="isVegan"
                checked={formData.isVegan}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2">Vegan</span>
            </label>
            <label className="inline-flex items-center ml-4">
              <input
                type="checkbox"
                name="isGlutenFree"
                checked={formData.isGlutenFree}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2">Gluten Free</span>
            </label>
          </div>
        </div>

        {/* Spicy Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Spicy Level</label>
          <select
            name="spicyLevel"
            value={formData.spicyLevel}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="mild">Mild</option>
            <option value="medium">Medium</option>
            <option value="hot">Hot</option>
            <option value="extra-hot">Extra Hot</option>
          </select>
        </div>

        {/* Ingredients and Allergens */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Ingredients (comma-separated)</label>
          <input
            type="text"
            name="ingredients"
            value={formData.ingredients.join(', ')}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Allergens (comma-separated)</label>
          <input
            type="text"
            name="allergens"
            value={formData.allergens.join(', ')}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Nutritional Information */}
        <div className="col-span-2">
          <h3 className="text-lg font-medium text-gray-900">Nutritional Information</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Calories</label>
              <input
                type="number"
                name="nutritionalInfo.calories"
                value={formData.nutritionalInfo.calories}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
              <input
                type="number"
                name="nutritionalInfo.protein"
                value={formData.nutritionalInfo.protein}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Carbohydrates (g)</label>
              <input
                type="number"
                name="nutritionalInfo.carbohydrates"
                value={formData.nutritionalInfo.carbohydrates}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
              <input
                type="number"
                name="nutritionalInfo.fat"
                value={formData.nutritionalInfo.fat}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="col-span-2">
          <h3 className="text-lg font-medium text-gray-900">Additional Options</h3>
          <div className="mt-2 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2">Available</span>
            </label>
            <label className="inline-flex items-center ml-4">
              <input
                type="checkbox"
                name="isPopular"
                checked={formData.isPopular}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2">Popular</span>
            </label>
            <label className="inline-flex items-center ml-4">
              <input
                type="checkbox"
                name="isSpecial"
                checked={formData.isSpecial}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2">Special</span>
            </label>
          </div>
        </div>

        {/* Discount */}
        <div className="col-span-2">
          <h3 className="text-lg font-medium text-gray-900">Discount</h3>
          <div className="mt-2 flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Percentage</label>
              <input
                type="number"
                name="discount.percentage"
                value={formData.discount.percentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="discount.isActive"
                  checked={formData.discount.isActive}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="ml-2">Active</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => onSuccess(null)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {editItem ? 'Update' : 'Add'} Item
        </button>
      </div>
    </form>
  );
};

export default MenuForm;