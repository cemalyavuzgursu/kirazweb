import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/public/product-card";
import { buildMetadata, breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { env } from "@/lib/env";
import { getCategoryPageSettings, getDraftData } from "@/server/actions/theme";
import type { CategoryPageSettings } from "@/lib/theme-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return buildMetadata({ title: "Kategori bulunamadı", noindex: true });
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const baseMeta = await buildMetadata({
    title: cat.seoTitle ?? cat.name,
    description: cat.seoDescription ?? cat.description ?? undefined,
    path: `/kategori/${cat.slug}`,
  });

  const ogDescription =
    cat.seoDescription ?? cat.description ?? "";
  const ogImageUrl = cat.image
    ? cat.image.startsWith("http") ? cat.image : `${base}${cat.image}`
    : undefined;

  return {
    ...baseMeta,
    openGraph: {
      ...baseMeta.openGraph,
      title: cat.seoTitle ?? cat.name,
      description: ogDescription,
      images: ogImageUrl
        ? [{ url: ogImageUrl, width: 1200, height: 630 }]
        : baseMeta.openGraph?.images,
      type: "website" as const,
    },
    twitter: {
      ...baseMeta.twitter,
      card: "summary_large_image" as const,
      title: cat.seoTitle ?? cat.name,
      images: ogImageUrl ? [ogImageUrl] : baseMeta.twitter?.images,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string; sort?: string; page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const isPreview = sp?.preview === "1";

  let pageSettings: CategoryPageSettings;
  if (isPreview) {
    const draft = await getDraftData();
    pageSettings = draft?.categoryPageSettings ?? (await getCategoryPageSettings());
  } else {
    pageSettings = await getCategoryPageSettings();
  }

  const sort = sp?.sort ?? pageSettings.defaultSort;
  const orderBy = sort === "price_asc"
    ? { price: "asc" as const }
    : sort === "price_desc"
      ? { price: "desc" as const }
      : sort === "name_asc"
        ? { name: "asc" as const }
        : { createdAt: "desc" as const };

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy,
        take: pageSettings.perPage,
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: { select: { name: true } },
        },
      },
    },
  });
  if (!category || !category.isActive) notFound();

  const colClass =
    pageSettings.defaultColumns === 2
      ? "grid-cols-2"
      : pageSettings.defaultColumns === 3
        ? "grid-cols-2 md:grid-cols-3"
        : "grid-cols-2 md:grid-cols-4";

  const sortOptions = [
    { value: "newest", label: "En Yeni" },
    { value: "price_asc", label: "Fiyat: Düşük→Yüksek" },
    { value: "price_desc", label: "Fiyat: Yüksek→Düşük" },
    { value: "name_asc", label: "İsim: A→Z" },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", url: env.NEXT_PUBLIC_SITE_URL },
          { name: "Kategoriler", url: `${env.NEXT_PUBLIC_SITE_URL}/urunler` },
          { name: category.name, url: `${env.NEXT_PUBLIC_SITE_URL}/kategori/${category.slug}` },
        ])}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        {pageSettings.showBanner && (
          <header className="mb-10 text-center">
            {category.image && (
              <div className="relative w-full h-48 rounded-xl overflow-hidden mb-6">
                <Image src={category.image} alt={category.name} fill sizes="100vw" className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                  <h1 className="font-display text-4xl sm:text-5xl text-white" style={{ color: "#fff" }}>{category.name}</h1>
                </div>
              </div>
            )}
            {!category.image && (
              <h1 className="font-display text-4xl sm:text-5xl mb-3" style={{ color: "var(--kt-heading)" }}>{category.name}</h1>
            )}
            {pageSettings.showDescription && category.description ? (
              <p className="max-w-2xl mx-auto" style={{ color: "var(--kt-muted)" }}>{category.description}</p>
            ) : null}
          </header>
        )}

        {!pageSettings.showBanner && (
          <header className="mb-10 text-center">
            <h1 className="font-display text-4xl sm:text-5xl mb-3" style={{ color: "var(--kt-heading)" }}>{category.name}</h1>
            {pageSettings.showDescription && category.description ? (
              <p className="max-w-2xl mx-auto" style={{ color: "var(--kt-muted)" }}>{category.description}</p>
            ) : null}
          </header>
        )}

        {pageSettings.filterPosition === "sidebar" ? (
          /* ── Sidebar layout ─────────────────────────────────────────────── */
          <div className="flex gap-8 items-start">
            {/* Sidebar */}
            <aside className="hidden md:block w-52 shrink-0 space-y-6 sticky top-24">
              {pageSettings.showProductCount && (
                <p className="text-xs" style={{ color: "var(--kt-muted)" }}>
                  {category.products.length} ürün
                </p>
              )}
              {pageSettings.showSortBar && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--kt-muted)" }}>Sırala</p>
                  <div className="flex flex-col gap-1">
                    {sortOptions.map((opt) => (
                      <Link
                        key={opt.value}
                        href={`?sort=${opt.value}${isPreview ? "&preview=1" : ""}`}
                        className="px-3 py-1.5 text-sm rounded-md transition"
                        style={
                          sort === opt.value
                            ? { backgroundColor: "var(--kt-primary)", color: "#fff" }
                            : { color: "var(--kt-text)", opacity: 0.7 }
                        }
                      >
                        {opt.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* Product grid */}
            <div className="flex-1 min-w-0">
              {/* Mobile sort bar */}
              {pageSettings.showSortBar && (
                <div className="flex md:hidden gap-1.5 flex-wrap mb-4">
                  {sortOptions.map((opt) => (
                    <Link
                      key={opt.value}
                      href={`?sort=${opt.value}${isPreview ? "&preview=1" : ""}`}
                      className="px-2.5 py-1 text-xs rounded-md border transition"
                      style={
                        sort === opt.value
                          ? { backgroundColor: "var(--kt-primary)", color: "#fff", borderColor: "var(--kt-primary)" }
                          : { borderColor: "var(--kt-border)", color: "var(--kt-text)" }
                      }
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              )}
              {category.products.length === 0 ? (
                <p className="text-center py-20" style={{ color: "var(--kt-muted)" }}>Bu kategoride henüz ürün yok.</p>
              ) : (
                <>
                  <div className={`grid ${colClass} gap-6`}>
                    {category.products.map((p) => (
                      <ProductCard key={p.id} product={{ id: p.id, slug: p.slug, name: p.name, price: p.price.toString(), compareAtPrice: p.compareAtPrice?.toString() ?? null, image: p.images[0]?.url, category: p.category?.name }} />
                    ))}
                  </div>
                  {pageSettings.paginationStyle === "load_more" && (
                    <div className="mt-10 text-center">
                      <button className="px-8 py-3 rounded-md text-sm transition" style={{ borderWidth: 1, borderStyle: "solid", borderColor: "var(--kt-border)", color: "var(--kt-text)" }}>
                        Daha Fazla Göster
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* ── Topbar layout ──────────────────────────────────────────────── */
          <>
            {(pageSettings.showSortBar || pageSettings.showProductCount) && (
              <div className="flex items-center justify-between gap-4 mb-6">
                {pageSettings.showProductCount && (
                  <p className="text-sm" style={{ color: "var(--kt-muted)" }}>{category.products.length} ürün</p>
                )}
                {pageSettings.showSortBar && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs" style={{ color: "var(--kt-muted)" }}>Sırala:</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {sortOptions.map((opt) => (
                        <Link
                          key={opt.value}
                          href={`?sort=${opt.value}${isPreview ? "&preview=1" : ""}`}
                          className="px-2.5 py-1 text-xs rounded-md border transition"
                          style={
                            sort === opt.value
                              ? { backgroundColor: "var(--kt-primary)", color: "#fff", borderColor: "var(--kt-primary)" }
                              : { borderColor: "var(--kt-border)", color: "var(--kt-text)" }
                          }
                        >
                          {opt.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {category.products.length === 0 ? (
              <p className="text-center py-20" style={{ color: "var(--kt-muted)" }}>Bu kategoride henüz ürün yok.</p>
            ) : (
              <>
                <div className={`grid ${colClass} gap-6`}>
                  {category.products.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={{
                        id: p.id,
                        slug: p.slug,
                        name: p.name,
                        price: p.price.toString(),
                        compareAtPrice: p.compareAtPrice?.toString() ?? null,
                        image: p.images[0]?.url,
                        category: p.category?.name,
                      }}
                    />
                  ))}
                </div>
                {pageSettings.paginationStyle === "load_more" && (
                  <div className="mt-10 text-center">
                    <button
                      className="px-8 py-3 rounded-md text-sm transition"
                      style={{ borderWidth: 1, borderStyle: "solid", borderColor: "var(--kt-border)", color: "var(--kt-text)" }}
                    >
                      Daha Fazla Göster
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
