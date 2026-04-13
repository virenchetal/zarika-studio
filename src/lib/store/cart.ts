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
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find(i => i.product_id === item.product_id);
        if (existing) {
          set(state => ({ items: state.items.map(i => i.product_id === item.product_id ? { ...i, quantity: i.quantity + 1 } : i) }));
        } else {
          set(state => ({ items: [...state.items, { ...item, quantity: 1 }] }));
        }
      },
      removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) })),
      updateQty: (id, qty) => {
        if (qty <= 0) { get().removeItem(id); return; }
        set(state => ({ items: state.items.map(i => i.id === id ? { ...i, quantity: qty } : i) }));
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "zarika-cart" }
  )
);
