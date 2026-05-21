"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MessageCircle, CreditCard } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { createOrder, getWhatsappCheckoutUrl, markWhatsappSent } from "@/server/actions/checkout";

interface Props {
  iyzicoEnabled: boolean;
  whatsappEnabled: boolean;
  flatRate: number;
  freeThreshold: number;
  /** "email" | "phone" | "phone_or_email" */
  contactMethod?: string;
  requireLogin?: boolean;
  isLoggedIn?: boolean;
  showCompany?: boolean;
  showAddress2?: boolean;
  showShippingPhone?: boolean;
  showTcNo?: boolean;
  tcNoRequired?: boolean;
}

export function CheckoutForm({
  iyzicoEnabled,
  whatsappEnabled,
  flatRate,
  freeThreshold,
  contactMethod = "email",
  requireLogin = false,
  isLoggedIn = false,
  showCompany = false,
  showAddress2 = true,
  showShippingPhone = true,
  showTcNo = false,
  tcNoRequired = false,
}: Props) {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<"WHATSAPP" | "IYZICO">(
    whatsappEnabled ? "WHATSAPP" : "IYZICO",
  );

  const shipping = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : flatRate;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="mb-6" style={{ color: "var(--kt-muted)" }}>Sepetiniz boş.</p>
        <Link href="/urunler" className="underline" style={{ color: "var(--kt-primary)" }}>Alışverişe başla</Link>
      </div>
    );
  }

  if (requireLogin && !isLoggedIn) {
    return (
      <div className="text-center py-20">
        <p className="mb-4" style={{ color: "var(--kt-muted)" }}>Sipariş vermek için giriş yapmalısınız.</p>
        <Link
          href={`/hesabim/giris?redirect=/odeme`}
          className="inline-block px-6 py-3 text-white rounded-md font-medium transition"
          style={{ backgroundColor: "var(--kt-primary)" }}
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  if (!iyzicoEnabled && !whatsappEnabled) {
    return (
      <div className="text-center py-20" style={{ color: "var(--kt-muted)" }}>
        Şu an sipariş alınmıyor. Lütfen daha sonra tekrar deneyin.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    try {
      const order = await createOrder({
        customerName: String(fd.get("customerName") ?? ""),
        customerEmail: String(fd.get("customerEmail") ?? ""),
        customerPhone: String(fd.get("customerPhone") ?? ""),
        shippingLine1: String(fd.get("shippingLine1") ?? ""),
        shippingLine2: String(fd.get("shippingLine2") ?? ""),
        shippingPhone: String(fd.get("shippingPhone") ?? ""),
        shippingDistrict: String(fd.get("shippingDistrict") ?? ""),
        shippingCity: String(fd.get("shippingCity") ?? ""),
        shippingPostalCode: String(fd.get("shippingPostalCode") ?? ""),
        customerNote: String(fd.get("customerNote") ?? ""),
        channel,
        items: items.map((it) => ({
          productId: it.productId,
          variantId: it.variantId ?? null,
          quantity: it.quantity,
        })),
      });

      if (channel === "WHATSAPP") {
        const url = await getWhatsappCheckoutUrl(order.publicToken);
        if (url) {
          await markWhatsappSent(order.publicToken);
          clear();
          window.open(url, "_blank");
          router.push(`/siparis/${order.publicToken}`);
        }
      } else {
        // iyzico flow — call API to initialize
        const res = await fetch("/api/checkout/iyzico", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        });
        const data = await res.json();
        if (data.paymentPageUrl) {
          clear();
          window.location.href = data.paymentPageUrl;
        } else {
          setError(data.error ?? "Ödeme başlatılamadı");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sipariş oluşturulamadı");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
      <div className="space-y-8">
        <section>
          <h2 className="font-display text-xl mb-4" style={{ color: "var(--kt-heading)" }}>İletişim</h2>
          <div className="space-y-3">
            <input
              name="customerName"
              required
              placeholder="Ad Soyad"
              className="w-full h-11 px-3 rounded-md text-sm"
              style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
            />
            {showCompany ? (
              <input
                name="companyName"
                placeholder="Şirket Adı (opsiyonel)"
                className="w-full h-11 px-3 rounded-md text-sm"
                style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
              />
            ) : null}
            <div
              className={`grid grid-cols-1 gap-3 ${contactMethod === "phone_or_email" ? "sm:grid-cols-2" : ""}`}
            >
              {contactMethod === "email" || contactMethod === "phone_or_email" ? (
                <input
                  name="customerEmail"
                  type="email"
                  required={contactMethod === "email"}
                  placeholder={contactMethod === "email" ? "E-posta" : "E-posta (opsiyonel)"}
                  className="h-11 px-3 rounded-md text-sm"
                  style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
                />
              ) : null}
              {contactMethod === "phone" || contactMethod === "phone_or_email" ? (
                <input
                  name="customerPhone"
                  type="tel"
                  required={contactMethod === "phone"}
                  placeholder={contactMethod === "phone" ? "Telefon" : "Telefon (opsiyonel)"}
                  className="h-11 px-3 rounded-md text-sm"
                  style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
                />
              ) : null}
            </div>
            {showTcNo ? (
              <input
                name="tcNo"
                required={tcNoRequired}
                placeholder={tcNoRequired ? "TC Kimlik No" : "TC Kimlik No (opsiyonel)"}
                maxLength={11}
                className="w-full h-11 px-3 rounded-md text-sm"
                style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
              />
            ) : null}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl mb-4" style={{ color: "var(--kt-heading)" }}>Teslimat Adresi</h2>
          <div className="space-y-3">
            {showShippingPhone ? (
              <input
                name="shippingPhone"
                type="tel"
                placeholder="Telefon (kargo için)"
                className="w-full h-11 px-3 rounded-md text-sm"
                style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
              />
            ) : null}
            <input
              name="shippingLine1"
              required
              placeholder="Mahalle, sokak, bina no"
              className="w-full h-11 px-3 rounded-md text-sm"
              style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
            />
            {showAddress2 ? (
              <input
                name="shippingLine2"
                placeholder="Daire, kat, ek bilgi"
                className="w-full h-11 px-3 rounded-md text-sm"
                style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
              />
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                name="shippingDistrict"
                placeholder="İlçe"
                className="h-11 px-3 rounded-md text-sm"
                style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
              />
              <input
                name="shippingCity"
                required
                placeholder="Şehir"
                className="h-11 px-3 rounded-md text-sm"
                style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
              />
              <input
                name="shippingPostalCode"
                placeholder="Posta Kodu"
                className="h-11 px-3 rounded-md text-sm"
                style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
              />
            </div>
            <textarea
              name="customerNote"
              placeholder="Sipariş notu (opsiyonel)"
              rows={3}
              className="w-full px-3 py-2 rounded-md text-sm"
              style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
            />
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl mb-4" style={{ color: "var(--kt-heading)" }}>Ödeme Yöntemi</h2>
          <div className="space-y-3">
            {whatsappEnabled ? (
              <label
                className="flex gap-3 p-4 rounded-md border cursor-pointer transition"
                style={{
                  borderColor: channel === "WHATSAPP" ? "var(--kt-primary)" : "var(--kt-border)",
                  backgroundColor: channel === "WHATSAPP" ? "var(--kt-surface)" : "var(--kt-surface)",
                }}
              >
                <input
                  type="radio"
                  name="paymentChannel"
                  checked={channel === "WHATSAPP"}
                  onChange={() => setChannel("WHATSAPP")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium" style={{ color: "var(--kt-heading)" }}>
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    WhatsApp ile Tamamla
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--kt-muted)" }}>
                    Siparişinizi WhatsApp üzerinden iletin. Onay sonrası kargoya hazırlanır.
                  </p>
                </div>
              </label>
            ) : null}
            {iyzicoEnabled ? (
              <label
                className="flex gap-3 p-4 rounded-md border cursor-pointer transition"
                style={{
                  borderColor: channel === "IYZICO" ? "var(--kt-primary)" : "var(--kt-border)",
                  backgroundColor: "var(--kt-surface)",
                }}
              >
                <input
                  type="radio"
                  name="paymentChannel"
                  checked={channel === "IYZICO"}
                  onChange={() => setChannel("IYZICO")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium" style={{ color: "var(--kt-heading)" }}>
                    <CreditCard className="h-4 w-4" style={{ color: "var(--kt-primary)" }} />
                    Kredi Kartı (iyzico)
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--kt-muted)" }}>
                    Güvenli iyzico ödeme sayfasına yönlendirileceksiniz.
                  </p>
                </div>
              </label>
            ) : null}
          </div>
        </section>

        {error ? (
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </div>

      <aside className="rounded-lg p-6 h-fit lg:sticky lg:top-24" style={{ backgroundColor: "var(--kt-surface)", border: "1px solid var(--kt-border)" }}>
        <h2 className="font-display text-xl mb-4" style={{ color: "var(--kt-heading)" }}>Özet</h2>
        <ul className="space-y-2 text-sm mb-4">
          {items.map((it) => (
            <li key={`${it.productId}-${it.variantId ?? ""}`} className="flex justify-between gap-2">
              <span className="truncate" style={{ color: "var(--kt-heading)" }}>{it.name} × {it.quantity}</span>
              <span className="shrink-0" style={{ color: "var(--kt-muted)" }}>{formatPrice(it.unitPrice * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 text-sm border-t pt-3" style={{ borderColor: "var(--kt-border)" }}>
          <div className="flex justify-between">
            <span style={{ color: "var(--kt-muted)" }}>Ara Toplam</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--kt-muted)" }}>Kargo</span>
            <span>{shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}</span>
          </div>
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between font-medium" style={{ borderColor: "var(--kt-border)" }}>
          <span>Toplam</span>
          <span>{formatPrice(total)}</span>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="block mt-6 w-full text-center px-6 py-3 disabled:opacity-50 text-white rounded-md font-medium transition"
          style={{ backgroundColor: "var(--kt-primary)" }}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin inline" /> : null}
          {channel === "WHATSAPP" ? "WhatsApp ile Tamamla" : "Ödemeye Geç"}
        </button>
        <p className="text-xs mt-3 text-center" style={{ color: "var(--kt-muted)", opacity: 0.6 }}>
          Siparişi tamamlayarak{" "}
          <Link href="/mesafeli-satis" className="underline">Mesafeli Satış Sözleşmesi</Link>'ni
          ve{" "}
          <Link href="/kvkk" className="underline">KVKK</Link> metnini kabul etmiş sayılırsınız.
        </p>
      </aside>
    </form>
  );
}
