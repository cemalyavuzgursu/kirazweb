"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function updateProductStock(productId: string, stock: number): Promise<void> {
  await requireAdmin();
  await prisma.product.update({
    where: { id: productId },
    data: { stock },
  });
  revalidatePath("/admin/urunler/envanter");
}

export async function updateVariantStock(variantId: string, stock: number): Promise<void> {
  await requireAdmin();
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock },
  });
  revalidatePath("/admin/urunler/envanter");
}
