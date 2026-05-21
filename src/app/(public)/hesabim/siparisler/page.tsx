import Link from "next/link";
import { Package } from "lucide-react";
import { requireCustomer } from "@/lib/customer-session";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";

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
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  REFUNDED: "bg-rose-50 text-rose-700",
};

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const session = await requireCustomer();

  const orders = await prisma.order.findMany({
    where: { customerId: session.customerId },
    include: { items: { take: 3 } },
    orderBy: { createdAt: "desc" },
  });

  // Also find orders by email (guest orders before account creation)
  const emailOrders = session.email
    ? await prisma.order.findMany({
        where: { customerEmail: session.email, customerId: null },
        include: { items: { take: 3 } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const allOrders = [...orders, ...emailOrders].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  if (allOrders.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl mb-6" style={{ color: "var(--kt-heading)" }}>Siparişlerim</h1>
        <div className="text-center py-16 rounded-lg" style={{ border: "1px solid var(--kt-border)" }}>
          <Package className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--kt-muted)", opacity: 0.4 }} />
          <p className="mb-4" style={{ color: "var(--kt-muted)" }}>Henüz siparişiniz bulunmuyor.</p>
          <Link href="/urunler" className="text-sm" style={{ color: "var(--kt-primary)" }}>Alışverişe Başla</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl mb-6" style={{ color: "var(--kt-heading)" }}>Siparişlerim</h1>
      <div className="space-y-3">
        {allOrders.map((order) => (
          <Link
            key={order.id}
            href={`/hesabim/siparisler/${order.id}`}
            className="block rounded-lg p-4 hover:shadow-sm transition"
            style={{ border: "1px solid var(--kt-border)" }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-medium" style={{ color: "var(--kt-heading)" }}>{order.orderNumber}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--kt-muted)" }}>{formatDate(order.createdAt, true)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${STATUS_COLOR[order.status]}`}>
                  {STATUS_LABEL[order.status]}
                </span>
                <span className="font-medium whitespace-nowrap" style={{ color: "var(--kt-heading)" }}>{formatPrice(order.grandTotal.toString())}</span>
              </div>
            </div>

            <p className="text-xs mb-3" style={{ color: "var(--kt-muted)" }}>
              {order.items.map((it) => `${it.name} × ${it.quantity}`).join(", ")}
              {order.items.length === 3 ? " …" : ""}
            </p>

            <span className="text-xs" style={{ color: "var(--kt-primary)" }}>Detayları Görüntüle →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
