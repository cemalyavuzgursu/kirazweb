import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/musteriler";

  // Customers are derived from orders (guest checkout)
  const aggregated = await prisma.order.groupBy({
    by: ["customerPhone", "customerName"],
    _count: { _all: true },
    _sum: { grandTotal: true },
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
    take: 100,
  });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Müşteriler"
        description={`${aggregated.length} farklı müşteri (sipariş bazlı)`}
      />
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-cream-100">
            <tr className="text-left text-xs uppercase tracking-wider text-ink-300">
              <th className="px-4 py-3 font-medium">Ad Soyad</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
              <th className="px-4 py-3 font-medium text-right">Sipariş Sayısı</th>
              <th className="px-4 py-3 font-medium text-right">Toplam Harcama</th>
              <th className="px-4 py-3 font-medium">Son Sipariş</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-50">
            {aggregated.map((c, i) => (
              <tr key={`${c.customerPhone}-${i}`} className="hover:bg-cream-50/50">
                <td className="px-4 py-3 font-medium">{c.customerName}</td>
                <td className="px-4 py-3 text-ink-500">{c.customerPhone}</td>
                <td className="px-4 py-3 text-right">{c._count._all}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {c._sum.grandTotal ? formatPrice(c._sum.grandTotal.toString()) : "—"}
                </td>
                <td className="px-4 py-3 text-ink-500 text-xs">
                  {c._max.createdAt ? formatDate(c._max.createdAt) : "—"}
                </td>
              </tr>
            ))}
            {aggregated.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-ink-300">Henüz müşteri yok.</td></tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}
