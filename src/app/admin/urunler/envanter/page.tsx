import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";
import { StockInput } from "./_components/stock-input";

export const dynamic = "force-dynamic";

type StockStatus = "all" | "low" | "out";

function stockBadge(stock: number, threshold: number) {
  if (stock === 0) {
    return <span className="text-xs px-2 py-1 rounded bg-rose-50 text-rose-700">Tükendi</span>;
  }
  if (stock <= threshold) {
    return <span className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700">Az Stok</span>;
  }
  return <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700">Stokta</span>;
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string }>;
}) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/urunler/envanter";
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const statusFilter = (sp.status ?? "all") as StockStatus;
  const sort = sp.sort ?? "name";

  const allProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      category: { select: { name: true } },
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const filtered = allProducts.filter((p) => {
    if (statusFilter === "out") return p.stock === 0;
    if (statusFilter === "low") return p.stock > 0 && p.stock <= p.lowStockThreshold;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "stock_asc") return a.stock - b.stock;
    if (sort === "stock_desc") return b.stock - a.stock;
    if (sort === "updated") return b.updatedAt.getTime() - a.updatedAt.getTime();
    return a.name.localeCompare(b.name, "tr");
  });

  const totalActive = allProducts.length;
  const lowStockCount = allProducts.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outOfStockCount = allProducts.filter((p) => p.stock === 0).length;

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Envanter"
        description={`${totalActive} aktif ürün`}
      />

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-ink-300 mb-1">Toplam Ürün</div>
          <div className="text-2xl font-semibold text-ink-700">{totalActive}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-amber-400 mb-1">Az Stok</div>
          <div className="text-2xl font-semibold text-amber-600">{lowStockCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-rose-400 mb-1">Tükendi</div>
          <div className="text-2xl font-semibold text-rose-600">{outOfStockCount}</div>
        </Card>
      </div>

      <form className="mb-6 flex flex-wrap gap-2 items-center">
        <input
          name="q"
          defaultValue={q}
          placeholder="Ürün adı veya SKU..."
          className="h-10 px-3 rounded-md border border-cream-200 bg-white text-sm flex-1 min-w-[240px]"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="h-10 px-3 rounded-md border border-cream-200 bg-white text-sm"
        >
          <option value="all">Tümü</option>
          <option value="low">Az Stok</option>
          <option value="out">Tükendi</option>
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="h-10 px-3 rounded-md border border-cream-200 bg-white text-sm"
        >
          <option value="name">İsme göre</option>
          <option value="stock_asc">Stok (az → çok)</option>
          <option value="stock_desc">Stok (çok → az)</option>
          <option value="updated">Son güncelleme</option>
        </select>
        <button type="submit" className="h-10 px-4 rounded-md bg-ink-700 text-white text-sm">
          Filtrele
        </button>
      </form>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-cream-100">
              <tr className="text-left text-xs uppercase tracking-wider text-ink-300">
                <th className="px-4 py-3 font-medium">Ürün</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium text-center">Durum</th>
                <th className="px-4 py-3 font-medium text-right">Düşük Stok Eşiği</th>
                <th className="px-4 py-3 font-medium text-right">Stok</th>
                <th className="px-4 py-3 font-medium text-center">Varyantlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-50">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-ink-300">
                    Ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                sorted.map((p) => (
                  <>
                    <tr key={p.id} className="hover:bg-cream-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden bg-cream-100">
                            {p.images[0] ? (
                              <Image src={p.images[0].url} alt="" fill sizes="40px" className="object-cover" />
                            ) : null}
                          </div>
                          <Link
                            href={`/admin/urunler/${p.id}`}
                            className="font-medium text-ink-700 hover:text-rose-600"
                          >
                            {p.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-400 text-xs">{p.sku ?? "—"}</td>
                      <td className="px-4 py-3 text-ink-500">{p.category?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-center">
                        {stockBadge(p.stock, p.lowStockThreshold)}
                      </td>
                      <td className="px-4 py-3 text-right text-ink-500">{p.lowStockThreshold}</td>
                      <td className="px-4 py-3 text-right">
                        <StockInput productId={p.id} initialStock={p.stock} />
                      </td>
                      <td className="px-4 py-3 text-center text-ink-400">
                        {p.variants.length > 0 ? (
                          <span className="text-xs px-2 py-1 rounded bg-cream-100 text-ink-500">
                            {p.variants.length} varyant
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                    {p.variants.map((v) => (
                      <tr key={v.id} className="bg-cream-50/30 hover:bg-cream-50/60">
                        <td className="px-4 py-2 pl-16 text-ink-500 text-xs">↳ {v.name}</td>
                        <td className="px-4 py-2 text-ink-400 text-xs">{v.sku ?? "—"}</td>
                        <td className="px-4 py-2" />
                        <td className="px-4 py-2 text-center">
                          {stockBadge(v.stock, p.lowStockThreshold)}
                        </td>
                        <td className="px-4 py-2 text-right text-ink-400 text-xs">{p.lowStockThreshold}</td>
                        <td className="px-4 py-2 text-right">
                          <StockInput variantId={v.id} initialStock={v.stock} />
                        </td>
                        <td className="px-4 py-2" />
                      </tr>
                    ))}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}
