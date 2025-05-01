import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShopService, Product } from '@/services/shopService';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CartPage: React.FC = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartAndProducts();
    // eslint-disable-next-line
  }, [user]);

  const fetchCartAndProducts = async () => {
    if (!user) return;
    setLoading(true);
    const cartItems = await ShopService.getCart(user.uid);
    setCart(cartItems);
    // Fetch all products in cart
    const allProducts: Product[] = [];
    for (const item of cartItems) {
      const prod = await ShopService.getProduct(item.productId);
      if (prod) allProducts.push(prod);
    }
    setProducts(allProducts);
    setLoading(false);
  };

  const getProduct = (id: string) => products.find(p => p.id === id);
  const getSubtotal = (item: any) => {
    const prod = getProduct(item.productId);
    return prod ? prod.price * item.quantity : 0;
  };
  const total = cart.reduce((sum, item) => sum + getSubtotal(item), 0);

  const handleQuantityChange = async (item: any, newQty: number) => {
    if (!user) return;
    if (newQty < 1) return;
    setUpdating(true);
    try {
      // Update cart in Firestore
      await ShopService.addToCart(user.uid, item.productId, newQty - item.quantity);
      // Update stock in Firestore
      const prod = getProduct(item.productId);
      if (prod) {
        await ShopService.updateProduct(prod.id!, { stock: prod.stock - (newQty - item.quantity) });
      }
      await fetchCartAndProducts();
    } catch (err) {
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (item: any) => {
    if (!user) return;
    setUpdating(true);
    try {
      await ShopService.removeFromCart(user.uid, item.productId);
      // Optionally, restore stock
      const prod = getProduct(item.productId);
      if (prod) {
        await ShopService.updateProduct(prod.id!, { stock: prod.stock + item.quantity });
      }
      await fetchCartAndProducts();
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {cart.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Button onClick={() => navigate('/shop')}>Go to Shop</Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="divide-y">
            {cart.map(item => {
              const prod = getProduct(item.productId);
              if (!prod) return null;
              return (
                <div key={item.productId} className="flex items-center py-4 gap-4">
                  <img src={prod.imageData} alt={prod.name} className="h-20 w-20 object-contain rounded border bg-gray-50" />
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{prod.name}</div>
                    <div className="text-gray-500 text-sm">${prod.price} x </div>
                    <input
                      type="number"
                      min={1}
                      max={prod.stock + item.quantity}
                      value={item.quantity}
                      disabled={updating}
                      onChange={e => handleQuantityChange(item, Number(e.target.value))}
                      className="border rounded px-2 py-1 w-20 mt-1"
                    />
                  </div>
                  <div className="font-bold text-blue-700 text-lg">${getSubtotal(item)}</div>
                  <Button size="sm" variant="destructive" onClick={() => handleRemove(item)} disabled={updating}>Remove</Button>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center mt-6">
            <div className="text-xl font-bold">Total: ${total}</div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg" onClick={() => navigate('/checkout')} disabled={updating}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
