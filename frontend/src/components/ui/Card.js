import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({
  image,
  title,
  description,
  price,
  rating,
  link,
  onClick,
  footer,
  className = ''
}) => {
  const CardWrapper = link ? Link : 'div';
  const wrapperProps = link ? { to: link } : {};

  return (
    <CardWrapper
      {...wrapperProps}
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}
      onClick={onClick}
    >
      {image && (
        <div className="relative h-48 w-full">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          {rating && (
            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-800">
              ⭐ {rating}
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 text-sm mb-3">{description}</p>
        )}
        {price && (
          <div className="text-lg font-bold text-indigo-600">
            ${price.toFixed(2)}
          </div>
        )}
        {footer && <div className="mt-3">{footer}</div>}
      </div>
    </CardWrapper>
  );
};

export default Card;
