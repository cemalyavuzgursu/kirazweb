"use server";

import { revalidatePath } from "next/cache";
import { adminRedirect } from "@/lib/admin-redirect";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";
import { slugify } from "@/lib/slug";
import { deleteImage } from "@/lib/upload";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Ürün adı zorunlu"),
  slug: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(3),
  weight: z.coerce.number().min(0).optional().or(z.literal("")),
  vatRate: z.coerce.number().min(0).max(100).default(20),
  kdvExempt: z.coerce.boolean().default(false),
  brand: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  imagesJson: z.string().optional(), // JSON array of urls
});

export async function saveProduct(formData: FormData) {
  const session = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());

  const parsed = productSchema.safeParse({
    ...raw,
    isActive: raw.isActive === "on" || raw.isActive === "true",
    isFeatured: raw.isFeatured === "on" || raw.isFeatured === "true",
    kdvExempt: raw.kdvExempt === "on" || raw.kdvExempt === "true",
  });
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Geçersiz veri");
  }

  const data = parsed.data;
  const slug = data.slug && data.slug.length > 0 ? slugify(data.slug) : slugify(data.name);
  const images: { url: string }[] = data.imagesJson
    ? (JSON.parse(data.imagesJson) as string[]).map((url) => ({ url }))
    : [];

  const productData = {
    name: data.name,
    slug,
    shortDescription: data.shortDescription || null,
    description: data.description || null,
    sku: data.sku || null,
    price: data.price,
    compareAtPrice: data.compareAtPrice && data.compareAtPrice !== ("" as unknown) ? Number(data.compareAtPrice) : null,
    stock: data.stock,
    lowStockThreshold: data.lowStockThreshold,
    weight: data.weight && data.weight !== ("" as unknown) ? Number(data.weight) : null,
    vatRate: data.vatRate,
    kdvExempt: data.kdvExempt,
    brand: data.brand || null,
    categoryId: data.categoryId || null,
    isActive: data.isActive,
    isFeatured: data.isFeatured,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
  };

  let id = data.id;
  if (id) {
    await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        images: { deleteMany: {}, create: images.map((img, i) => ({ url: img.url, sortOrder: i })) },
      },
    });
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Product", entityId: id });
  } else {
    const created = await prisma.product.create({
      data: {
        ...productData,
        images: { create: images.map((img, i) => ({ url: img.url, sortOrder: i })) },
      },
    });
    id = created.id;
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Product", entityId: id });
  }

  revalidatePath("/");
  revalidatePath("/urunler");
  revalidatePath(`/urunler/${slug}`);
  revalidatePath("/admin/urunler");
  await adminRedirect("/admin/urunler");
}

export async function deleteProduct(formData: FormData) {
  const session = await requireAdmin(["products:delete"]);
  const id = formData.get("id") as string;
  if (!id) return;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!product) return;

  // Delete uploaded images from disk
  await Promise.all(product.images.map((img) => deleteImage(img.url)));

  await prisma.product.delete({ where: { id } });
  await logActivity({ userId: session.user.id, action: "DELETE", entity: "Product", entityId: id });
  revalidatePath("/admin/urunler");
  revalidatePath("/urunler");
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const product = await prisma.product.findUnique({ where: { id }, select: { isActive: true } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
  revalidatePath("/admin/urunler");
  revalidatePath("/urunler");
}
