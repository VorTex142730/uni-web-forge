import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopService, Product } from '@/services/shopService';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) ShopService.getProduct(id).then(p => { setProduct(p); setLoading(false); });
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please log in to add to cart');
      navigate('/login');
      return;
    }
    if (!product || quantity < 1 || quantity > product.stock) return;
    setAdding(true);
    try {
      await ShopService.addToCart(user.uid, product.id!, quantity);
      await ShopService.updateProduct(product.id!, { stock: product.stock - quantity });
      setProduct({ ...product, stock: product.stock - quantity });
      refreshCart();
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading || !product) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-10 bg-white rounded-xl shadow-md p-8">
        {/* Image Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-gray-50 border rounded-lg p-4 flex items-center justify-center w-full max-w-xs h-80">
            <img
              src={product.imageData}
              alt={product.name}
              className="object-contain h-72 w-full"
            />
          </div>
        </div>
        {/* Details Section */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="text-2xl font-bold text-blue-700 mb-2">${product.price}</div>
          <div className="text-gray-600 mb-4">{product.description}</div>
          <div className="mb-4">
            <span className="font-medium">Stock:</span> {product.stock}
          </div>
          <div className="flex items-center gap-3 mb-4">
            <label htmlFor="quantity" className="font-medium">Quantity:</label>
            <input
              id="quantity"
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
              className="border rounded px-2 py-1 w-20"
              disabled={product.stock === 0 || adding}
            />
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
          >
            {product.stock === 0 ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage; 