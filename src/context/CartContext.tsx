/**
 * CartContext — in-memory shopping cart with localStorage persistence.
 *
 * Items can be predefined pizzas or custom-built pizzas (with a `custom` field).
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import type { CartItem } from '../types';

const STORAGE_KEY = 'sh_cart';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'uid' | 'quantity'> & { quantity?: number }) => void;
  updateQty: (uid: string, delta: number) => void;
  setQty: (uid: string, qty: number) => void;
  removeItem: (uid: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback<CartContextValue['addItem']>(
    (item) => {
      setItems((prev) => {
        // Custom pizzas are always unique; predefined pizzas merge by name.
        if (!item.custom) {
          const existing = prev.find((p) => p.name === item.name && !p.custom);
          if (existing) {
            return prev.map((p) =>
              p.uid === existing.uid
                ? { ...p, quantity: p.quantity + (item.quantity || 1) }
                : p
            );
          }
        }
        return [...prev, { uid: uid(), quantity: item.quantity || 1, ...item }];
      });
    },
    []
  );

  const updateQty = useCallback<CartContextValue['updateQty']>((id, delta) => {
    setItems((prev) =>
      prev
        .map((p) => (p.uid === id ? { ...p, quantity: p.quantity + delta } : p))
        .filter((p) => p.quantity > 0)
    );
  }, []);

  const setQty = useCallback<CartContextValue['setQty']>((id, qty) => {
    setItems((prev) =>
      prev.map((p) => (p.uid === id ? { ...p, quantity: Math.max(1, qty) } : p))
    );
  }, []);

  const removeItem = useCallback<CartContextValue['removeItem']>((id) => {
    setItems((prev) => prev.filter((p) => p.uid !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((n, i) => n + i.unitPrice * i.quantity, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    addItem,
    updateQty,
    setQty,
    removeItem,
    clear,
    count,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
