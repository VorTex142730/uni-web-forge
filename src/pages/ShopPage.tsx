import React, { useEffect, useState, useMemo } from 'react';
import { ShopService, Product } from '@/services/shopService';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, Search, X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';

const ShopPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [filterStock, setFilterStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    ShopService.getProducts()
      .then(setProducts)
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false));
  }, []);

  // Fetch cart
  useEffect(() => {
    if (!user) return;
    ShopService.getCart(user.uid).then(setCart);
  }, [user]);

  // Cart actions
  const addToCart = async (product: Product, quantity = 1) => {
    if (!user) return;
    setCartLoading(true);
    await ShopService.addToCart(user.uid, product.id!, quantity);
    const updated = await ShopService.getCart(user.uid);
    setCart(updated);
    setCartLoading(false);
  };
  const removeFromCart = async (productId: string) => {
    if (!user) return;
    setCartLoading(true);
    await ShopService.removeFromCart(user.uid, productId);
    const updated = await ShopService.getCart(user.uid);
    setCart(updated);
    setCartLoading(false);
  };
  const updateCartQty = async (productId: string, qty: number) => {
    if (!user) return;
    setCartLoading(true);
    await ShopService.addToCart(user.uid, productId, qty - (cart.find(i => i.productId === productId)?.quantity || 0));
    const updated = await ShopService.getCart(user.uid);
    setCart(updated);
    setCartLoading(false);
  };
  const clearCart = async () => {
    if (!user) return;
    setCartLoading(true);
    await ShopService.clearCart(user.uid);
    setCart([]);
    setCartLoading(false);
  };

  // Derived filtered/sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (filterStock) {
      result = result.filter(p => p.stock > 0);
    }
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }
    return result;
  }, [products, search, sort, filterStock]);

  // Cart total
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const prod = products.find(p => p.id === item.productId);
      return sum + (prod ? prod.price * item.quantity : 0);
    }, 0);
  }, [cart, products]);

  // Modal product details
  const openProductModal = async (id: string) => {
    setModalLoading(true);
    const prod = await ShopService.getProduct(id);
    setModalProduct(prod);
    setModalLoading(false);
  };
  const closeModal = () => setModalProduct(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Shop</h1>
          <div className="flex gap-2 items-center w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="border border-gray-200 pl-10 pr-4 py-2 rounded-lg w-full text-sm bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              className="relative ml-2 p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-6 w-6 text-blue-700" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{cart.length}</span>
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select
            className="border border-gray-200 px-4 py-2 rounded-lg bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filterStock}
              onChange={e => setFilterStock(e.target.checked)}
              className="accent-blue-500"
            />
            In Stock Only
          </label>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-blue-400" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 bg-white/80 rounded-lg p-8">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 bg-white/80 rounded-lg p-8">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="flex flex-col bg-white rounded-xl shadow-md border hover:shadow-xl transition-shadow duration-200 p-4 cursor-pointer group relative"
                onClick={() => openProductModal(product.id!)}
              >
                {product.stock === 0 && (
                  <span className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-semibold">Out of Stock</span>
                )}
                <div className="flex items-center justify-center h-40 mb-4 bg-gray-50 rounded-lg border overflow-hidden">
                  <img
                    src={product.imageData}
                    alt={product.name}
                    className="object-contain h-36 max-w-full transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <h2 className="font-semibold text-lg text-gray-900 truncate mb-1">{product.name}</h2>
                  <p className="text-gray-500 text-sm mb-2 truncate">{product.description}</p>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl font-bold text-blue-700">${product.price}</span>
                    <span className="text-xs text-gray-400">Stock: {product.stock}</span>
                  </div>
                  <button
                    className={`mt-auto px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    disabled={product.stock === 0 || cartLoading}
                    onClick={e => { e.stopPropagation(); addToCart(product); }}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeIn">
            <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100" onClick={closeModal}>
              <X className="h-5 w-5" />
            </button>
            {modalLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin h-8 w-8 text-blue-400" />
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row gap-6">
                  <img src={modalProduct.imageData} alt={modalProduct.name} className="w-40 h-40 object-contain rounded-lg border bg-gray-50" />
                  <div className="flex-1 flex flex-col">
                    <h2 className="text-2xl font-bold mb-2">{modalProduct.name}</h2>
                    <p className="text-gray-600 mb-2">{modalProduct.description}</p>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-xl font-bold text-blue-700">${modalProduct.price}</span>
                      <span className="text-xs text-gray-400">Stock: {modalProduct.stock}</span>
                    </div>
                    <button
                      className={`mt-auto px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${modalProduct.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      disabled={modalProduct.stock === 0 || cartLoading}
                      onClick={() => addToCart(modalProduct)}
                    >
                      {modalProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-slideInRight relative">
            <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100" onClick={() => setCartOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-blue-900 flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> Cart</h2>
            {cartLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-blue-400" />
              </div>
            ) : cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">Your cart is empty.</div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                {cart.map(item => {
                  const prod = products.find(p => p.id === item.productId);
                  if (!prod) return null;
                  return (
                    <div key={item.productId} className="flex gap-4 items-center border-b pb-4 last:border-b-0">
                      <img src={prod.imageData} alt={prod.name} className="w-16 h-16 object-contain rounded border bg-gray-50" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{prod.name}</div>
                        <div className="text-xs text-gray-500">${prod.price} x {item.quantity}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            className="p-1 rounded hover:bg-blue-100"
                            onClick={() => updateCartQty(item.productId, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1 || cartLoading}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <span className="px-2 font-semibold">{item.quantity}</span>
                          <button
                            className="p-1 rounded hover:bg-blue-100"
                            onClick={() => updateCartQty(item.productId, Math.min(prod.stock, item.quantity + 1))}
                            disabled={item.quantity >= prod.stock || cartLoading}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            className="ml-2 text-red-500 hover:text-red-700 text-xs font-bold"
                            onClick={() => removeFromCart(item.productId)}
                            disabled={cartLoading}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-lg">Total:</span>
                <span className="text-xl font-bold text-blue-700">${cartTotal.toFixed(2)}</span>
              </div>
              <button
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-300 disabled:text-gray-400"
                disabled={cart.length === 0 || cartLoading}
                onClick={() => { alert('Checkout coming soon!'); }}
              >
                Checkout
              </button>
              <button
                className="w-full mt-2 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                disabled={cart.length === 0 || cartLoading}
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
