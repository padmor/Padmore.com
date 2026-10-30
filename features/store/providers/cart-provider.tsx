"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type CartItem = { slug: string; title: string; price: number; quantity: number };
type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "padmore-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved) as CartItem[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
    add: (item) => setItems((current) => {
      const found = current.find((entry) => entry.slug === item.slug);
      return found
        ? current.map((entry) => entry.slug === item.slug ? { ...entry, quantity: entry.quantity + 1 } : entry)
        : [...current, { ...item, quantity: 1 }];
    }),
    remove: (slug) => setItems((current) => current.filter((item) => item.slug !== slug)),
    clear: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
