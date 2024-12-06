import React from 'react';
import Button from '../ui/Button';

const MenuItem = ({ item, onAddToCart }) => {
  const {
    name,
    description,
    price,
    image,
    isVegetarian,
    spicyLevel,
    isAvailable
  } = item;

  const SpicyLevelIndicator = ({ level }) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(3)].map((_, index) => (
          <span
            key={index}
            className={`h-3 w-3 rounded-full ${
              index < level ? 'bg-red-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex space-x-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex-shrink-0 w-24 h-24">
        <img
          src={image || 'https://via.placeholder.com/96?text=Food'}
          alt={name}
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {name}
              {isVegetarian && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Veg
                </span>
              )}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            ${price.toFixed(2)}
          </div>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {spicyLevel > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600">Spicy:</span>
                <SpicyLevelIndicator level={spicyLevel} />
              </div>
            )}
          </div>
          
          <Button
            size="sm"
            disabled={!isAvailable}
            onClick={() => onAddToCart(item)}
          >
            {isAvailable ? 'Add to Cart' : 'Not Available'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
