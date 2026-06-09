import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { buildMetadata, breadcrumbJsonLd, productJsonLd, JsonLd } from "@/lib/seo";
import { env } from "@/lib/env";
import { ProductCard } from "@/components/public/product-card";
import { AddToCartButton } from "@/components/public/add-to-cart-button";
import { ProductGallery } from "@/components/public/product-gallery";
import { RichText } from "@/components/public/rich-text";
import { getProductPageSettings } from "@/server/actions/theme";
import { getDraftData } from "@/server/actions/theme";
import type { ProductPageSettings } from "@/lib/theme-settings";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
  });
  if (!product) return buildMetadata({ title: "Ürün bulunamadı", noindex: true });
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const base64Meta = await buildMetadata({
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription ?? undefined,
    path: `/urunler/${product.slug}`,
    ogImage: product.ogImage ?? undefined,
    productImage: product.images[0]?.url ? `${base}${product.images[0].url}` : undefined,
  });

  const ogDescription =
    product.seoDescription ??
    product.shortDescription ??
    (product.description ? product.description.replace(/<[^>]+>/g, "").slice(0, 160) : "") ??
    "";
  const ogImageUrl = product.images[0]?.url
    ? `${base}${product.images[0].url}`
    : undefined;

  return {
    ...base64Meta,
    openGraph: {
      ...base64Meta.openGraph,
      title: product.seoTitle ?? product.name,
      description: ogDescription,
      images: ogImageUrl
        ? [{ url: ogImageUrl, width: 1200, height: 630 }]
        : base64Meta.openGraph?.images,
      type: "website" as const,
    },
    twitter: {
      ...base64Meta.twitter,
      card: "summary_large_image" as const,
      title: product.seoTitle ?? product.name,
      images: ogImageUrl ? [ogImageUrl] : base64Meta.twitter?.images,
    },
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const isPreview = sp?.preview === "1";

  let pageSettings: ProductPageSettings;
  if (isPreview) {
    const draft = await getDraftData();
    pageSettings = draft?.productPageSettings ?? (await getProductPageSettings());
  } else {
    pageSettings = await getProductPageSettings();
  }

  const [product, kdvSettings] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { name: true, slug: true } },
        variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      },
    }),
    getSettings(["kdv_enabled", "kdv_rate"]),
  ]);
  if (!product || !product.isActive) notFound();

  const kdvEnabled = Boolean(kdvSettings["kdv_enabled"]);
  const showKdv = kdvEnabled && !product.kdvExempt;

  const related = pageSettings.showRelatedProducts
    ? await prisma.product.findMany({
        where: { isActive: true, categoryId: product.categoryId, id: { not: product.id } },
        orderBy: { createdAt: "desc" },
        take: pageSettings.relatedProductsCount,
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: { select: { name: true } },
        },
      })
    : [];

  const url = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/urunler/${product.slug}`;
  const onSale =
    product.compareAtPrice &&
    parseFloat(product.compareAtPrice.toString()) > parseFloat(product.price.toString());
  const sep = pageSettings.breadcrumbSeparator;

  return (
    <>
      <JsonLd
        data={productJsonLd({
          name: product.name,
          description: product.description ?? product.shortDescription ?? undefined,
          images: product.images.map((i) => `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}${i.url}`),
          sku: product.sku,
          brand: product.brand,
          url,
          price: parseFloat(product.price.toString()),
          currency: "TRY",
          inStock: product.stock > 0,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", url: env.NEXT_PUBLIC_SITE_URL },
          { name: "Ürünler", url: `${env.NEXT_PUBLIC_SITE_URL}/urunler` },
          ...(product.category
            ? [{ name: product.category.name, url: `${env.NEXT_PUBLIC_SITE_URL}/kategori/${product.category.slug}` }]
            : []),
          { name: product.name, url },
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pageSettings.showBreadcrumb && (
          <nav className="text-xs flex items-center gap-1 mb-6 flex-wrap" style={{ color: "var(--kt-muted)" }}>
            <Link href="/" className="hover:underline" style={{ color: "var(--kt-muted)" }}>Ana Sayfa</Link>
            <span>{sep}</span>
            <Link href="/urunler" className="hover:underline" style={{ color: "var(--kt-muted)" }}>Ürünler</Link>
            {product.category ? (
              <>
                <span>{sep}</span>
                <Link href={`/kategori/${product.category.slug}`} className="hover:underline" style={{ color: "var(--kt-muted)" }}>
                  {product.category.name}
                </Link>
              </>
            ) : null}
            <span>{sep}</span>
            <span style={{ color: "var(--kt-text)" }}>{product.name}</span>
          </nav>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Gallery */}
          <ProductGallery
            images={product.images.map((img) => ({ id: img.id, url: img.url }))}
            productName={product.name}
            galleryLayout={pageSettings.galleryLayout}
          />

          {/* Info */}
          <div>
            {product.category ? (
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--kt-muted)" }}>{product.category.name}</p>
            ) : null}
            <h1 className="font-display text-3xl sm:text-4xl mb-4" style={{ color: "var(--kt-heading)" }}>{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-medium" style={{ color: "var(--kt-heading)" }}>{formatPrice(product.price.toString())}</span>
              {onSale ? (
                <>
                  <span className="text-lg line-through" style={{ color: "var(--kt-muted)" }}>
                    {formatPrice(product.compareAtPrice!.toString())}
                  </span>
                  <span className="text-white text-xs px-2 py-1 rounded" style={{ backgroundColor: "var(--kt-primary)" }}>
                    -%
                    {Math.round(
                      (1 -
                        parseFloat(product.price.toString()) /
                          parseFloat(product.compareAtPrice!.toString())) *
                        100,
                    )}
                  </span>
                </>
              ) : null}
            </div>
            {showKdv ? (
              <p className="text-xs mb-4" style={{ color: "var(--kt-muted)" }}>(KDV dahil)</p>
            ) : null}

            {product.shortDescription ? (
              <p className="leading-relaxed mb-6" style={{ color: "var(--kt-text)" }}>{product.shortDescription}</p>
            ) : null}

            <div className="flex flex-col gap-3 mb-8">
              <AddToCartButton
                productId={product.id}
                inStock={product.stock > 0}
                price={product.price.toString()}
                name={product.name}
                image={product.images[0]?.url ?? null}
                slug={product.slug}
              />
              <Link
                href={`/iletisim?urun=${encodeURIComponent(product.name)}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium transition"
                style={{ border: "1px solid var(--kt-border)", color: "var(--kt-text)" }}
              >
                <MessageCircle className="h-4 w-4" />
                Soru Sor
              </Link>
            </div>

            <div className="text-xs space-y-1 pt-4" style={{ color: "var(--kt-muted)", borderTop: "1px solid var(--kt-border)" }}>
              {pageSettings.showSku && product.sku ? <p>SKU: {product.sku}</p> : null}
              {pageSettings.showBrand && product.brand ? <p>Marka: {product.brand}</p> : null}
              {pageSettings.showStockBadge && (
                <p>
                  Stok:{" "}
                  <span className={product.stock > 0 ? "text-emerald-700" : "text-rose-600"}>
                    {product.stock > 0 ? `${product.stock} adet mevcut` : "Tükendi"}
                  </span>
                </p>
              )}
            </div>

            {product.description && pageSettings.descriptionStyle === "text" ? (
              <RichText html={product.description} className="mt-8" />
            ) : product.description && pageSettings.descriptionStyle === "tabs" ? (
              <div className="mt-8">
                <div className="mb-4" style={{ borderBottom: "1px solid var(--kt-border)" }}>
                  <span className="inline-block pb-2 text-sm font-medium" style={{ borderBottom: "2px solid var(--kt-primary)", color: "var(--kt-primary)" }}>
                    Ürün Açıklaması
                  </span>
                </div>
                <RichText html={product.description} className="prose max-w-none" />
              </div>
            ) : null}
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-20">
            <h2 className="font-display text-2xl mb-6" style={{ color: "var(--kt-heading)" }}>{pageSettings.relatedProductsHeading}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p) => (
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
          </section>
        ) : null}
      </div>
    </>
  );
}
