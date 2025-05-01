import React, { useEffect, useState } from 'react';
import { ShopService, Product } from '@/services/shopService';
import AdminProductForm from '@/components/shop/AdminProductForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { userDetails, user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = !!userDetails?.isAdmin;

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchProducts();
    // eslint-disable-next-line
  }, [isAdmin]);

  const fetchProducts = async () => {
    setProducts(await ShopService.getProducts());
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await ShopService.deleteProduct(id);
    fetchProducts();
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Product Management</h1>
        <Button onClick={() => { setEditingProduct(null); setShowForm(true); }}>Add Product</Button>
      </div>
      {showForm && (
        <AdminProductForm product={editingProduct!} onSave={handleSave} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {products.map(product => (
          <div
            key={product.id}
            className="flex flex-col bg-white rounded-xl shadow-md border hover:shadow-lg transition-shadow duration-200 p-4 group"
          >
            <div className="flex items-center justify-center h-40 mb-4 bg-gray-50 rounded-lg border">
              <img
                src={product.imageData}
                alt={product.name}
                className="object-contain h-36 max-w-full"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="font-semibold text-lg text-gray-900 truncate">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-2 truncate">{product.description}</p>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl font-bold text-blue-700">${product.price}</span>
                <span className="text-xs text-gray-400">Stock: {product.stock}</span>
              </div>
              <div className="flex space-x-2 mt-auto pt-2">
                <Button
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDelete(product.id!)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductPage; 