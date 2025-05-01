import React, { useEffect, useState } from 'react';
import { ShopService, Product } from '@/services/shopService';
import { useNavigate } from 'react-router-dom';

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    ShopService.getProducts().then(setProducts);
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Shop</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {products.map(product => (
          <div
            key={product.id}
            className="flex flex-col bg-white rounded-xl shadow-md border hover:shadow-lg transition-shadow duration-200 p-4 cursor-pointer group"
            onClick={() => navigate(`/booking/${product.id}`)}
          >
            <div className="flex items-center justify-center h-40 mb-4 bg-gray-50 rounded-lg border">
              <img
                src={product.imageData}
                alt={product.name}
                className="object-contain h-36 max-w-full"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <h2 className="font-semibold text-lg text-gray-900 truncate">{product.name}</h2>
              <p className="text-gray-500 text-sm mb-2 truncate">{product.description}</p>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl font-bold text-blue-700">${product.price}</span>
                <span className="text-xs text-gray-400">Stock: {product.stock}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
