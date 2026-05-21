import Link from "next/link";
import { headers } from "next/headers";
import { Plus, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BlogPostsPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/blog/yazilar";
  const sp = await searchParams;
  const filter = sp?.filter ?? "all";

  const where =
    filter === "yayinda"
      ? { isPublished: true }
      : filter === "taslak"
        ? { isPublished: false }
        : {};

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const FILTERS = [
    { key: "all", label: "Tümü" },
    { key: "yayinda", label: "Yayında" },
    { key: "taslak", label: "Taslak" },
  ];

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Blog Yazıları"
        description={`${posts.length} yazı`}
        action={
          <Link href="/admin/blog/yazilar/yeni">
            <Button><Plus className="h-4 w-4" /> Yeni Yazı</Button>
          </Link>
        }
      />

      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/blog/yazilar" : `/admin/blog/yazilar?filter=${f.key}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filter === f.key
                ? "bg-rose-500 border-rose-500 text-white"
                : "border-cream-200 text-ink-500 hover:border-rose-300"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-cream-100">
            <tr className="text-left text-xs uppercase tracking-wider text-ink-300">
              <th className="px-4 py-3 font-medium">Başlık</th>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium text-center">Durum</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-50">
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-300 text-sm">
                  Henüz yazı yok.
                </td>
              </tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-cream-50/50">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-xs text-ink-500">
                  {p.publishedAt ? formatDate(p.publishedAt) : formatDate(p.createdAt)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      p.isPublished
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-cream-100 text-ink-300"
                    }`}
                  >
                    {p.isPublished ? "Yayında" : "Taslak"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/blog/yazilar/${p.id}`}
                      className="text-ink-300 hover:text-ink-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}
