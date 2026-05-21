import Link from "next/link";
import { headers } from "next/headers";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteCategory } from "@/server/actions/categories";

export const dynamic = "force-dynamic";

export default async function CategoriesListPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/kategoriler";

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Kategoriler"
        description={`${categories.length} kategori`}
        action={
          <Link href="/admin/kategoriler/yeni">
            <Button><Plus className="h-4 w-4" /> Yeni Kategori</Button>
          </Link>
        }
      />

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-cream-100">
            <tr className="text-left text-xs uppercase tracking-wider text-ink-300">
              <th className="px-4 py-3 font-medium">İsim</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium text-right">Ürün</th>
              <th className="px-4 py-3 font-medium text-center">Durum</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-50">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-ink-300">
                  Henüz kategori yok.
                </td>
              </tr>
            ) : categories.map((c) => (
              <tr key={c.id} className="hover:bg-cream-50/50">
                <td className="px-4 py-3 font-medium text-ink-700">{c.name}</td>
                <td className="px-4 py-3 text-ink-500 text-xs">{c.slug}</td>
                <td className="px-4 py-3 text-right text-ink-500">{c._count.products}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-1 rounded ${c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-cream-100 text-ink-300"}`}>
                    {c.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/kategoriler/${c.id}`} className="text-ink-300 hover:text-ink-700">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
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
