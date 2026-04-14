"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: string; product_id: string; name: string; price: number;
  mrp: number | null; image: string | null; color: string | null; quantity: number;
}
interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
  syncAdd: ((product_id: string, quantity: number) => Promise<void>) | null;
  setSyncFn: (fn: (product_id: string, quantity: number) => Promise<void>) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      syncAdd: null,
      setSyncFn: (fn) => set({ syncAdd: fn }),
      addItem: (item) => {
        const existing = get().items.find(i => i.product_id === item.product_id);
        const newQty = existing ? existing.quantity + 1 : 1;
        if (existing) {
          set(state => ({ items: state.items.map(i => i.product_id === item.product_id ? { ...i, quantity: newQty } : i) }));
        } else {
          set(state => ({ items: [...state.items, { ...item, quantity: 1 }] }));
        }
        get().syncAdd?.(item.product_id, newQty);
      },
      removeItem: (id) => {
        const item = get().items.find(i => i.id === id);
        if (item) get().syncAdd?.(item.product_id, 0);
        set(state => ({ items: state.items.filter(i => i.id !== id) }));
      },
      updateQty: (id, qty) => {
        if (qty <= 0) { get().removeItem(id); return; }
        const item = get().items.find(i => i.id === id);
        if (item) get().syncAdd?.(item.product_id, qty);
        set(state => ({ items: state.items.map(i => i.id === id ? { ...i, quantity: qty } : i) }));
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "zarika-cart", partialize: (state) => ({ items: state.items }) }
  )
);
