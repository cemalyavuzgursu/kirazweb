"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, Tag, X, Loader2 } from "lucide-react";
import { useCart, type AppliedCoupon } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

function CouponField() {
  const coupon = useCart((s) => s.coupon);
  const setCoupon = useCart((s) => s.setCoupon);
  const subtotal = useCart((s) => s.subtotal);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/coupon?code=${encodeURIComponent(trimmed)}`);
      const data = await res.json() as { error?: string; code?: string; type?: string; value?: number; minSubtotal?: number | null };
      if (!res.ok || data.error) {
        setError(data.error ?? "Geçersiz kupon");
        return;
      }
      if (data.minSubtotal && subtotal() < data.minSubtotal) {
        setError(`Bu kupon için minimum ${formatPrice(data.minSubtotal)} sepet tutarı gerekli`);
        return;
      }
      setCoupon({
        code: data.code!,
        type: data.type as AppliedCoupon["type"],
        value: data.value!,
      });
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  if (coupon) {
    return (
      <div className="flex items-center justify-between text-sm bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
        <div className="flex items-center gap-2 text-emerald-700">
          <Tag className="h-4 w-4" />
          <span className="font-medium">{coupon.code}</span>
          <span className="text-emerald-600">
            {coupon.type === "PERCENT" ? `%${coupon.value} indirim` :
             coupon.type === "FIXED" ? `${formatPrice(coupon.value)} indirim` :
             "Ücretsiz kargo"}
          </span>
        </div>
        <button
          onClick={() => setCoupon(null)}
          className="text-emerald-400 hover:text-emerald-700 transition"
          aria-label="Kuponu kaldır"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder="Kupon kodu"
          className="flex-1 h-9 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
          style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)", color: "var(--kt-text)" }}
        />
        <button
          onClick={apply}
          disabled={loading || !code.trim()}
          className="h-9 px-3 rounded-md text-sm font-medium transition disabled:opacity-50 flex items-center gap-1"
          style={{ backgroundColor: "var(--kt-primary)", color: "var(--kt-btn-text, #fff)" }}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Uygula
        </button>
      </div>
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
}

export function CartView() {
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal);
  const discount = useCart((s) => s.discount);
  const total = useCart((s) => s.total);
  const coupon = useCart((s) => s.coupon);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--kt-muted)" }} />
        <p className="mb-6" style={{ color: "var(--kt-muted)" }}>Sepetiniz şu an boş.</p>
        <Link
          href="/urunler"
          className="inline-block px-6 py-3 rounded-md font-medium transition"
          style={{ backgroundColor: "var(--kt-primary)", color: "var(--kt-btn-text, #fff)" }}
        >
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  const discountAmount = discount();
  const freeShipping = coupon?.type === "FREE_SHIPPING";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
      <ul className="divide-y" style={{ borderTop: "1px solid var(--kt-border)", borderBottom: "1px solid var(--kt-border)" }}>
        {items.map((it) => (
          <li key={`${it.productId}-${it.variantId ?? ""}`} className="py-5 flex gap-4" style={{ borderColor: "var(--kt-border)" }}>
            <Link
              href={`/urunler/${it.slug}`}
              className="relative h-24 w-24 rounded-md overflow-hidden shrink-0"
              style={{ backgroundColor: "var(--kt-card-img-bg)" }}
            >
              {it.image ? (
                <Image src={it.image} alt={it.name} fill sizes="96px" className="object-cover" />
              ) : null}
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/urunler/${it.slug}`} className="font-medium hover:underline" style={{ color: "var(--kt-text)" }}>
                {it.name}
              </Link>
              <div className="text-sm mt-1" style={{ color: "var(--kt-muted)" }}>{formatPrice(it.unitPrice)}</div>

              <div className="flex items-center gap-3 mt-3">
                <div className="inline-flex items-center rounded-md" style={{ border: "1px solid var(--kt-border)" }}>
                  <button
                    onClick={() => setQuantity(it.productId, it.variantId, it.quantity - 1)}
                    className="p-2"
                    style={{ color: "var(--kt-muted)" }}
                    aria-label="Azalt"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-3 text-sm w-10 text-center" style={{ color: "var(--kt-text)" }}>{it.quantity}</span>
                  <button
                    onClick={() => setQuantity(it.productId, it.variantId, it.quantity + 1)}
                    className="p-2"
                    style={{ color: "var(--kt-muted)" }}
                    aria-label="Arttır"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button
                  onClick={() => remove(it.productId, it.variantId)}
                  className="hover:text-rose-600"
                  style={{ color: "var(--kt-muted)" }}
                  aria-label="Kaldır"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-medium" style={{ color: "var(--kt-heading)" }}>{formatPrice(it.unitPrice * it.quantity)}</div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="rounded-lg p-6 h-fit lg:sticky lg:top-24 space-y-4" style={{ backgroundColor: "var(--kt-surface)", border: "1px solid var(--kt-border)" }}>
        <h2 className="font-display text-xl" style={{ color: "var(--kt-heading)" }}>Sipariş Özeti</h2>

        {/* Coupon input */}
        <CouponField />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: "var(--kt-muted)" }}>Ara Toplam</span>
            <span style={{ color: "var(--kt-heading)" }}>{formatPrice(subtotal())}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>İndirim</span>
              <span>−{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span style={{ color: "var(--kt-muted)" }}>Kargo</span>
            <span className={freeShipping ? "text-emerald-600 font-medium" : ""} style={!freeShipping ? { color: "var(--kt-muted)" } : undefined}>
              {freeShipping ? "Ücretsiz" : "Sonraki adımda"}
            </span>
          </div>
        </div>

        <div className="pt-4 flex justify-between text-base font-medium" style={{ borderTop: "1px solid var(--kt-border)", color: "var(--kt-heading)" }}>
          <span>Toplam</span>
          <span>{formatPrice(total())}</span>
        </div>

        <Link
          href="/odeme"
          className="block w-full text-center px-6 py-3 rounded-md font-medium transition"
          style={{ backgroundColor: "var(--kt-primary)", color: "var(--kt-btn-text, #fff)" }}
        >
          Siparişi Tamamla
        </Link>
        <Link
          href="/urunler"
          className="block w-full text-center px-6 py-3 rounded-md text-sm transition"
          style={{ border: "1px solid var(--kt-border)", color: "var(--kt-text)" }}
        >
          Alışverişe Devam Et
        </Link>
      </aside>
    </div>
  );
}
