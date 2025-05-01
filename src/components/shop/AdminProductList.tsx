import React, { useEffect, useState } from 'react';
import { ShopService, Product } from '@/services/shopService';
import AdminProductForm from './AdminProductForm';
import { Button } from '@/components/ui/button';

interface AdminProductListProps {
  userDetails: any;
}

const AdminProductList: React.FC<AdminProductListProps> = ({ userDetails }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const isAdmin = !!userDetails?.isAdmin;

  const fetchProducts = async () => {
    setProducts(await ShopService.getProducts());
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Admin Product Management</h2>
        <Button onClick={() => { setEditingProduct(null); setShowForm(true); }}>Add Product</Button>
      </div>
      {showForm && (
        <AdminProductForm product={editingProduct!} onSave={handleSave} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-4 flex flex-col">
            <img src={product.imageData} alt={product.name} className="h-32 object-cover mb-2 rounded" />
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-600">{product.description}</p>
            <p className="font-bold mt-2">${product.price}</p>
            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
            <div className="flex space-x-2 mt-2">
              <Button size="sm" onClick={() => handleEdit(product)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id!)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductList; 