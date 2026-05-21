import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";

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

const STATUS_BAR_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-ink-200",
  AWAITING_PAYMENT: "bg-amber-400",
  AWAITING_WHATSAPP: "bg-emerald-400",
  PAID: "bg-emerald-500",
  PREPARING: "bg-blue-400",
  SHIPPED: "bg-sky-500",
  DELIVERED: "bg-emerald-600",
  CANCELLED: "bg-rose-400",
  REFUNDED: "bg-ink-300",
};

type Period = "7d" | "30d" | "90d" | "year";

function getDateRange(period: Period): { startDate: Date; prevStartDate: Date; prevEndDate: Date } {
  const now = new Date();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevEndDate = new Date(startDate.getTime());
  const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);
  return { startDate, prevStartDate, prevEndDate };
}

function pctChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "—";
  const diff = ((current - previous) / previous) * 100;
  return (diff >= 0 ? "+" : "") + diff.toFixed(1) + "%";
}

function isPositive(current: number, previous: number): boolean {
  return current >= previous;
}

export default async function RaporlarPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/analizler/raporlar";

  const sp = await searchParams;
  const rawPeriod = sp.period ?? "30d";
  const period: Period = ["7d", "30d", "90d", "year"].includes(rawPeriod)
    ? (rawPeriod as Period)
    : "30d";

  const { startDate, prevStartDate, prevEndDate } = getDateRange(period);
  const useWeekly = period === "90d" || period === "year";

  const revenueStatuses: OrderStatus[] = ["PAID", "SHIPPED", "DELIVERED"];

  const [
    revenueAgg,
    prevRevenueAgg,
    orderCount,
    prevOrderCount,
    newCustomers,
    prevNewCustomers,
    statusDist,
    topProducts,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { status: { in: revenueStatuses }, createdAt: { gte: startDate } },
    }),
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { status: { in: revenueStatuses }, createdAt: { gte: prevStartDate, lt: prevEndDate } },
    }),
    prisma.order.count({ where: { createdAt: { gte: startDate } } }),
    prisma.order.count({ where: { createdAt: { gte: prevStartDate, lt: prevEndDate } } }),
    prisma.customer.count({ where: { createdAt: { gte: startDate } } }),
    prisma.customer.count({ where: { createdAt: { gte: prevStartDate, lt: prevEndDate } } }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: { createdAt: { gte: startDate } },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "name"],
      _sum: { quantity: true, lineTotal: true },
      where: { order: { createdAt: { gte: startDate } } },
      orderBy: { _sum: { lineTotal: "desc" } },
      take: 10,
    }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.grandTotal ?? 0);
  const prevTotalRevenue = Number(prevRevenueAgg._sum.grandTotal ?? 0);
  const avgOrder = orderCount > 0 ? totalRevenue / orderCount : 0;
  const prevAvgOrder = prevOrderCount > 0 ? prevTotalRevenue / prevOrderCount : 0;

  const maxStatusCount = Math.max(...statusDist.map((s) => s._count._all), 1);

  let dailySales: Array<{ date: string; total: number; count: number }> = [];
  if (!useWeekly) {
    dailySales = await prisma.$queryRaw<Array<{ date: string; total: number; count: number }>>`
      SELECT
        DATE("createdAt") as date,
        SUM("grandTotal")::float as total,
        COUNT(*)::int as count
      FROM "Order"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;
  } else {
    dailySales = await prisma.$queryRaw<Array<{ date: string; total: number; count: number }>>`
      SELECT
        DATE_TRUNC('week', "createdAt") as date,
        SUM("grandTotal")::float as total,
        COUNT(*)::int as count
      FROM "Order"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('week', "createdAt")
      ORDER BY date ASC
    `;
  }

  const maxBarValue = Math.max(...dailySales.map((d) => d.total), 1);

  const periodLabels: Record<Period, string> = {
    "7d": "7 Gün",
    "30d": "30 Gün",
    "90d": "90 Gün",
    year: "1 Yıl",
  };

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title="Raporlar" description="Satış ve gelir analizleri" />

      {/* Period Tabs */}
      <div className="flex gap-1 mb-8 border-b border-cream-200">
        {(["7d", "30d", "90d", "year"] as Period[]).map((p) => (
          <a
            key={p}
            href={`?period=${p}`}
            className={
              period === p
                ? "px-4 py-2 text-sm font-medium text-rose-700 border-b-2 border-rose-500 -mb-px"
                : "px-4 py-2 text-sm text-ink-500 hover:text-ink-700"
            }
          >
            {periodLabels[p]}
          </a>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Toplam Gelir"
          value={formatPrice(totalRevenue)}
          trend={pctChange(totalRevenue, prevTotalRevenue)}
          positive={isPositive(totalRevenue, prevTotalRevenue)}
        />
        <StatCard
          label="Sipariş Sayısı"
          value={orderCount.toString()}
          trend={pctChange(orderCount, prevOrderCount)}
          positive={isPositive(orderCount, prevOrderCount)}
        />
        <StatCard
          label="Yeni Müşteri"
          value={newCustomers.toString()}
          trend={pctChange(newCustomers, prevNewCustomers)}
          positive={isPositive(newCustomers, prevNewCustomers)}
        />
        <StatCard
          label="Ort. Sipariş Değeri"
          value={orderCount > 0 ? formatPrice(avgOrder) : "—"}
          trend={orderCount > 0 ? pctChange(avgOrder, prevAvgOrder) : "—"}
          positive={isPositive(avgOrder, prevAvgOrder)}
        />
      </div>

      {/* Status Distribution + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="font-medium text-ink-700 mb-4">Sipariş Durumu Dağılımı</h2>
          {statusDist.length === 0 ? (
            <p className="text-ink-300 text-sm">Bu dönemde sipariş yok.</p>
          ) : (
            <div className="space-y-3">
              {statusDist
                .sort((a, b) => b._count._all - a._count._all)
                .map((s) => {
                  const pct = (s._count._all / maxStatusCount) * 100;
                  return (
                    <div key={s.status} className="flex items-center gap-3">
                      <span className="w-36 text-xs text-ink-500 shrink-0">
                        {STATUS_LABELS[s.status]}
                      </span>
                      <div className="flex-1 bg-cream-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${STATUS_BAR_COLORS[s.status]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs font-medium text-ink-700">
                        {s._count._all}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-medium text-ink-700 mb-4">En Çok Satan Ürünler</h2>
          {topProducts.length === 0 ? (
            <p className="text-ink-300 text-sm">Bu dönemde satış yok.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-ink-300 border-b border-cream-100">
                    <th className="pb-2 font-medium">Ürün Adı</th>
                    <th className="pb-2 font-medium text-right">Satış</th>
                    <th className="pb-2 font-medium text-right">Gelir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-50">
                  {topProducts.map((p, i) => (
                    <tr key={p.productId ?? i} className="hover:bg-cream-50/50">
                      <td className="py-2 text-ink-700 truncate max-w-[180px]">{p.name}</td>
                      <td className="py-2 text-right text-ink-500">{p._sum.quantity ?? 0}</td>
                      <td className="py-2 text-right font-medium">
                        {p._sum.lineTotal ? formatPrice(Number(p._sum.lineTotal)) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="p-6">
        <h2 className="font-medium text-ink-700 mb-6">
          {useWeekly ? "Haftalık Satış Grafiği" : "Günlük Satış Grafiği"}
        </h2>
        {dailySales.length === 0 ? (
          <p className="text-ink-300 text-sm">Bu dönemde veri yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <div
              className="flex items-end gap-1 min-w-max"
              style={{ height: "160px" }}
            >
              {dailySales.map((d, i) => {
                const heightPct = (d.total / maxBarValue) * 100;
                const label = useWeekly
                  ? new Date(d.date).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })
                  : new Date(d.date).toLocaleDateString("tr-TR", { month: "short", day: "numeric" });
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1"
                    style={{ width: useWeekly ? "48px" : "28px" }}
                    title={`${label}: ${formatPrice(d.total)} (${d.count} sipariş)`}
                  >
                    <div className="w-full flex items-end" style={{ height: "128px" }}>
                      <div
                        className="w-full bg-rose-400 hover:bg-rose-500 transition rounded-t"
                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-ink-300 text-center leading-tight whitespace-nowrap">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  trend,
  positive,
}: {
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <Card className="p-5">
      <p className="text-xs text-ink-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-semibold text-ink-800 leading-tight">{value}</p>
      {trend !== "—" && (
        <p className={`text-xs mt-1 ${positive ? "text-emerald-600" : "text-rose-500"}`}>
          {trend} <span className="text-ink-300">önceki dönem</span>
        </p>
      )}
    </Card>
  );
}
