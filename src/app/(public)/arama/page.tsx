import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/public/product-card";
import { SearchInput } from "@/components/public/search-input";
import { buildMetadata, breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

type SP = Promise<{ q?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SP }) {
  const { q } = await searchParams;
  const trimmed = q?.trim();
  return buildMetadata({
    title: trimmed ? `"${trimmed}" için arama sonuçları` : "Ürün Ara",
    description: trimmed
      ? `"${trimmed}" araması için Kiraz Tasarım ürün sonuçları.`
      : "Kiraz Tasarım ürünlerinde arama yapın.",
    path: trimmed ? `/arama?q=${encodeURIComponent(trimmed)}` : "/arama",
    noindex: true,
  });
}

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const products = query
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: { select: { name: true, slug: true } },
        },
      })
    : [];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", url: env.NEXT_PUBLIC_SITE_URL },
          { name: "Arama", url: `${env.NEXT_PUBLIC_SITE_URL}/arama` },
        ])}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10 max-w-xl">
          <h1 className="font-display text-4xl mb-4" style={{ color: "var(--kt-heading)" }}>
            {query ? `"${query}" için sonuçlar` : "Ürün Ara"}
          </h1>
          <SearchInput defaultValue={query} placeholder="Ürün adı, açıklama..." />
        </header>

        {!query ? (
          <p className="text-base py-16 text-center" style={{ color: "var(--kt-muted)" }}>
            Aramak istediğiniz ürünü yazın.
          </p>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-base" style={{ color: "var(--kt-muted)" }}>
              <span className="font-medium" style={{ color: "var(--kt-text)" }}>&ldquo;{query}&rdquo;</span> için sonuç
              bulunamadı.
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--kt-muted)" }}>
              Farklı bir kelime deneyin veya{" "}
              <Link href="/urunler" className="hover:underline" style={{ color: "var(--kt-primary)" }}>
                tüm ürünlere
              </Link>{" "}
              göz atın.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm mb-6" style={{ color: "var(--kt-muted)" }}>
              {products.length} ürün bulundu
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          </>
        )}
      </div>
    </>
  );
}
