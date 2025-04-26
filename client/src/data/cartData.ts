
export interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  details: {
    [key: string]: string;
  };
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number | 'FREE';
  description: string;
  estimatedDelivery?: string;
}

export const cartItems: Product[] = [
  {
    id: 1,
    name: 'MIDNIGHT MASQUERADE',
    image: 'https://images.unsplash.com/photo-1541904845547-0eaf866de997?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    price: 1649,
    originalPrice: 1849,
    quantity: 1,
    details: {
      'Entry': 'Couple entry',
      'Dinner': 'Unlimited Food'
    }
  }
];

export const shippingMethods: ShippingMethod[] = [
  {
    id: 'free',
    name: 'Free shipping',
    price: 'FREE',
    description: 'Standard delivery',
    estimatedDelivery: '3-5 business days'
  },
  {
    id: 'express',
    name: 'Express shipping',
    price: 249,
    description: 'Fast delivery',
    estimatedDelivery: '1-2 business days'
  }
];

export const countries = [
  { value: 'india', label: 'INDIA' },
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'canada', label: 'Canada' },
  { value: 'australia', label: 'Australia' }
];
