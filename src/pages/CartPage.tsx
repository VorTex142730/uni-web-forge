
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { cartItems, shippingMethods, countries } from '@/data/cartData';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const CartPage = () => {
  const [couponCode, setCouponCode] = useState('');
  const [couponOpen, setCouponOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState('free');
  const [selectedCountry, setSelectedCountry] = useState('india');
  
  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };
  
  const calculateShippingCost = () => {
    const method = shippingMethods.find(m => m.id === selectedShipping);
    return method?.price === 'FREE' ? 0 : (method?.price || 0);
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateShippingCost();
  };
  
  const handleRemoveItem = (itemId: number) => {
    // In a real app, we would update the cart in the database
    // and update the local state accordingly
    console.log(`Removing item ${itemId}`);
  };
  
  const handleCheckout = () => {
    // In a real app, we would redirect to the checkout page
    console.log('Proceeding to checkout');
  };
  
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };
  
  const calculateSavings = (product: typeof cartItems[0]) => {
    if (!product.originalPrice) return 0;
    return product.originalPrice - product.price;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <Trash2 className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="mt-5 text-lg font-medium">Your cart is empty</h2>
          <p className="mt-2 text-gray-500">
            Browse our collection to find something you'll love.
          </p>
          <Button asChild className="mt-6">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full mb-6">
                <thead className="border-b">
                  <tr>
                    <th className="pb-2 text-left font-semibold">PRODUCT</th>
                    <th className="pb-2 text-right font-semibold">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-6">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden mr-4">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-hotspot-primary">{item.name}</h3>
                            <div className="flex items-center mt-1">
                              <span className="text-gray-900 font-semibold">{formatPrice(item.price)}</span>
                              {item.originalPrice && (
                                <span className="ml-2 text-gray-500 line-through text-sm">
                                  {formatPrice(item.originalPrice)}
                                </span>
                              )}
                            </div>
                            {item.originalPrice && (
                              <div className="mt-1 text-sm">
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-sm">
                                  SAVE {formatPrice(calculateSavings(item))}
                                </span>
                              </div>
                            )}
                            
                            <div className="mt-3">
                              {Object.entries(item.details).map(([key, value]) => (
                                <div key={key} className="text-sm mb-1">
                                  <span className="text-gray-500">{key}: </span>
                                  <span className="text-gray-900">{value}</span>
                                </div>
                              ))}
                            </div>
                            
                            <button 
                              onClick={() => handleRemoveItem(item.id)}
                              className="mt-3 text-sm text-gray-500 hover:text-red-500 transition-colors"
                            >
                              Remove item
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 text-right">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>CART TOTALS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatPrice(calculateSubtotal())}</span>
                </div>
                
                <Collapsible open={couponOpen} onOpenChange={setCouponOpen}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto text-gray-600 hover:text-hotspot-primary w-full justify-between"
                    >
                      <span>Add a coupon</span>
                      {couponOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon code"
                        className="flex-1"
                      />
                      <Button variant="outline">Apply</Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold">
                    {calculateShippingCost() === 0 ? 'FREE' : formatPrice(calculateShippingCost())}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500">Free shipping</div>
                
                <Collapsible open={shippingOpen} onOpenChange={setShippingOpen}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto text-gray-600 hover:text-hotspot-primary w-full justify-between"
                    >
                      <span>Delivers to {countries.find(c => c.value === selectedCountry)?.label}</span>
                      {shippingOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Shipping Method</Label>
                      <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                        {shippingMethods.map((method) => (
                          <div key={method.id} className="flex items-center space-x-2 border p-3 rounded-md">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                              <div className="flex justify-between">
                                <span>{method.name}</span>
                                <span>
                                  {method.price === 'FREE' ? 'FREE' : formatPrice(method.price as number)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {method.description} {method.estimatedDelivery && `(${method.estimatedDelivery})`}
                              </p>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
                
                <Button 
                  className="w-full bg-hotspot-primary hover:bg-hotspot-primary/90 text-white"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
