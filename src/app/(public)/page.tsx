import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { BannerPosition } from "@prisma/client";
import { HeroBanner } from "@/components/public/hero-banner";
import { MarqueeBar } from "@/components/public/marquee-bar";
import { ProductCard } from "@/components/public/product-card";
import { RichText } from "@/components/public/rich-text";
import { buildMetadata, localBusinessJsonLd, JsonLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { env } from "@/lib/env";
import { getSections } from "@/server/actions/editor";
import { getDraftData } from "@/server/actions/theme";
import type { PageSection } from "@/lib/page-sections";
import { NewsletterForm } from "@/components/public/newsletter-form";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildMetadata({ path: "/" });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string }>;
}) {
  const sp = await searchParams;
  const isPreview = sp?.preview === "1";

  let sections: PageSection[];
  if (isPreview) {
    const draft = await getDraftData();
    sections = draft?.homepageSections ?? (await getSections());
  } else {
    sections = await getSections();
  }

  const visible = sections.filter((s) => s.visible);

  const catSec = visible.find((s) => s.type === "categories");
  const featSec = visible.find((s) => s.type === "featured_products");
  const newSec = visible.find((s) => s.type === "new_products");
  const hasHero = visible.some((s) => s.type === "hero");

  const now = new Date();
  const [banners, categories, featured, newest, siteSettings] = await Promise.all([
    prisma.banner.findMany({
      where: {
        isActive: true,
        position: BannerPosition.HERO,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: { sortOrder: "asc" },
      take: hasHero ? 99 : 0,
    }),
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      take: catSec ? (catSec.settings.count ?? 6) : 0,
    }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: featSec ? (featSec.settings.count ?? 8) : 0,
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        category: { select: { name: true } },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: newSec ? (newSec.settings.count ?? 8) : 0,
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        category: { select: { name: true } },
      },
    }),
    getSettings([
      "site.name",
      "site.logo",
      "site.contact.phone",
      "site.contact.email",
      "site.contact.address",
      "site.social.instagram",
      "site.social.facebook",
      "site.social.tiktok",
    ]),
  ]);

  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const siteName = String(siteSettings["site.name"] ?? "Kiraz Tasarım");
  // bgClass kept for compatibility but no longer emits a Tailwind bg class
  const bgClass = (_bg?: string) => "";
  const bgStyle = (bg?: string): React.CSSProperties | undefined =>
    bg === "primary"
      ? { backgroundColor: "color-mix(in srgb, var(--kt-primary) 12%, white)" }
      : bg === "cream"
      ? { backgroundColor: "var(--kt-surface, #fdfaf6)" }
      : undefined;

  return (
    <>
      <JsonLd
        data={localBusinessJsonLd({
          name: siteName,
          url: base,
          logo: siteSettings["site.logo"] ? `${base}${String(siteSettings["site.logo"])}` : undefined,
          phone: siteSettings["site.contact.phone"] ? String(siteSettings["site.contact.phone"]) : undefined,
          email: siteSettings["site.contact.email"] ? String(siteSettings["site.contact.email"]) : undefined,
          address: siteSettings["site.contact.address"] ? String(siteSettings["site.contact.address"]) : undefined,
          sameAs: [
            siteSettings["site.social.instagram"] ? String(siteSettings["site.social.instagram"]) : "",
            siteSettings["site.social.facebook"] ? String(siteSettings["site.social.facebook"]) : "",
            siteSettings["site.social.tiktok"] ? String(siteSettings["site.social.tiktok"]) : "",
          ].filter(Boolean),
        })}
      />

      {visible.map((s) => {
        switch (s.type) {
          case "hero": {
            const heroLayout = s.settings.heroLayout ?? "full-bleed";
            const accentLabel = s.settings.heroAccentLabel;
            const heroTitle = s.settings.title || banners[0]?.title || siteName;
            const heroSubtitle = s.settings.subtitle || banners[0]?.subtitle || "";
            const heroCta = s.settings.ctaText || banners[0]?.ctaText || "Koleksiyonu Keşfet";
            const heroCtaUrl = s.settings.ctaUrl || banners[0]?.link || "/urunler";

            if (heroLayout === "split") {
              return (
                <section key={s.id} style={{ borderBottom: "1px solid var(--kt-border, rgba(0,0,0,0.08))" }}>
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: 480 }}>
                    <div
                      className="flex flex-col justify-between p-10 lg:p-16 order-2 md:order-1"
                      style={{ borderRight: "1px solid var(--kt-border, rgba(0,0,0,0.08))", backgroundColor: "var(--kt-bg)" }}
                    >
                      <div>
                        {accentLabel && (
                          <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-6" style={{ color: "var(--kt-muted)" }}>
                            {accentLabel}
                          </p>
                        )}
                        <h1
                          className="font-display leading-[0.95] mb-0"
                          style={{
                            fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                            fontWeight: "var(--kt-display-weight, 400)",
                            fontStyle: "var(--kt-display-style, normal)",
                            textTransform: "var(--kt-display-transform, none)",
                            letterSpacing: "var(--kt-display-spacing, -0.02em)",
                            color: "var(--kt-heading)",
                          } as React.CSSProperties}
                        >
                          {heroTitle}
                        </h1>
                      </div>
                      <div className="flex items-end justify-between gap-4 mt-10">
                        <p className="text-sm leading-relaxed max-w-[280px]" style={{ color: "var(--kt-muted)" }}>
                          {heroSubtitle}
                        </p>
                        <Link
                          href={heroCtaUrl}
                          className="shrink-0 text-[11px] font-mono tracking-[0.15em] pb-1 transition hover:opacity-60 whitespace-nowrap"
                          style={{ borderBottom: "1px solid currentColor", color: "var(--kt-text)" }}
                        >
                          {heroCta.toUpperCase()} →
                        </Link>
                      </div>
                    </div>
                    <div className="relative min-h-[260px] order-1 md:order-2" style={{ backgroundColor: "var(--kt-card-img-bg, var(--kt-surface))" }}>
                      {banners[0]?.image && (
                        <Image src={banners[0].image} alt={banners[0].title} fill sizes="50vw" className="object-cover" priority />
                      )}
                    </div>
                  </div>
                </section>
              );
            }

            if (heroLayout === "editorial") {
              return (
                <section
                  key={s.id}
                  className="py-14 lg:py-24"
                  style={{ backgroundColor: "var(--kt-bg)", borderBottom: "1px solid var(--kt-border, rgba(0,0,0,0.08))" }}
                >
                  <div className="mx-auto px-4 lg:px-8" style={{ maxWidth: "var(--kt-page-width, 1280px)" }}>
                    {accentLabel && (
                      <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-6" style={{ color: "var(--kt-muted)" }}>
                        {accentLabel}
                      </p>
                    )}
                    <h1
                      className="font-display leading-[0.95] mb-10 max-w-[18ch]"
                      style={{
                        fontSize: "clamp(3rem, 7vw, 6rem)",
                        fontWeight: "var(--kt-display-weight, 400)",
                        fontStyle: "var(--kt-display-style, normal)",
                        textTransform: "var(--kt-display-transform, none)",
                        letterSpacing: "var(--kt-display-spacing, -0.02em)",
                        color: "var(--kt-heading)",
                      } as React.CSSProperties}
                    >
                      {heroTitle}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 max-w-4xl">
                      <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--kt-muted)" }}>
                        {heroSubtitle}
                      </p>
                      <Link
                        href={heroCtaUrl}
                        className="shrink-0 inline-block px-8 py-3 kt-btn font-medium transition whitespace-nowrap"
                        style={{ backgroundColor: "var(--kt-primary)", borderRadius: "var(--kt-radius, 6px)", color: "var(--kt-btn-text, #fff)" }}
                      >
                        {heroCta}
                      </Link>
                    </div>
                  </div>
                </section>
              );
            }

            return <HeroBanner key={s.id} slides={banners} />;
          }

          case "categories":
            return categories.length > 0 ? (
              <section key={s.id} className={`py-16 ${bgClass(s.settings.background)}`} style={bgStyle(s.settings.background)}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {(s.settings.title || s.settings.subtitle) && (
                    <div className="text-center mb-10">
                      {s.settings.title && (
                        <h2 className="font-display text-3xl sm:text-4xl mb-2" style={{ color: "var(--kt-heading)" }}>{s.settings.title}</h2>
                      )}
                      {s.settings.subtitle && <p className="text-sm" style={{ color: "var(--kt-muted)" }}>{s.settings.subtitle}</p>}
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((c, idx) => (
                      <Link key={c.id} href={`/kategori/${c.slug}`} className="group block">
                        <div
                          className="relative aspect-square rounded-md overflow-hidden mb-3"
                          style={{ backgroundColor: "var(--kt-card-img-bg, #f3f0eb)" }}
                        >
                          {c.image ? (
                            <Image
                              src={c.image}
                              alt={c.name}
                              fill
                              priority={idx < 3}
                              sizes="(min-width:1024px) 180px, (min-width:768px) 33vw, 50vw"
                              className="object-cover transition group-hover:scale-105"
                            />
                          ) : (
                            <div className="kt-img-placeholder w-full h-full flex items-center justify-center">
                              <span className="font-display text-2xl relative z-10" style={{ color: "var(--kt-muted)" }}>{c.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm text-center" style={{ color: "var(--kt-text)" }}>{c.name}</h3>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            ) : null;

          case "featured_products":
            return featured.length > 0 ? (
              <section key={s.id} className={`py-16 ${bgClass(s.settings.background)}`} style={bgStyle(s.settings.background)}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-end justify-between mb-10">
                    <div>
                      {s.settings.title && (
                        <h2 className="font-display text-3xl sm:text-4xl mb-2" style={{ color: "var(--kt-heading)" }}>{s.settings.title}</h2>
                      )}
                      {s.settings.subtitle && <p className="text-sm" style={{ color: "var(--kt-muted)" }}>{s.settings.subtitle}</p>}
                    </div>
                    <Link href="/urunler" className="text-sm flex items-center gap-1" style={{ color: "var(--kt-primary)" }}>
                      Tümünü gör <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {featured.map((p) => (
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
                </div>
              </section>
            ) : null;

          case "new_products":
            return newest.length > 0 ? (
              <section key={s.id} className={`py-16 ${bgClass(s.settings.background)}`} style={bgStyle(s.settings.background)}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-end justify-between mb-10">
                    <div>
                      {s.settings.title && (
                        <h2 className="font-display text-3xl sm:text-4xl mb-2" style={{ color: "var(--kt-heading)" }}>{s.settings.title}</h2>
                      )}
                      {s.settings.subtitle && <p className="text-sm" style={{ color: "var(--kt-muted)" }}>{s.settings.subtitle}</p>}
                    </div>
                    <Link href="/urunler" className="text-sm flex items-center gap-1" style={{ color: "var(--kt-primary)" }}>
                      Tümünü gör <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {newest.map((p) => (
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
                </div>
              </section>
            ) : null;

          case "rich_text":
            return (
              <section key={s.id} className={`py-16 ${bgClass(s.settings.background)}`} style={bgStyle(s.settings.background)}>
                <div
                  className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 ${
                    s.settings.textAlign === "center" ? "text-center" : ""
                  }`}
                >
                  {s.settings.title && (
                    <h2 className="font-display text-3xl sm:text-4xl mb-6" style={{ color: "var(--kt-heading)" }}>{s.settings.title}</h2>
                  )}
                  <div style={{ color: "var(--kt-text)" }}>
                    <RichText html={s.settings.content} className="prose max-w-none" />
                  </div>
                </div>
              </section>
            );

          case "image_text":
            return (
              <section key={s.id} className={`py-16 ${bgClass(s.settings.background)}`} style={bgStyle(s.settings.background)}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div
                    className={`flex flex-col md:flex-row gap-10 items-center ${
                      s.settings.imagePosition === "right" ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {s.settings.image && (
                      <div className="relative w-full md:w-1/2 aspect-[4/3] rounded-lg overflow-hidden" style={{ backgroundColor: "var(--kt-card-img-bg, #f3f0eb)" }}>
                        <Image
                          src={s.settings.image}
                          alt={s.settings.title ?? ""}
                          fill
                          sizes="(min-width:768px) 50vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-4">
                      {s.settings.title && (
                        <h2 className="font-display text-3xl sm:text-4xl" style={{ color: "var(--kt-heading)" }}>{s.settings.title}</h2>
                      )}
                      {s.settings.subtitle && <p style={{ color: "var(--kt-muted)" }}>{s.settings.subtitle}</p>}
                      {s.settings.ctaText && s.settings.ctaUrl && (
                        <Link
                          href={s.settings.ctaUrl}
                          className="inline-block px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-md font-medium transition"
                        >
                          {s.settings.ctaText}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );

          case "banner_cta":
            return s.settings.image ? (
              <section key={s.id} className="relative overflow-hidden">
                <div className="relative h-80 sm:h-96">
                  <Image
                    src={s.settings.image}
                    alt={s.settings.title ?? ""}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: (s.settings.overlayOpacity ?? 40) / 100 }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                    {s.settings.title && (
                      <h2 className="font-display text-4xl sm:text-5xl mb-3">{s.settings.title}</h2>
                    )}
                    {s.settings.subtitle && <p className="text-white/80 mb-6 max-w-lg">{s.settings.subtitle}</p>}
                    {s.settings.ctaText && s.settings.ctaUrl && (
                      <Link
                        href={s.settings.ctaUrl}
                        className="inline-block px-8 py-3 rounded-md font-medium transition"
                        style={{ backgroundColor: "var(--kt-surface)", color: "var(--kt-heading)" }}
                      >
                        {s.settings.ctaText}
                      </Link>
                    )}
                  </div>
                </div>
              </section>
            ) : null;

          case "spacer":
            return <div key={s.id} style={{ height: s.settings.height ?? 48 }} aria-hidden />;

          case "features":
            return (s.blocks?.length ?? 0) > 0 ? (
              <section key={s.id} className={`py-16 ${bgClass(s.settings.background)}`} style={bgStyle(s.settings.background)}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {(s.settings.title || s.settings.subtitle) && (
                    <div className="text-center mb-12">
                      {s.settings.title && (
                        <h2 className="font-display text-3xl sm:text-4xl mb-2" style={{ color: "var(--kt-heading)" }}>{s.settings.title}</h2>
                      )}
                      {s.settings.subtitle && <p style={{ color: "var(--kt-muted)" }}>{s.settings.subtitle}</p>}
                    </div>
                  )}
                  <div
                    className={`grid gap-8 ${
                      s.settings.columns === 2
                        ? "grid-cols-1 md:grid-cols-2"
                        : s.settings.columns === 4
                          ? "grid-cols-2 md:grid-cols-4"
                          : "grid-cols-1 md:grid-cols-3"
                    }`}
                  >
                    {s.blocks!.map((block) => (
                      <div key={block.id} className="text-center space-y-3">
                        {block.settings.icon && (
                          <div className="text-4xl">{block.settings.icon}</div>
                        )}
                        {block.settings.title && (
                          <h3 className="font-display text-xl" style={{ color: "var(--kt-heading)" }}>{block.settings.title}</h3>
                        )}
                        {block.settings.description && (
                          <p className="text-sm leading-relaxed" style={{ color: "var(--kt-muted)" }}>{block.settings.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null;

          case "testimonials":
            return (s.blocks?.length ?? 0) > 0 ? (
              <section key={s.id} className={`py-16 ${bgClass(s.settings.background)}`} style={bgStyle(s.settings.background)}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {(s.settings.title || s.settings.subtitle) && (
                    <div className="text-center mb-12">
                      {s.settings.title && (
                        <h2 className="font-display text-3xl sm:text-4xl mb-2" style={{ color: "var(--kt-heading)" }}>{s.settings.title}</h2>
                      )}
                      {s.settings.subtitle && <p style={{ color: "var(--kt-muted)" }}>{s.settings.subtitle}</p>}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {s.blocks!.map((block) => (
                      <div
                        key={block.id}
                        className="rounded-lg p-6 shadow-sm border"
                        style={{ backgroundColor: "var(--kt-surface)", borderColor: "var(--kt-border)" }}
                      >
                        {block.settings.rating && (
                          <div className="flex gap-0.5 mb-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                style={{ color: i < (block.settings.rating ?? 5) ? "var(--kt-accent, #d4ae6a)" : "var(--kt-border, #e2ddd6)" }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                        {block.settings.content && (
                          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--kt-text)" }}>{block.settings.content}</p>
                        )}
                        <div>
                          {block.settings.author && (
                            <p className="font-medium text-sm" style={{ color: "var(--kt-heading)" }}>{block.settings.author}</p>
                          )}
                          {block.settings.role && (
                            <p className="text-xs" style={{ color: "var(--kt-muted)" }}>{block.settings.role}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null;

          case "marquee":
            // "top" position marquees are rendered in the public layout above the header
            if (s.settings.position === "top") return null;
            return (
              <MarqueeBar
                key={s.id}
                text={s.settings.title ?? ""}
                separator={s.settings.marqueeSeparator}
                animated={s.settings.animated}
                speed={s.settings.marqueeSpeed}
                background={s.settings.background}
                textColor={s.settings.textColor}
                textSize={s.settings.textSize}
              />
            );

          case "newsletter":
            return (
              <section key={s.id} className={`py-16 ${bgClass(s.settings.background)}`} style={bgStyle(s.settings.background)}>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  {s.settings.title && (
                    <h2 className="font-display text-3xl sm:text-4xl mb-3" style={{ color: "var(--kt-heading)" }}>{s.settings.title}</h2>
                  )}
                  {s.settings.subtitle && <p className="mb-8" style={{ color: "var(--kt-muted)" }}>{s.settings.subtitle}</p>}
                  <NewsletterForm
                    placeholder={s.settings.placeholder}
                    buttonText={s.settings.buttonText}
                  />
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
