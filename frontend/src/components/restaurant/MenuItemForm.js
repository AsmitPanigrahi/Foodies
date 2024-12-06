import React, { useState } from 'react';
import { useMenu } from '../../context/MenuContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import useForm from '../../hooks/useForm';

const MenuItemForm = ({ restaurantId, item = null, onSuccess, onCancel }) => {
  const { addMenuItem, updateMenuItem } = useMenu();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, handleBlur, validateForm, setValues } = useForm(
    {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || '',
      categoryId: item?.categoryId || '',
      isVegetarian: item?.isVegetarian || false,
      isAvailable: item?.isAvailable || true,
      spicyLevel: item?.spicyLevel || 0,
    },
    {
      name: [{ type: 'required' }, { type: 'length', min: 2, max: 50 }],
      price: [{ type: 'required' }, { type: 'price' }],
      description: [{ type: 'required' }, { type: 'length', min: 10, max: 200 }],
      categoryId: [{ type: 'required' }],
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(values).forEach(key => formData.append(key, values[key]));
      if (image) {
        formData.append('image', image);
      }

      let result;
      if (item) {
        result = await updateMenuItem(restaurantId, item.id, formData);
      } else {
        result = await addMenuItem(restaurantId, formData);
      }

      if (result) {
        onSuccess(result);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Item Image
        </label>
        <div className="mt-1 flex items-center">
          <div className="relative">
            <img
              src={
                image
                  ? URL.createObjectURL(image)
                  : item?.image || 'https://via.placeholder.com/150'
              }
              alt="Menu item"
              className="h-32 w-32 object-cover rounded-md"
            />
            <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <svg
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </label>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Input
        label="Item Name"
        name="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.name}
        required
      />

      <Input
        label="Description"
        name="description"
        value={values.description}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.description}
        required
        multiline
      />

      <Input
        label="Price"
        name="price"
        type="number"
        step="0.01"
        value={values.price}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.price}
        required
      />

      {/* Additional Options */}
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isVegetarian"
            name="isVegetarian"
            checked={values.isVegetarian}
            onChange={(e) =>
              handleChange({
                target: { name: 'isVegetarian', value: e.target.checked },
              })
            }
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isVegetarian" className="ml-2 text-sm text-gray-600">
            Vegetarian
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isAvailable"
            name="isAvailable"
            checked={values.isAvailable}
            onChange={(e) =>
              handleChange({
                target: { name: 'isAvailable', value: e.target.checked },
              })
            }
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-600">
            Available
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Spicy Level
          </label>
          <select
            name="spicyLevel"
            value={values.spicyLevel}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="0">Not Spicy</option>
            <option value="1">Mild</option>
            <option value="2">Medium</option>
            <option value="3">Hot</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {item ? 'Update' : 'Add'} Item
        </Button>
      </div>
    </form>
  );
};

export default MenuItemForm;
