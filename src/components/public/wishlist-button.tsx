"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/server/actions/wishlist";

interface WishlistButtonProps {
  productId: string;
  initialIsFav?: boolean;
  className?: string;
}

export function WishlistButton({ productId, initialIsFav = false, className = "" }: WishlistButtonProps) {
  const [isFav, setIsFav] = useState(initialIsFav);
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    const next = !isFav;
    setIsFav(next);

    startTransition(async () => {
      const result = await toggleWishlist(productId);

      if ("error" in result) {
        if (result.error === "login_required") {
          setIsFav(isFav); // revert
          showToast("Favorilere eklemek için giriş yapın");
        } else {
          setIsFav(isFav); // revert
          showToast("Bir hata oluştu");
        }
        return;
      }

      setIsFav(result.isFav);
    });
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
        className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-sm transition
          ${isPending ? "opacity-60 cursor-wait" : ""}`}
        style={{ color: isFav ? "var(--kt-primary)" : "var(--kt-muted)" }}
      >
        <Heart
          className="h-4 w-4"
          fill={isFav ? "currentColor" : "none"}
          strokeWidth={2}
        />
      </button>

      {toast && (
        <div className="absolute bottom-full right-0 mb-2 z-50 whitespace-nowrap text-white text-xs px-3 py-1.5 rounded shadow-lg pointer-events-none" style={{ backgroundColor: "var(--kt-heading)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
