"use client";

import { useState } from "react";
import { AddToCartButton } from "./add-to-cart-button";
import { formatPrice } from "@/lib/utils";

interface Variant {
  id: string;
  name: string;
  price: string | null;
  stock: number;
}

interface ProductPurchaseProps {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  basePrice: string;
  baseStock: number;
  variants: Variant[];
}

export function ProductPurchase({
  productId,
  name,
  slug,
  image,
  basePrice,
  baseStock,
  variants,
}: ProductPurchaseProps) {
  const hasVariants = variants.length > 0;
  const [selectedId, setSelectedId] = useState<string>(hasVariants ? variants[0].id : "");

  const selected = hasVariants ? variants.find((v) => v.id === selectedId) ?? null : null;

  const effectivePrice = selected?.price ?? basePrice;
  const effectiveStock = selected ? selected.stock : baseStock;

  return (
    <div className="flex flex-col gap-3">
      {hasVariants ? (
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const isActive = v.id === selectedId;
            const out = v.stock <= 0;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedId(v.id)}
                disabled={out}
                className="px-4 py-2 rounded-md text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  border: "1px solid var(--kt-border)",
                  borderColor: isActive ? "var(--kt-primary)" : "var(--kt-border)",
                  color: isActive ? "var(--kt-primary)" : "var(--kt-text)",
                  backgroundColor: isActive
                    ? "color-mix(in srgb, var(--kt-primary) 8%, transparent)"
                    : "transparent",
                }}
              >
                {v.name}
                {out ? " (Tükendi)" : ""}
              </button>
            );
          })}
        </div>
      ) : null}

      {hasVariants && selected && selected.price && selected.price !== basePrice ? (
        <p className="text-sm" style={{ color: "var(--kt-heading)" }}>
          Seçili varyant: <strong>{formatPrice(effectivePrice)}</strong>
        </p>
      ) : null}

      <AddToCartButton
        productId={productId}
        variantId={selected?.id}
        inStock={effectiveStock > 0}
        price={effectivePrice}
        name={hasVariants && selected ? `${name} — ${selected.name}` : name}
        image={image}
        slug={slug}
      />
    </div>
  );
}
