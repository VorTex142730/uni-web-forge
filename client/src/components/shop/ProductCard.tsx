
import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star 
          key={index} 
          className={cn(
            "h-4 w-4",
            index < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          )} 
        />
      ));
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="relative">
        {product.onSale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold uppercase">
            SALE!
          </div>
        )}
        
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-56 object-cover"
        />
      </div>
      
      <div className="p-4 text-center">
        <Link to={`/shop/${product.id}`} className="text-lg font-semibold hover:text-blue-600 block">
          {product.name}
        </Link>
        
        {product.rating !== undefined && (
          <div className="flex justify-center mt-2">
            {renderStars(product.rating)}
          </div>
        )}
        
        <div className="mt-2">
          {product.price.sale ? (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-gray-400 line-through">₹{product.price.regular.toFixed(2)}</span>
              <span className="text-xl font-bold">₹{product.price.sale.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-xl font-bold">₹{product.price.regular.toFixed(2)}</span>
          )}
        </div>
        
        <Button className="w-full mt-4 uppercase">SELECT OPTIONS</Button>
      </div>
    </div>
  );
};

export default ProductCard;
