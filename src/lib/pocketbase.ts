import PocketBase from 'pocketbase';

// Initialize PocketBase client
export const pb = new PocketBase('http://127.0.0.1:8090');

// Types for our collections
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
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

export interface Order {
  id: string;
  user: string; // relation to users
  items: string; // JSON array of order items
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created: string;
  updated: string;
}

// Auto-refresh auth token
pb.autoCancellation(false);
