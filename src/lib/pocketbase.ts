import PocketBase from 'pocketbase';

// Initialize PocketBase client
export const pb = new PocketBase('http://127.0.0.1:8090');

// Types for our collections
export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'user' | 'admin';
  isSuperuser?: boolean;
  avatar?: string;
  created: string;
  updated: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  image?: string;
  created: string;
  updated: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string; // relation to categories
  stock: number;
  featured: boolean;
  created: string;
  updated: string;
}

export interface CartItem {
  id: string;
  user: string; // relation to users
  product: string; // relation to products
  quantity: number;
  created: string;
  updated: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  city: string;
  postalCode: string;
  address: string;
  notes?: string;
}

export interface Order {
  id: string;
  user: string; // relation to users
  items: string | OrderItem[]; // JSON array of order items (can be string or already parsed)
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingInfo: string | ShippingInfo; // JSON object with shipping details (can be string or already parsed)
  paymentMethod: 'cash' | 'card' | 'online';
  created: string;
  updated: string;
  expand?: {
    user?: User;
  };
}

// Auto-refresh auth token
pb.autoCancellation(false);
