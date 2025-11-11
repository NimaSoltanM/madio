import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { pb } from './pocketbase';
import type { Product } from './pocketbase';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'madio_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage or PocketBase on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const user = pb.authStore.record;

        if (user) {
          // User is logged in - load from PocketBase
          try {
            const cartItems = await pb.collection('cart_items').getFullList({
              filter: `user = "${user.id}"`,
              expand: 'product',
            });

            const loadedItems: CartItem[] = cartItems.map((item: any) => ({
              product: item.expand.product,
              quantity: item.quantity,
            }));

            // Check if there's a guest cart in localStorage
            const guestCart = localStorage.getItem(CART_STORAGE_KEY);
            if (guestCart) {
              const guestItems: CartItem[] = JSON.parse(guestCart);

              // Merge guest cart with user cart
              const mergedItems = [...loadedItems];
              for (const guestItem of guestItems) {
                const existingIndex = mergedItems.findIndex(
                  (item) => item.product.id === guestItem.product.id
                );

                if (existingIndex >= 0) {
                  // Item exists, combine quantities
                  mergedItems[existingIndex].quantity = Math.min(
                    mergedItems[existingIndex].quantity + guestItem.quantity,
                    guestItem.product.stock
                  );
                } else {
                  // New item, add it
                  mergedItems.push(guestItem);
                }
              }

              // Save merged cart to PocketBase
              for (const item of mergedItems) {
                const existingDbItem = cartItems.find(
                  (dbItem: any) => dbItem.expand.product.id === item.product.id
                );

                if (existingDbItem) {
                  // Update existing
                  await pb.collection('cart_items').update(existingDbItem.id, {
                    quantity: item.quantity,
                  });
                } else {
                  // Create new
                  await pb.collection('cart_items').create({
                    user: user.id,
                    product: item.product.id,
                    quantity: item.quantity,
                  });
                }
              }

              // Clear guest cart
              localStorage.removeItem(CART_STORAGE_KEY);
              setItems(mergedItems);
            } else {
              setItems(loadedItems);
            }
          } catch (error) {
            console.error('Error loading cart from database:', error);
            // Fallback to localStorage
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
              setItems(JSON.parse(savedCart));
            }
          }
        } else {
          // Guest user - load from localStorage
          const savedCart = localStorage.getItem(CART_STORAGE_KEY);
          if (savedCart) {
            setItems(JSON.parse(savedCart));
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage (for guests) or PocketBase (for authenticated users)
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load

    const saveCart = async () => {
      try {
        const user = pb.authStore.record;

        if (user) {
          // Save to PocketBase for authenticated users
          // We'll handle this in individual functions (addToCart, etc.)
        } else {
          // Save to localStorage for guests
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        }
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };

    saveCart();
  }, [items, isLoading]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    const existingItem = items.find((item) => item.product.id === product.id);

    const newItems = existingItem
      ? items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        )
      : [...items, { product, quantity: Math.min(quantity, product.stock) }];

    setItems(newItems);

    // Save to PocketBase if user is logged in
    const user = pb.authStore.record;
    if (user) {
      try {
        if (existingItem) {
          // Update existing item in database
          const dbItem = await pb.collection('cart_items').getFirstListItem(
            `user = "${user.id}" && product = "${product.id}"`
          );
          const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
          await pb.collection('cart_items').update(dbItem.id, {
            quantity: newQuantity,
          });
        } else {
          // Create new item in database
          await pb.collection('cart_items').create({
            user: user.id,
            product: product.id,
            quantity: Math.min(quantity, product.stock),
          });
        }
      } catch (error) {
        console.error('Error saving to database:', error);
      }
    } else {
      // Save to localStorage for guests
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    }
  };

  const removeFromCart = async (productId: string) => {
    const newItems = items.filter((item) => item.product.id !== productId);
    setItems(newItems);

    const user = pb.authStore.record;
    if (user) {
      try {
        const dbItem = await pb.collection('cart_items').getFirstListItem(
          `user = "${user.id}" && product = "${productId}"`
        );
        await pb.collection('cart_items').delete(dbItem.id);
      } catch (error) {
        console.error('Error removing from database:', error);
      }
    } else {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newItems = items.map((item) =>
      item.product.id === productId
        ? { ...item, quantity: Math.min(quantity, item.product.stock) }
        : item
    );

    setItems(newItems);

    const user = pb.authStore.record;
    if (user) {
      try {
        const dbItem = await pb.collection('cart_items').getFirstListItem(
          `user = "${user.id}" && product = "${productId}"`
        );
        await pb.collection('cart_items').update(dbItem.id, { quantity });
      } catch (error) {
        console.error('Error updating database:', error);
      }
    } else {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    }
  };

  const clearCart = async () => {
    setItems([]);

    const user = pb.authStore.record;
    if (user) {
      try {
        const cartItems = await pb.collection('cart_items').getFullList({
          filter: `user = "${user.id}"`,
        });
        for (const item of cartItems) {
          await pb.collection('cart_items').delete(item.id);
        }
      } catch (error) {
        console.error('Error clearing database cart:', error);
      }
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  };

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
