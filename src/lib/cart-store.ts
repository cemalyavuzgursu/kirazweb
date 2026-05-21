"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
}

export interface AppliedCoupon {
  code: string;
  type: "PERCENT" | "FIXED" | "FREE_SHIPPING";
  value: number;
}

interface CartState {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  add: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  setQuantity: (productId: string, variantId: string | undefined, qty: number) => void;
  remove: (productId: string, variantId?: string) => void;
  clear: () => void;
  setCoupon: (coupon: AppliedCoupon | null) => void;
  totalQuantity: () => number;
  subtotal: () => number;
  discount: () => number;
  total: () => number;
}

const sameItem = (a: CartItem, productId: string, variantId?: string) =>
  a.productId === productId && (a.variantId ?? null) === (variantId ?? null);

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      add: (item) => {
        const qty = item.quantity ?? 1;
        const existing = get().items.find((it) =>
          sameItem(it, item.productId, item.variantId),
        );
        if (existing) {
          set({
            items: get().items.map((it) =>
              sameItem(it, item.productId, item.variantId)
                ? { ...it, quantity: it.quantity + qty }
                : it,
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: qty }] });
        }
      },
      setQuantity: (productId, variantId, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((it) => !sameItem(it, productId, variantId)) });
          return;
        }
        set({
          items: get().items.map((it) =>
            sameItem(it, productId, variantId) ? { ...it, quantity: qty } : it,
          ),
        });
      },
      remove: (productId, variantId) =>
        set({ items: get().items.filter((it) => !sameItem(it, productId, variantId)) }),
      clear: () => set({ items: [], coupon: null }),
      setCoupon: (coupon) => set({ coupon }),
      totalQuantity: () => get().items.reduce((s, it) => s + it.quantity, 0),
      subtotal: () => get().items.reduce((s, it) => s + it.unitPrice * it.quantity, 0),
      discount: () => {
        const c = get().coupon;
        if (!c) return 0;
        const sub = get().subtotal();
        if (c.type === "PERCENT") return Math.min((sub * c.value) / 100, sub);
        if (c.type === "FIXED") return Math.min(c.value, sub);
        return 0; // FREE_SHIPPING handled at checkout
      },
      total: () => {
        const sub = get().subtotal();
        const disc = get().discount();
        return Math.max(sub - disc, 0);
      },
    }),
    { name: "kiraz-cart" },
  ),
);
