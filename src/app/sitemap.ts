import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const staticRoutes = [
    { url: `${base}/`, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/urunler`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${base}/hakkimizda`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${base}/iletisim`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${base}/sss`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${base}/teslimat-iade`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${base}/gizlilik`, changeFrequency: "yearly" as const, priority: 0.2 },
    { url: `${base}/kvkk`, changeFrequency: "yearly" as const, priority: 0.2 },
    { url: `${base}/mesafeli-satis`, changeFrequency: "yearly" as const, priority: 0.2 },
  ];

  const [products, categories, pages] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.page.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
  ]).catch(() => [[], [], []] as const);

  const productRoutes = products.map((p) => ({
    url: `${base}/urunler/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${base}/kategori/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const pageRoutes = pages
    .filter((p) => !["hakkimizda", "iletisim", "sss", "teslimat-iade", "gizlilik", "kvkk", "mesafeli-satis"].includes(p.slug))
    .map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...pageRoutes];
}
