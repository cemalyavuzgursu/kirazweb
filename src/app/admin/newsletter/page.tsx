import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
}) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/newsletter";

  const { filter = "all", page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const skip = (pageNum - 1) * PAGE_SIZE;

  const now = new Date();
  let dateFilter: { gte?: Date } | undefined;

  if (filter === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFilter = { gte: start };
  } else if (filter === "30days") {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    dateFilter = { gte: start };
  }

  const where = dateFilter ? { createdAt: dateFilter } : {};

  const [total, subscribers] = await Promise.all([
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const filterOptions = [
    { value: "all", label: "Tümü" },
    { value: "month", label: "Bu Ay" },
    { value: "30days", label: "Son 30 Gün" },
  ];

  const exportUrl = filter !== "all"
    ? `/admin/newsletter/export?filter=${filter}`
    : "/admin/newsletter/export";

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Bülten Aboneleri"
        description={`${total} abone`}
        action={
          <a
            href={exportUrl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition"
          >
            CSV İndir
          </a>
        }
      />

      {/* Filter bar */}
      <div className="flex gap-2 mb-4">
        {filterOptions.map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/newsletter?filter=${opt.value}`}
            className={`px-3 py-1.5 rounded-md text-sm transition border ${
              filter === opt.value
                ? "bg-rose-600 text-white border-rose-600"
                : "bg-white text-ink-500 border-cream-200 hover:border-rose-300 hover:text-ink-700"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-cream-100">
            <tr className="text-left text-xs uppercase tracking-wider text-ink-300">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">E-posta</th>
              <th className="px-4 py-3 font-medium">Kayıt Tarihi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-50">
            {subscribers.map((sub, i) => (
              <tr key={sub.id} className="hover:bg-cream-50/50">
                <td className="px-4 py-3 text-ink-300 text-xs">{skip + i + 1}</td>
                <td className="px-4 py-3 font-medium">{sub.email}</td>
                <td className="px-4 py-3 text-ink-500 text-xs">
                  {formatDate(sub.createdAt, true)}
                </td>
              </tr>
            ))}
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-ink-300">
                  Henüz abone yok.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-ink-500">
          <span>
            {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} / {total} abone
          </span>
          <div className="flex gap-2">
            {pageNum > 1 && (
              <Link
                href={`/admin/newsletter?filter=${filter}&page=${pageNum - 1}`}
                className="px-3 py-1.5 rounded border border-cream-200 hover:border-rose-300 bg-white transition"
              >
                ← Önceki
              </Link>
            )}
            {pageNum < totalPages && (
              <Link
                href={`/admin/newsletter?filter=${filter}&page=${pageNum + 1}`}
                className="px-3 py-1.5 rounded border border-cream-200 hover:border-rose-300 bg-white transition"
              >
                Sonraki →
              </Link>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
