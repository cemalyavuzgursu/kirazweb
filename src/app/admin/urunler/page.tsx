import Link from "next/link";
import { headers } from "next/headers";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteProduct, toggleProductActive } from "@/server/actions/products";

export const dynamic = "force-dynamic";

export default async function ProductsListPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/urunler";

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Ürünler"
        description={`Toplam ${products.length} ürün`}
        action={
          <Link href="/admin/urunler/yeni">
            <Button>
              <Plus className="h-4 w-4" />
              Yeni Ürün
            </Button>
          </Link>
        }
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-cream-100">
              <tr className="text-left text-xs uppercase tracking-wider text-ink-300">
                <th className="px-4 py-3 font-medium">Görsel</th>
                <th className="px-4 py-3 font-medium">Ürün</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium text-right">Fiyat</th>
                <th className="px-4 py-3 font-medium text-right">Stok</th>
                <th className="px-4 py-3 font-medium text-center">Durum</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-ink-300">
                    Henüz ürün yok. <Link href="/admin/urunler/yeni" className="text-rose-600 underline">Hemen ekleyin</Link>.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-cream-50/50">
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 rounded overflow-hidden bg-cream-100">
                        {p.images[0] ? (
                          <Image src={p.images[0].url} alt="" fill sizes="48px" className="object-cover" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/urunler/${p.id}`} className="font-medium text-ink-700 hover:text-rose-600">
                        {p.name}
                      </Link>
                      {p.sku ? <div className="text-xs text-ink-300">SKU: {p.sku}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-ink-500">{p.category?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(p.price.toString())}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={p.stock <= p.lowStockThreshold ? "text-rose-600 font-medium" : "text-ink-500"}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form action={toggleProductActive}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className={`text-xs px-2 py-1 rounded ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-cream-100 text-ink-300"}`}
                        >
                          {p.isActive ? "Aktif" : "Pasif"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/urunler/${p.id}`} className="text-ink-300 hover:text-ink-700">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <form action={deleteProduct}>
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            className="text-ink-300 hover:text-rose-600"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
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
