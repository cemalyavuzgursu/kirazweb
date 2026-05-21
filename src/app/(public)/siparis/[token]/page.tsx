import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Package, Truck } from "lucide-react";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await prisma.order.findUnique({ where: { publicToken: token } });
  return buildMetadata({
    title: order ? `Sipariş ${order.orderNumber}` : "Sipariş",
    noindex: true,
    path: `/siparis/${token}`,
  });
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Beklemede",
  AWAITING_PAYMENT: "Ödeme Bekleniyor",
  AWAITING_WHATSAPP: "WhatsApp Onayı Bekleniyor",
  PAID: "Ödendi",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoya Verildi",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  REFUNDED: "İade Edildi",
};

export default async function OrderTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const order = await prisma.order.findUnique({
    where: { publicToken: token },
    include: { items: true },
  });
  if (!order) notFound();

  const shipping = order.shippingAddressJson as Record<string, string>;
  const success = sp.success === "1";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {success || order.status === OrderStatus.PAID ? (
        <div className="mb-8 p-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-xl text-emerald-700 mb-1">Siparişiniz alındı!</h2>
            <p className="text-sm text-emerald-700/80">
              {order.status === OrderStatus.AWAITING_WHATSAPP
                ? "WhatsApp üzerinden iletişime geçtiniz, en kısa sürede sipariş onayını alacaksınız."
                : "Ödemeniz başarıyla alındı. Hazırlık süreci başladı."}
            </p>
          </div>
        </div>
      ) : null}

      <header className="mb-8">
        <p className="text-sm mb-1" style={{ color: "var(--kt-muted)", opacity: 0.6 }}>Sipariş No</p>
        <h1 className="font-display text-3xl mb-2" style={{ color: "var(--kt-heading)" }}>{order.orderNumber}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--kt-muted)" }}>
          <span>{formatDate(order.createdAt, true)}</span>
          <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--kt-surface)" }}>
            {STATUS_LABEL[order.status]}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="font-display text-lg mb-3" style={{ color: "var(--kt-heading)" }}>Ürünler</h2>
          <ul className="rounded-md divide-y" style={{ border: "1px solid var(--kt-border)", borderColor: "var(--kt-border)" }}>
            {order.items.map((it) => (
              <li key={it.id} className="p-3 flex justify-between text-sm">
                <span>{it.name} × {it.quantity}</span>
                <span>{formatPrice(it.lineTotal.toString())}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span style={{ color: "var(--kt-muted)" }}>Ara Toplam</span>
              <span>{formatPrice(order.subtotal.toString())}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--kt-muted)" }}>Kargo</span>
              <span>{Number(order.shippingTotal) === 0 ? "Ücretsiz" : formatPrice(order.shippingTotal.toString())}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t" style={{ borderColor: "var(--kt-border)" }}>
              <span>Toplam</span>
              <span>{formatPrice(order.grandTotal.toString())}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg mb-3" style={{ color: "var(--kt-heading)" }}>Teslimat</h2>
          <div className="text-sm space-y-1 rounded-md p-4" style={{ color: "var(--kt-muted)", border: "1px solid var(--kt-border)" }}>
            <p className="font-medium" style={{ color: "var(--kt-heading)" }}>{order.customerName}</p>
            <p>{order.customerPhone}</p>
            {shipping.line1 ? <p>{shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ""}</p> : null}
            <p>
              {[shipping.district, shipping.city, shipping.postalCode].filter(Boolean).join(", ")}
            </p>
          </div>

          {order.trackingNumber ? (
            <div className="mt-4 p-4 rounded-md text-sm" style={{ backgroundColor: "var(--kt-surface)", border: "1px solid var(--kt-border)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Truck className="h-4 w-4" style={{ color: "var(--kt-primary)" }} />
                <span className="font-medium">Kargo Takip</span>
              </div>
              <p style={{ color: "var(--kt-muted)" }}>
                {order.trackingCarrier} · {order.trackingNumber}
              </p>
            </div>
          ) : null}

          {order.status === OrderStatus.AWAITING_WHATSAPP ? (
            <div className="mt-4 p-4 rounded-md bg-emerald-50 border border-emerald-200 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-emerald-700">WhatsApp ile takipte</span>
              </div>
              <p className="text-emerald-700/80">
                Siparişinizin hazırlığı için WhatsApp üzerinden iletişimde olacağız.
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <div className="mt-10 text-center">
        <Link href="/" className="underline text-sm" style={{ color: "var(--kt-primary)" }}>
          Alışverişe devam et
        </Link>
      </div>
    </div>
  );
}
