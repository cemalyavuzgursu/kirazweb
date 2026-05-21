import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const PAID_STATUSES: OrderStatus[] = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"];

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin";

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    productCount,
    orderCount,
    customerCount,
    recentOrders,
    lowStock,
    todayRevenue,
    monthRevenue,
    totalRevenue,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.customer.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        grandTotal: true,
        status: true,
        channel: true,
        createdAt: true,
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { stock: "asc" },
      take: 5,
      select: { id: true, name: true, stock: true, lowStockThreshold: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: PAID_STATUSES },
        createdAt: { gte: todayStart },
      },
      _sum: { grandTotal: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: PAID_STATUSES },
        createdAt: { gte: monthStart },
      },
      _sum: { grandTotal: true },
    }),
    prisma.order.aggregate({
      where: { status: { in: PAID_STATUSES } },
      _sum: { grandTotal: true },
      _count: { _all: true },
    }),
  ]);

  const totalRevenueAmount = Number(totalRevenue._sum?.grandTotal ?? 0);
  const totalPaidCount = totalRevenue._count._all;
  const avgOrderValue = totalPaidCount > 0 ? totalRevenueAmount / totalPaidCount : 0;

  return (
    <AdminShell userName={session.user.name ?? session.user.email ?? "Yönetici"} pathname={pathname}>
      <PageHeader title="Panel" description="Genel bakış ve son hareketler" />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Stat label="Aktif Ürün" value={productCount} />
        <Stat label="Toplam Sipariş" value={orderCount} />
        <Stat label="Müşteri" value={customerCount} />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <RevenueStat
          label="Bugünkü Gelir"
          value={Number(todayRevenue._sum?.grandTotal ?? 0)}
        />
        <RevenueStat
          label="Bu Ayki Gelir"
          value={Number(monthRevenue._sum?.grandTotal ?? 0)}
        />
        <RevenueStat label="Toplam Gelir" value={totalRevenueAmount} />
        <RevenueStat label="Ort. Sipariş Değeri" value={avgOrderValue} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h2 className="font-display text-xl text-ink-700 mb-4">Son Siparişler</h2>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-ink-300">Henüz sipariş yok.</p>
            ) : (
              <ul className="divide-y divide-cream-100">
                {recentOrders.map((o) => (
                  <li key={o.id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-ink-700">{o.orderNumber}</div>
                      <div className="text-ink-300 text-xs">
                        {o.customerName} · {formatDate(o.createdAt, true)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(o.grandTotal.toString())}</div>
                      <div className="text-xs text-ink-300">{o.status}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="font-display text-xl text-ink-700 mb-4">Düşük Stok</h2>
            {lowStock.length === 0 ? (
              <p className="text-sm text-ink-300">Stok bilgisi yok.</p>
            ) : (
              <ul className="divide-y divide-cream-100">
                {lowStock.map((p) => (
                  <li key={p.id} className="py-3 flex items-center justify-between text-sm">
                    <span className="text-ink-700">{p.name}</span>
                    <span
                      className={
                        p.stock <= p.lowStockThreshold
                          ? "text-rose-600 font-medium"
                          : "text-ink-300"
                      }
                    >
                      {p.stock} adet
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent>
        <div className="text-xs uppercase tracking-wider text-ink-300 mb-2">{label}</div>
        <div className="font-display text-3xl text-ink-700">{value}</div>
      </CardContent>
    </Card>
  );
}

function RevenueStat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent>
        <div className="text-xs uppercase tracking-wider text-ink-300 mb-2">{label}</div>
        <div className="font-display text-2xl text-ink-700">{formatPrice(value)}</div>
      </CardContent>
    </Card>
  );
}
