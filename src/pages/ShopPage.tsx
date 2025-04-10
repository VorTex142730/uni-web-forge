
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ListFilter } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import { products } from '@/data/mockData';

const ShopPage = () => {
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <nav className="text-sm breadcrumbs">
          <ul className="flex">
            <li><a href="/" className="text-gray-500 hover:text-blue-600">Home</a></li>
            <li className="mx-2 text-gray-400">/</li>
            <li className="font-medium">Shop</li>
          </ul>
        </nav>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Shop</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Default sorting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default sorting</SelectItem>
                <SelectItem value="popularity">Sort by popularity</SelectItem>
                <SelectItem value="rating">Sort by average rating</SelectItem>
                <SelectItem value="date">Sort by latest</SelectItem>
                <SelectItem value="price-asc">Sort by price: low to high</SelectItem>
                <SelectItem value="price-desc">Sort by price: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">Showing the single result</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
