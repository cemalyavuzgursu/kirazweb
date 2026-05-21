import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/public/product-card";
import { buildMetadata, breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildMetadata({
    title: "Tüm Ürünler",
    description: "Kiraz Tasarım'ın tüm el yapımı ev aksesuarları ve çeyiz ürünleri.",
    path: "/urunler",
  });
}

type SP = Promise<{ q?: string; kategori?: string; sirala?: string }>;

export default async function ProductsListPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const kategoriSlug = sp.kategori?.trim();
  const sort = sp.sirala ?? "yeni";

  const orderBy =
    sort === "ucuz"
      ? { price: "asc" as const }
      : sort === "pahali"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const where = {
    isActive: true,
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { shortDescription: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(kategoriSlug && { category: { slug: kategoriSlug } }),
  };

  const [products, categories, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: 48,
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.count({ where }),
  ]);

  return (
    <>
    <JsonLd
      data={breadcrumbJsonLd([
        { name: "Ana Sayfa", url: env.NEXT_PUBLIC_SITE_URL },
        { name: "Tüm Ürünler", url: `${env.NEXT_PUBLIC_SITE_URL}/urunler` },
      ])}
    />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="font-display text-4xl mb-2" style={{ color: "var(--kt-heading)" }}>Tüm Ürünler</h1>
        <p style={{ color: "var(--kt-muted)" }}>
          {total} ürün
          {q ? ` · "${q}" araması` : ""}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <form className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "var(--kt-muted)" }}>
                Ara
              </label>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="ürün adı..."
                className="w-full h-10 px-3 rounded-md text-sm"
                style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-bg)", color: "var(--kt-text)" }}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "var(--kt-muted)" }}>
                Kategori
              </label>
              <div className="space-y-1.5">
                <Link
                  href="/urunler"
                  className="block text-sm py-1 font-medium"
                  style={{ color: !kategoriSlug ? "var(--kt-primary)" : "var(--kt-muted)" }}
                >
                  Tümü
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/urunler?kategori=${c.slug}${q ? `&q=${q}` : ""}`}
                    className="block text-sm py-1"
                    style={{ color: kategoriSlug === c.slug ? "var(--kt-primary)" : "var(--kt-muted)", fontWeight: kategoriSlug === c.slug ? 500 : undefined }}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "var(--kt-muted)" }}>
                Sırala
              </label>
              <select
                name="sirala"
                defaultValue={sort}
                className="w-full h-10 px-3 rounded-md text-sm"
                style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-bg)", color: "var(--kt-text)" }}
              >
                <option value="yeni">En Yeni</option>
                <option value="ucuz">Fiyat: Düşükten Yükseğe</option>
                <option value="pahali">Fiyat: Yüksekten Düşüğe</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-md text-sm font-medium"
              style={{ backgroundColor: "var(--kt-primary)", color: "var(--kt-btn-text, #fff)" }}
            >
              Uygula
            </button>
          </form>
        </aside>

        <div>
          {products.length === 0 ? (
            <div className="text-center py-24" style={{ color: "var(--kt-muted)" }}>
              Aradığınız kriterlere uygun ürün bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    shortDescription: p.shortDescription,
                    price: p.price.toString(),
                    compareAtPrice: p.compareAtPrice?.toString() ?? null,
                    image: p.images[0]?.url,
                    category: p.category?.name,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
