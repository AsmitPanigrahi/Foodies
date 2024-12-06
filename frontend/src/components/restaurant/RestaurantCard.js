import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  const {
    id,
    name,
    image,
    cuisine,
    rating,
    deliveryTime,
    minimumOrder,
    description
  } = restaurant;

  return (
    <Link
      to={`/restaurants/${id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-48">
        <img
          src={image || 'https://via.placeholder.com/400x300?text=Restaurant'}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-800">
          ⭐ {rating.toFixed(1)}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <span className="text-sm text-gray-600">{deliveryTime} mins</span>
        </div>
        
        <div className="mt-1 text-sm text-gray-600">
          {cuisine.join(' • ')}
        </div>
        
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {description}
        </p>
        
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Min. order: ${minimumOrder}
          </span>
          <span className="text-indigo-600 font-medium">
            View Menu →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
