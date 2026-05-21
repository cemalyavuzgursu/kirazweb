"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toggleWishlist } from "@/server/actions/wishlist";

export function RemoveFromWishlistButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await toggleWishlist(productId);
    });
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      aria-label="Favorilerden çıkar"
      className={`absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-sm transition
        ${isPending ? "opacity-50 cursor-wait" : ""}`}
      style={{ color: "var(--kt-muted)" }}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
