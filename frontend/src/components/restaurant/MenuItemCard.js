import React from 'react';
import { useMenu } from '../../context/MenuContext';
import Button from '../ui/Button';

const MenuItemCard = ({ item, restaurantId, onEdit }) => {
  const { deleteMenuItem } = useMenu();
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteMenuItem(restaurantId, item.id);
    }
  };

  const getSpicyLevelLabel = (level) => {
    switch (level) {
      case 1:
        return 'Mild';
      case 2:
        return 'Medium';
      case 3:
        return 'Hot';
      default:
        return 'Not Spicy';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="relative">
        <img
          src={item.image || 'https://via.placeholder.com/300x200'}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        {!item.isAvailable && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
            Unavailable
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
          <span className="text-lg font-semibold text-gray-900">
            ${item.price.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4">{item.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {item.isVegetarian && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Vegetarian
            </span>
          )}
          {item.spicyLevel > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {getSpicyLevelLabel(item.spicyLevel)}
            </span>
          )}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(item)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
