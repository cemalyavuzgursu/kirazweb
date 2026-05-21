import Link from "next/link";
import { headers } from "next/headers";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deletePage } from "@/server/actions/pages";

export const dynamic = "force-dynamic";

export default async function PagesListPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/sayfalar";

  const pages = await prisma.page.findMany({ orderBy: { title: "asc" } });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Sayfalar"
        description={`${pages.length} CMS sayfası`}
        action={
          <Link href="/admin/sayfalar/yeni">
            <Button><Plus className="h-4 w-4" /> Yeni Sayfa</Button>
          </Link>
        }
      />

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-cream-100">
            <tr className="text-left text-xs uppercase tracking-wider text-ink-300">
              <th className="px-4 py-3 font-medium">Başlık</th>
              <th className="px-4 py-3 font-medium">URL</th>
              <th className="px-4 py-3 font-medium text-center">Durum</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-50">
            {pages.map((p) => (
              <tr key={p.id} className="hover:bg-cream-50/50">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-xs text-ink-500">/{p.slug}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-1 rounded ${p.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-cream-100 text-ink-300"}`}>
                    {p.isPublished ? "Yayında" : "Taslak"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/sayfalar/${p.id}`} className="text-ink-300 hover:text-ink-700">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form action={deletePage}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-ink-300 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
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
