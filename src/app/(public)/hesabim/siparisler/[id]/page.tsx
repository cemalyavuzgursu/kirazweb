import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Truck, CheckCircle2, XCircle } from "lucide-react";
import { requireCustomer } from "@/lib/customer-session";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { formatPrice, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

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

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  AWAITING_PAYMENT: "bg-amber-50 text-amber-700",
  AWAITING_WHATSAPP: "bg-emerald-50 text-emerald-700",
  PAID: "bg-emerald-50 text-emerald-700",
  PREPARING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-50 text-rose-700",
  REFUNDED: "bg-rose-50 text-rose-700",
};

const PAST_PAID = new Set<OrderStatus>([
  OrderStatus.PAID,
  OrderStatus.PREPARING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
]);

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCustomer();
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: [
        { customerId: session.customerId },
        ...(session.email ? [{ customerEmail: session.email }] : []),
      ],
    },
    include: { items: true },
  });
  if (!order) notFound();

  const shipping = order.shippingAddressJson as Record<string, string>;
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";

  const steps: { label: string; date: Date | null; done: boolean }[] = [
    { label: "Sipariş Alındı", date: order.createdAt, done: true },
    {
      label: "Ödeme Onaylandı",
      date: order.paidAt,
      done: !!order.paidAt || PAST_PAID.has(order.status),
    },
    {
      label: "Kargoya Verildi",
      date: order.shippedAt,
      done: !!order.shippedAt || order.status === "DELIVERED",
    },
    {
      label: "Teslim Edildi",
      date: order.deliveredAt,
      done: !!order.deliveredAt,
    },
  ];

  return (
    <div>
      <Link
        href="/hesabim/siparisler"
        className="inline-flex items-center gap-1 text-sm mb-6"
        style={{ color: "var(--kt-muted)" }}
      >
        <ArrowLeft className="h-3 w-3" />
        Siparişlerim
      </Link>

      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl" style={{ color: "var(--kt-heading)" }}>{order.orderNumber}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--kt-muted)" }}>{formatDate(order.createdAt, true)}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${STATUS_COLOR[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {isCancelled ? (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-rose-700">{STATUS_LABEL[order.status]}</p>
            {order.cancelledAt && (
              <p className="text-xs text-rose-500 mt-0.5">{formatDate(order.cancelledAt, true)}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg p-5 mb-6" style={{ border: "1px solid var(--kt-border)" }}>
          <h2 className="text-xs font-medium uppercase tracking-wider mb-5" style={{ color: "var(--kt-muted)" }}>
            Sipariş Durumu
          </h2>
          <div className="flex items-start">
            {steps.map((step, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="flex items-center w-full">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      step.done ? "bg-emerald-500" : ""
                    }`}
                    style={!step.done ? { backgroundColor: "var(--kt-surface)" } : undefined}
                  >
                    {step.done ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 ${steps[i + 1].done ? "bg-emerald-500" : ""}`}
                      style={!steps[i + 1].done ? { backgroundColor: "var(--kt-border)" } : undefined}
                    />
                  )}
                </div>
                <div className="mt-2 text-center w-full px-0.5">
                  <p
                    className="text-xs font-medium leading-tight"
                    style={{ color: step.done ? "var(--kt-heading)" : "var(--kt-muted)", opacity: step.done ? 1 : 0.6 }}
                  >
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-xs mt-0.5 leading-tight" style={{ color: "var(--kt-muted)" }}>
                      {formatDate(step.date, false)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {order.trackingNumber && (
        <div className="rounded-lg p-4 mb-6 flex items-center gap-3" style={{ border: "1px solid var(--kt-border)" }}>
          <Truck className="h-5 w-5 shrink-0" style={{ color: "var(--kt-primary)" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--kt-heading)" }}>Kargo Takip</p>
            <p className="text-sm mt-0.5" style={{ color: "var(--kt-muted)" }}>
              {order.trackingCarrier} ·{" "}
              <span className="font-mono">{order.trackingNumber}</span>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-lg p-5" style={{ border: "1px solid var(--kt-border)" }}>
          <h2 className="font-display text-base mb-3" style={{ color: "var(--kt-heading)" }}>Ürünler</h2>
          <ul className="divide-y" style={{ borderColor: "var(--kt-border)" }}>
            {order.items.map((it) => (
              <li key={it.id} className="py-2.5 flex justify-between gap-3 text-sm">
                <div>
                  <p style={{ color: "var(--kt-heading)" }}>{it.name}</p>
                  <p className="text-xs" style={{ color: "var(--kt-muted)" }}>× {it.quantity}</p>
                </div>
                <p className="font-medium shrink-0">{formatPrice(it.lineTotal.toString())}</p>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t space-y-1 text-sm" style={{ borderColor: "var(--kt-border)" }}>
            <div className="flex justify-between" style={{ color: "var(--kt-muted)" }}>
              <span>Ara Toplam</span>
              <span>{formatPrice(order.subtotal.toString())}</span>
            </div>
            {Number(order.discountTotal) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>İndirim</span>
                <span>−{formatPrice(order.discountTotal.toString())}</span>
              </div>
            )}
            <div className="flex justify-between" style={{ color: "var(--kt-muted)" }}>
              <span>Kargo</span>
              <span>
                {Number(order.shippingTotal) === 0
                  ? "Ücretsiz"
                  : formatPrice(order.shippingTotal.toString())}
              </span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t" style={{ borderColor: "var(--kt-border)", color: "var(--kt-heading)" }}>
              <span>Toplam</span>
              <span>{formatPrice(order.grandTotal.toString())}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg p-5" style={{ border: "1px solid var(--kt-border)" }}>
          <h2 className="font-display text-base mb-3" style={{ color: "var(--kt-heading)" }}>Teslimat Adresi</h2>
          <div className="text-sm space-y-1" style={{ color: "var(--kt-muted)" }}>
            <p className="font-medium" style={{ color: "var(--kt-heading)" }}>{order.customerName}</p>
            <p>{order.customerPhone}</p>
            {shipping.line1 && (
              <p className="mt-2">
                {shipping.line1}
                {shipping.line2 ? `, ${shipping.line2}` : ""}
              </p>
            )}
            <p>
              {[shipping.district, shipping.city, shipping.postalCode]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
          {order.customerNote && (
            <div className="mt-4 p-3 rounded text-sm" style={{ backgroundColor: "var(--kt-surface)" }}>
              <span className="text-xs uppercase block mb-1" style={{ color: "var(--kt-muted)", opacity: 0.6 }}>Notunuz</span>
              {order.customerNote}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
