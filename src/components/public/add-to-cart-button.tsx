"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/lib/cart-store";

interface Props {
  productId: string;
  variantId?: string;
  inStock: boolean;
  price: string;
  name: string;
  slug: string;
  image: string | null;
}

export function AddToCartButton({ productId, variantId, inStock, price, name, slug, image }: Props) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  if (!inStock) {
    return (
      <button
        disabled
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium cursor-not-allowed"
        style={{ backgroundColor: "var(--kt-surface)", color: "var(--kt-muted)", opacity: 0.6 }}
      >
        Stokta Yok
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        add({
          productId,
          variantId,
          name,
          slug,
          image,
          unitPrice: parseFloat(price),
          quantity: 1,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-white font-medium transition"
      style={{ backgroundColor: "var(--kt-primary)" }}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> Sepete Eklendi
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" /> Sepete Ekle
        </>
      )}
    </button>
  );
}
