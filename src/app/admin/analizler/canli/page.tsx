import Link from "next/link";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-cream-100 text-ink-500",
  AWAITING_PAYMENT: "bg-amber-50 text-amber-700",
  AWAITING_WHATSAPP: "bg-emerald-50 text-emerald-700",
  PAID: "bg-emerald-50 text-emerald-700",
  PREPARING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-sky-50 text-sky-700",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-50 text-rose-700",
  REFUNDED: "bg-cream-100 text-ink-500",
};

export default async function CanliPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/analizler/canli";

  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    activeCartCount,
    recentOrders,
    newAccounts,
    todayRevenueAgg,
  ] = await Promise.all([
    prisma.cart.count({
      where: {
        updatedAt: { gte: thirtyMinutesAgo },
        items: { some: {} },
      },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: oneHourAgo } },
      orderBy: { createdAt: "desc" },
      include: { items: { take: 1 } },
    }),
    prisma.customer.findMany({
      where: { createdAt: { gte: twentyFourHoursAgo } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: {
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: todayStart },
      },
    }),
  ]);

  const todayRevenue = Number(todayRevenueAgg._sum.grandTotal ?? 0);

  const liveFeed = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { items: { take: 2 } },
  });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Canlı Görünüm"
        description="Anlık aktivite ve son işlemler"
        action={
          <Link
            href="/admin/analizler/canli"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-ink-700 text-white text-sm hover:bg-ink-800 transition"
          >
            Sayfayı Yenile
          </Link>
        }
      />

      {/* Live Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5">
          <p className="text-xs text-ink-400 uppercase tracking-wider mb-1">Aktif Sepet</p>
          <p className="text-3xl font-semibold text-ink-800">{activeCartCount}</p>
          <p className="text-xs text-ink-300 mt-1">son 30 dakika</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-ink-400 uppercase tracking-wider mb-1">Son 1 Saat Sipariş</p>
          <p className="text-3xl font-semibold text-ink-800">{recentOrders.length}</p>
          <p className="text-xs text-ink-300 mt-1">son 60 dakika</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-ink-400 uppercase tracking-wider mb-1">Yeni Hesap</p>
          <p className="text-3xl font-semibold text-ink-800">{newAccounts.length}</p>
          <p className="text-xs text-ink-300 mt-1">son 24 saat</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-ink-400 uppercase tracking-wider mb-1">Bugünkü Gelir</p>
          <p className="text-2xl font-semibold text-ink-800">{formatPrice(todayRevenue)}</p>
          <p className="text-xs text-ink-300 mt-1">ödendi / kargoda / teslim</p>
        </Card>
      </div>

      {/* Recent Orders in Last Hour */}
      {recentOrders.length > 0 && (
        <Card className="mb-6 p-6">
          <h2 className="font-medium text-ink-700 mb-4">Son 1 Saatteki Siparişler</h2>
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-4 py-2 border-b border-cream-50 last:border-0">
                <div>
                  <span className="font-medium text-sm text-ink-700">{o.orderNumber}</span>
                  <span className="ml-2 text-sm text-ink-500">{o.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[o.status]}`}>
                    {STATUS_LABELS[o.status]}
                  </span>
                  <span className="font-medium text-sm">{formatPrice(o.grandTotal.toString())}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* New Accounts */}
      {newAccounts.length > 0 && (
        <Card className="mb-6 p-6">
          <h2 className="font-medium text-ink-700 mb-4">Son 24 Saatte Oluşturulan Hesaplar</h2>
          <div className="space-y-2">
            {newAccounts.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-cream-50 last:border-0">
                <div>
                  <span className="font-medium text-sm text-ink-700">{c.name}</span>
                  {c.email && <span className="ml-2 text-sm text-ink-400">{c.email}</span>}
                </div>
                <span className="text-xs text-ink-300">{formatDate(c.createdAt, true)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Live Order Feed */}
      <Card className="p-6">
        <h2 className="font-medium text-ink-700 mb-4">Son Siparişler</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-cream-100">
              <tr className="text-left text-xs uppercase tracking-wider text-ink-300">
                <th className="pb-2 pr-4 font-medium">Sipariş No</th>
                <th className="pb-2 pr-4 font-medium">Müşteri</th>
                <th className="pb-2 pr-4 font-medium">Ürün(ler)</th>
                <th className="pb-2 pr-4 font-medium text-right">Tutar</th>
                <th className="pb-2 pr-4 font-medium text-center">Durum</th>
                <th className="pb-2 font-medium">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-50">
              {liveFeed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-300">
                    Henüz sipariş yok.
                  </td>
                </tr>
              ) : (
                liveFeed.map((o) => (
                  <tr key={o.id} className="hover:bg-cream-50/50">
                    <td className="py-3 pr-4 font-medium text-ink-700">{o.orderNumber}</td>
                    <td className="py-3 pr-4">
                      <div className="text-ink-700">{o.customerName}</div>
                      <div className="text-xs text-ink-300">{o.customerPhone}</div>
                    </td>
                    <td className="py-3 pr-4 text-ink-500 text-xs">
                      {o.items.map((it) => it.name).join(", ")}
                      {o.items.length === 2 && "…"}
                    </td>
                    <td className="py-3 pr-4 text-right font-medium">
                      {formatPrice(o.grandTotal.toString())}
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[o.status]}`}>
                        {STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td className="py-3 text-ink-400 text-xs whitespace-nowrap">
                      {formatDate(o.createdAt, true)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}
