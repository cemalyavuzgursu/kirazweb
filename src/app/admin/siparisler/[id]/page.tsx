import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, MessageCircle, Mail, Clock } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateOrder, sendOrderConfirmationEmail } from "@/server/actions/orders";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Beklemede",
  AWAITING_PAYMENT: "Ödeme Bekleniyor",
  AWAITING_WHATSAPP: "WhatsApp Onayı",
  PAID: "Ödendi",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
  REFUNDED: "İade",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const { id } = await params;

  const [order, activityLogs] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: { orderBy: { createdAt: "desc" } } },
    }),
    prisma.activityLog.findMany({
      where: { entity: "Order", entityId: id },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  if (!order) notFound();

  type TimelineEvent = { at: Date; title: string; sub?: string };

  function diffToTitle(diff: Record<string, unknown>): string {
    const parts: string[] = [];
    if (diff.status && typeof diff.status === "string") {
      parts.push(`Durum → ${STATUS_LABELS[diff.status as OrderStatus] ?? diff.status}`);
    }
    if (diff.trackingCarrier || diff.trackingNumber) {
      const c = diff.trackingCarrier ? String(diff.trackingCarrier) : "";
      const n = diff.trackingNumber ? String(diff.trackingNumber) : "";
      parts.push(`Kargo: ${[c, n].filter(Boolean).join(" / ")}`);
    }
    if ("adminNote" in diff) parts.push("Yönetim notu güncellendi");
    return parts.join(" · ") || "Sipariş güncellendi";
  }

  const timeline: TimelineEvent[] = [
    { at: order.createdAt, title: "Sipariş oluşturuldu", sub: order.channel },
    ...activityLogs.map((log) => ({
      at: log.createdAt,
      title: diffToTitle((log.diff ?? {}) as Record<string, unknown>),
      sub: log.user?.name ?? "Sistem",
    })),
  ];

  const shipping = order.shippingAddressJson as Record<string, string>;

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <Link href="/admin/siparisler" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700 mb-4">
        <ArrowLeft className="h-3 w-3" />
        Siparişler
      </Link>
      <PageHeader
        title={order.orderNumber}
        description={`${formatDate(order.createdAt, true)} · ${order.channel}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent>
              <h2 className="font-display text-lg text-ink-700 mb-4">Ürünler</h2>
              <ul className="divide-y divide-cream-100">
                {order.items.map((it) => (
                  <li key={it.id} className="py-3 flex justify-between text-sm">
                    <div>
                      <div className="font-medium text-ink-700">{it.name}</div>
                      {it.sku ? <div className="text-xs text-ink-300">SKU: {it.sku}</div> : null}
                    </div>
                    <div className="text-right">
                      <div>{formatPrice(it.unitPrice.toString())} × {it.quantity}</div>
                      <div className="font-medium">{formatPrice(it.lineTotal.toString())}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-cream-100 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-ink-500">Ara Toplam</span><span>{formatPrice(order.subtotal.toString())}</span></div>
                <div className="flex justify-between"><span className="text-ink-500">Kargo</span><span>{formatPrice(order.shippingTotal.toString())}</span></div>
                <div className="flex justify-between font-medium pt-2 border-t border-cream-100"><span>Toplam</span><span>{formatPrice(order.grandTotal.toString())}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-display text-lg text-ink-700 mb-4">Müşteri & Adres</h2>
              <div className="text-sm space-y-1">
                <p className="font-medium text-ink-700">{order.customerName}</p>
                <p className="text-ink-500">{order.customerPhone}</p>
                {order.customerEmail ? <p className="text-ink-500">{order.customerEmail}</p> : null}
                <p className="text-ink-500 mt-3">
                  {shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ""}<br />
                  {[shipping.district, shipping.city, shipping.postalCode].filter(Boolean).join(", ")}
                </p>
              </div>
              {order.customerNote ? (
                <div className="mt-4 p-3 bg-cream-50 rounded text-sm">
                  <span className="text-xs text-ink-300 uppercase block mb-1">Müşteri Notu</span>
                  {order.customerNote}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-display text-lg text-ink-700 mb-4">Sipariş Geçmişi</h2>
              <ol className="relative border-l-2 border-cream-100 ml-2 space-y-5">
                {timeline.map((ev, i) => (
                  <li key={i} className="ml-5">
                    <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-cream-200 ring-4 ring-white">
                      <Clock className="h-2.5 w-2.5 text-ink-400" />
                    </span>
                    <p className="text-sm font-medium text-ink-700 leading-snug">{ev.title}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{formatDate(ev.at, true)}</p>
                    {ev.sub && <p className="text-xs text-ink-300 mt-0.5">{ev.sub}</p>}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {order.payments.length > 0 ? (
            <Card>
              <CardContent>
                <h2 className="font-display text-lg text-ink-700 mb-4">Ödeme Geçmişi</h2>
                <ul className="divide-y divide-cream-100 text-sm">
                  {order.payments.map((p) => (
                    <li key={p.id} className="py-2 flex justify-between">
                      <span>{p.provider} · {p.status}</span>
                      <span>{formatPrice(p.amount.toString())}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent>
              <h2 className="font-display text-lg text-ink-700 mb-4">Durum Güncelle</h2>
              <form action={updateOrder} className="space-y-3">
                <input type="hidden" name="id" value={order.id} />
                <div>
                  <Label htmlFor="status">Durum</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={order.status}
                    className="flex h-10 w-full rounded-md border border-cream-200 bg-white px-3 text-sm"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="trackingCarrier">Kargo Firması</Label>
                  <Input id="trackingCarrier" name="trackingCarrier" defaultValue={order.trackingCarrier ?? ""} />
                </div>
                <div>
                  <Label htmlFor="trackingNumber">Kargo Takip No</Label>
                  <Input id="trackingNumber" name="trackingNumber" defaultValue={order.trackingNumber ?? ""} />
                </div>
                <div>
                  <Label htmlFor="adminNote">Yönetim Notu</Label>
                  <Textarea id="adminNote" name="adminNote" rows={3} defaultValue={order.adminNote ?? ""} />
                </div>
                <Button type="submit" className="w-full">Kaydet</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-display text-lg text-ink-700 mb-4">İletişim</h2>
              <div className="space-y-2">
                {order.customerEmail ? (
                  <form action={async () => { "use server"; await sendOrderConfirmationEmail(order.id); }}>
                    <Button type="submit" variant="outline" className="w-full">
                      <Mail className="h-4 w-4" /> Onay E-postası Gönder
                    </Button>
                  </form>
                ) : null}
                <a
                  href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium transition"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp ile Yaz
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
