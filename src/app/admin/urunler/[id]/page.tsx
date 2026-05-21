import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { ProductForm } from "../_components/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const { id } = await params;

  const isNew = id === "yeni";

  const [product, categories, brandRows] = await Promise.all([
    isNew
      ? null
      : prisma.product.findUnique({
          where: { id },
          include: { images: { orderBy: { sortOrder: "asc" } } },
        }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
  ]);
  const brands = brandRows.map((r) => r.brand as string);

  if (!isNew && !product) notFound();

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title={isNew ? "Yeni Ürün" : product!.name} />
      <ProductForm
        brands={brands}
        product={product ? {
          id: product.id,
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          description: product.description,
          sku: product.sku,
          price: product.price.toString(),
          compareAtPrice: product.compareAtPrice?.toString() ?? "",
          stock: product.stock,
          lowStockThreshold: product.lowStockThreshold,
          weight: product.weight?.toString() ?? "",
          vatRate: product.vatRate.toString(),
          kdvExempt: product.kdvExempt,
          brand: product.brand,
          categoryId: product.categoryId,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          images: product.images.map((i) => i.url),
        } : undefined}
        categories={categories}
      />
    </AdminShell>
  );
}
