import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MidnightMasqueradeImage from '@/assets/midnight-masquerade.jpg';

const ShopPage = () => {
  const [sortBy, setSortBy] = useState('popularity');

  const product = {
    id: 1,
    name: 'MIDNIGHT MASQUERADE',
    image: MidnightMasqueradeImage,
    minPrice: 700.00,
    maxPrice: 1649.00,
    rating: 0,
    onSale: true
  };

  return (
    <div className="container mx-auto px-4">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm mb-6">
        <Link to="/" className="text-gray-500 hover:text-blue-600">Home</Link>
        <span className="text-gray-500">/</span>
        <span>Shop</span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8">Shop</h1>

      {/* Shop Header */}
      <div className="flex justify-between items-center mb-8">
        <p className="text-sm text-gray-500">Showing the single result</p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by popularity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Sort by popularity</SelectItem>
            <SelectItem value="rating">Sort by average rating</SelectItem>
            <SelectItem value="date">Sort by latest</SelectItem>
            <SelectItem value="price-low">Sort by price: low to high</SelectItem>
            <SelectItem value="price-high">Sort by price: high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Product Card */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
          {/* Sale Badge */}
          {product.onSale && (
            <div className="bg-red-500 text-white px-3 py-1 absolute">
              SALE!
            </div>
          )}
          
          {/* Product Image */}
          <div className="relative aspect-square">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="p-4 text-center">
            <h3 className="text-lg font-medium mb-2">{product.name}</h3>
            
            {/* Star Rating */}
            <div className="flex justify-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-gray-300">★</span>
              ))}
            </div>

            {/* Price */}
            <div className="text-red-500 mb-4">
              <span>₹{product.minPrice.toFixed(2)}</span>
              <span> – </span>
              <span>₹{product.maxPrice.toFixed(2)}</span>
            </div>

            {/* Select Options Button */}
            <Link 
              to="/booking/midnight-masquerade" 
              className="w-full bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors inline-block text-center"
            >
              SELECT OPTIONS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
