"use client";

import { useRef, useState } from "react";
import { updateProductStock, updateVariantStock } from "@/server/actions/inventory";

interface StockInputProps {
  productId?: string;
  variantId?: string;
  initialStock: number;
}

export function StockInput({ productId, variantId, initialStock }: StockInputProps) {
  const [value, setValue] = useState(String(initialStock));
  const [saving, setSaving] = useState(false);
  const originalRef = useRef(initialStock);

  async function save() {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) {
      setValue(String(originalRef.current));
      return;
    }
    if (parsed === originalRef.current) return;
    setSaving(true);
    try {
      if (variantId) {
        await updateVariantStock(variantId, parsed);
      } else if (productId) {
        await updateProductStock(productId, parsed);
      }
      originalRef.current = parsed;
    } finally {
      setSaving(false);
    }
  }

  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      disabled={saving}
      className="w-20 h-8 px-2 text-sm text-right rounded border border-cream-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-300 disabled:opacity-50"
    />
  );
}
