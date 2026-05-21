"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-session";

export type ToggleWishlistResult =
  | { ok: true; isFav: boolean }
  | { error: "login_required" }
  | { error: string };

export async function toggleWishlist(productId: string): Promise<ToggleWishlistResult> {
  const session = await getCustomerSession();
  if (!session) return { error: "login_required" };

  try {
    const existing = await prisma.wishlist.findUnique({
      where: { customerId_productId: { customerId: session.customerId, productId } },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { customerId_productId: { customerId: session.customerId, productId } },
      });
      const hdrs = await headers();
      const pathname = hdrs.get("x-pathname") ?? "/";
      revalidatePath(pathname);
      revalidatePath("/hesabim/favoriler");
      return { ok: true, isFav: false };
    } else {
      await prisma.wishlist.create({
        data: { customerId: session.customerId, productId },
      });
      const hdrs = await headers();
      const pathname = hdrs.get("x-pathname") ?? "/";
      revalidatePath(pathname);
      revalidatePath("/hesabim/favoriler");
      return { ok: true, isFav: true };
    }
  } catch (err) {
    console.error("toggleWishlist error", err);
    return { error: "Bir hata oluştu" };
  }
}

export async function getWishlistIds(): Promise<string[]> {
  const session = await getCustomerSession();
  if (!session) return [];

  try {
    const items = await prisma.wishlist.findMany({
      where: { customerId: session.customerId },
      select: { productId: true },
    });
    return items.map((i) => i.productId);
  } catch {
    return [];
  }
}
