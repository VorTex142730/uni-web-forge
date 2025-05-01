import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShopService, Product } from '@/services/shopService';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchCartAndProducts();
  }, [user]);

  const getProduct = (id: string) => products.find(p => p.id === id);
  const getSubtotal = (item: any) => {
    const prod = getProduct(item.productId);
    return prod ? prod.price * item.quantity : 0;
  };
  const total = cart.reduce((sum, item) => sum + getSubtotal(item), 0);

  const handleVerifyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation for payment fields
    if (paymentMethod === 'card') {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCVC.trim()) {
        toast.error('Please fill in all card details');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId.trim()) {
        toast.error('Please enter your UPI ID');
        return;
      }
    } else if (paymentMethod === 'paypal') {
      if (!paypalEmail.trim()) {
        toast.error('Please enter your PayPal email');
        return;
      }
    }
    setVerifying(true);
    setTimeout(() => {
      setPaymentVerified(true);
      setVerifying(false);
      toast.success('Payment verified!');
    }, 1200);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error('Please enter a shipping address');
      return;
    }
    if (!paymentVerified) {
      toast.error('Please verify your payment before placing the order');
      return;
    }
    setPlacingOrder(true);
    // In a real app, you would create an order in Firestore here
    setTimeout(() => {
      toast.success('Order placed successfully!');
      navigate('/shop');
    }, 1500);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="divide-y">
            {cart.map(item => {
              const prod = getProduct(item.productId);
              if (!prod) return null;
              return (
                <div key={item.productId} className="flex items-center py-4 gap-4">
                  <img src={prod.imageData} alt={prod.name} className="h-16 w-16 object-contain rounded border bg-gray-50" />
                  <div className="flex-1">
                    <div className="font-semibold">{prod.name}</div>
                    <div className="text-gray-500 text-sm">${prod.price} x {item.quantity}</div>
                  </div>
                  <div className="font-bold text-blue-700">${getSubtotal(item)}</div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end mt-6">
            <div className="text-lg font-bold">Total: ${total}</div>
          </div>
        </div>
        {/* Shipping Address & Payment */}
        <form className="bg-white rounded-xl shadow-md p-6 flex flex-col" onSubmit={handlePlaceOrder}>
          <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
          <textarea
            className="border rounded p-3 mb-4 min-h-[100px]"
            placeholder="Enter your shipping address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
          />
          <h2 className="text-lg font-semibold mb-4 mt-2">Payment Method</h2>
          <select
            className="border rounded p-2 mb-4"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
            disabled={paymentVerified}
          >
            <option value="card">Credit/Debit Card</option>
            <option value="upi">UPI</option>
            <option value="paypal">PayPal (mock)</option>
          </select>
          {paymentMethod === 'card' && (
            <div className="space-y-2 mb-4">
              <input
                className="border rounded p-2 w-full"
                placeholder="Card Number"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                disabled={paymentVerified}
                required
              />
              <div className="flex gap-2">
                <input
                  className="border rounded p-2 w-1/2"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={e => setCardExpiry(e.target.value)}
                  disabled={paymentVerified}
                  required
                />
                <input
                  className="border rounded p-2 w-1/2"
                  placeholder="CVC"
                  value={cardCVC}
                  onChange={e => setCardCVC(e.target.value)}
                  disabled={paymentVerified}
                  required
                />
              </div>
            </div>
          )}
          {paymentMethod === 'upi' && (
            <input
              className="border rounded p-2 w-full mb-4"
              placeholder="Enter UPI ID"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              disabled={paymentVerified}
              required
            />
          )}
          {paymentMethod === 'paypal' && (
            <input
              className="border rounded p-2 w-full mb-4"
              placeholder="PayPal Email"
              value={paypalEmail}
              onChange={e => setPaypalEmail(e.target.value)}
              disabled={paymentVerified}
              required
            />
          )}
          {!paymentVerified ? (
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg mb-4"
              onClick={handleVerifyPayment}
              disabled={verifying}
            >
              {verifying ? 'Verifying Payment...' : 'Verify Payment'}
            </Button>
          ) : (
            <div className="mb-4 flex items-center text-green-700 font-semibold">
              <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Payment Verified
            </div>
          )}
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-auto"
            disabled={placingOrder || !paymentVerified}
          >
            {placingOrder ? 'Placing Order...' : 'Place Order'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage; 