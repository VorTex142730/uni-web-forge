import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShoppingBag, Search } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header with Fixed Gradient */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700">
        <div className="max-w-7xl mx-auto px-4">
          {/* Cover Photo Area */}
          <div className="relative h-32">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600" />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <div className="text-white flex-1">
                  <div className="flex items-center gap-4 text-sm">
                    <span>1 total product</span>
                    <span>•</span>
                    <span>Early bird offer available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm mb-6">
          <Link to="/" className="text-gray-500 hover:text-green-600">Home</Link>
          <span className="text-gray-500">/</span>
          <span>Shop</span>
        </div>

        {/* Shop Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products..."
              className="border border-gray-200 pl-10 pr-4 py-2 rounded-lg w-60 text-sm"
            />
          </div>
          
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

        <div className="text-sm text-gray-500 mb-6">
          Showing the single result
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Product Card */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
            {/* Sale Badge */}
            {product.onSale && (
              <div className="bg-red-500 text-white px-3 py-1 absolute z-10">
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
    </div>
  );
};

export default ShopPage;
