import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShopService } from '@/services/shopService';
import { useAuth } from './AuthContext';

const CartContext = createContext<{ cartCount: number; refreshCart: () => void }>({ cartCount: 0, refreshCart: () => {} });

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = async () => {
    if (user) {
      const cart = await ShopService.getCart(user.uid);
      setCartCount(cart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0));
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => { fetchCart(); }, [user]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 