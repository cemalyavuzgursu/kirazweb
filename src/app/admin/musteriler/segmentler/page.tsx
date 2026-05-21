import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

type SegmentDef = {
  key: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
};

const SEGMENTS: SegmentDef[] = [
  {
    key: "all",
    name: "Tüm Müşteriler",
    description: "Kayıtlı tüm müşteriler",
    color: "gray",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-700",
  },
  {
    key: "new",
    name: "Yeni Müşteriler",
    description: "Son 30 gün içinde kayıt olanlar",
    color: "blue",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
  },
  {
    key: "loyal",
    name: "Sadık Müşteriler",
    description: "En az 2 sipariş verenler",
    color: "emerald",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
  },
  {
    key: "highvalue",
    name: "Yüksek Değerli",
    description: "Toplam harcaması 1.000 ₺ üzeri",
    color: "amber",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
  },
  {
    key: "inactive",
    name: "Aktif Olmayan",
    description: "Son 90 gün sipariş vermeyenler",
    color: "rose",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    textColor: "text-rose-700",
  },
  {
    key: "google",
    name: "Google ile Kaydolan",
    description: "Google OAuth ile giriş yapanlar",
    color: "purple",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
  },
];

export default async function CustomerSegmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/musteriler/segmentler";

  const { q } = await searchParams;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const loyalCustomerIds = await prisma.order
    .groupBy({
      by: ["customerId"],
      having: { customerId: { _count: { gte: 2 } } },
      where: { customerId: { not: null } },
    })
    .then((rows) => rows.map((r) => r.customerId as string));

  const highValueCustomerIds = await prisma.order
    .groupBy({
      by: ["customerId"],
      _sum: { grandTotal: true },
      having: { grandTotal: { _sum: { gte: 1000 } } },
      where: { customerId: { not: null } },
    })
    .then((rows) => rows.map((r) => r.customerId as string));

  const [
    countAll,
    countNew,
    countLoyal,
    countHighValue,
    countInactive,
    countGoogle,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    Promise.resolve(loyalCustomerIds.length),
    Promise.resolve(highValueCustomerIds.length),
    prisma.customer.count({
      where: {
        orders: {
          none: { createdAt: { gte: ninetyDaysAgo } },
        },
      },
    }),
    prisma.customer.count({ where: { googleId: { not: null } } }),
  ]);

  const segmentCounts: Record<string, number> = {
    all: countAll,
    new: countNew,
    loyal: countLoyal,
    highvalue: countHighValue,
    inactive: countInactive,
    google: countGoogle,
  };

  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : undefined,
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Müşteri Segmentleri"
        description={`${countAll} kayıtlı müşteri`}
      />

      <form method="get" className="mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300 pointer-events-none" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Ad, e-posta veya telefon ara…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-cream-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
          />
        </div>
      </form>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {SEGMENTS.map((seg) => (
          <div
            key={seg.key}
            className={`rounded-lg border p-4 ${seg.bgColor} ${seg.borderColor}`}
          >
            <p className={`text-2xl font-bold font-display ${seg.textColor}`}>
              {segmentCounts[seg.key]}
            </p>
            <p className={`text-sm font-medium mt-0.5 ${seg.textColor}`}>
              {seg.name}
            </p>
            <p className="text-xs text-ink-400 mt-1">{seg.description}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-cream-100">
              <tr className="text-left text-xs uppercase tracking-wider text-ink-300">
                <th className="px-4 py-3 font-medium">Ad Soyad</th>
                <th className="px-4 py-3 font-medium">E-posta</th>
                <th className="px-4 py-3 font-medium">Telefon</th>
                <th className="px-4 py-3 font-medium text-right">Sipariş Sayısı</th>
                <th className="px-4 py-3 font-medium">Kayıt Tarihi</th>
                <th className="px-4 py-3 font-medium text-center">Google OAuth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-50">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-ink-300">
                    {q ? "Arama sonucu bulunamadı." : "Henüz kayıtlı müşteri yok."}
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-cream-50/50">
                    <td className="px-4 py-3 font-medium text-ink-700">{c.name}</td>
                    <td className="px-4 py-3 text-ink-500">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-500">{c.phone}</td>
                    <td className="px-4 py-3 text-right">{c._count.orders}</td>
                    <td className="px-4 py-3 text-ink-500 text-xs">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.googleId ? (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                          G
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {customers.length === 100 ? (
          <p className="px-4 py-2 text-xs text-ink-300 border-t border-cream-100">
            İlk 100 sonuç gösteriliyor. Daraltmak için arama yapın.
          </p>
        ) : null}
      </Card>
    </AdminShell>
  );
}
