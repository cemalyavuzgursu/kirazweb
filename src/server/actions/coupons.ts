"use server";

import { revalidatePath } from "next/cache";
import { adminRedirect } from "@/lib/admin-redirect";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { CouponType } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";

const couponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(2),
  type: z.nativeEnum(CouponType),
  value: z.coerce.number().min(0),
  minSubtotal: z.coerce.number().min(0).optional().or(z.literal("")),
  usageLimit: z.coerce.number().int().min(0).optional().or(z.literal("")),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
});

export async function saveCoupon(formData: FormData) {
  const session = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = couponSchema.parse({
    ...raw,
    isActive: raw.isActive === "on" || raw.isActive === "true",
  });

  const data = {
    code: parsed.code.toUpperCase(),
    type: parsed.type,
    value: parsed.value,
    minSubtotal: parsed.minSubtotal && parsed.minSubtotal !== ("" as unknown) ? Number(parsed.minSubtotal) : null,
    usageLimit: parsed.usageLimit && parsed.usageLimit !== ("" as unknown) ? Number(parsed.usageLimit) : null,
    startsAt: parsed.startsAt ? new Date(parsed.startsAt) : null,
    endsAt: parsed.endsAt ? new Date(parsed.endsAt) : null,
    isActive: parsed.isActive,
  };

  if (parsed.id) {
    await prisma.coupon.update({ where: { id: parsed.id }, data });
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Coupon", entityId: parsed.id });
  } else {
    const created = await prisma.coupon.create({ data });
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Coupon", entityId: created.id });
  }

  revalidatePath("/admin/kuponlar");
  await adminRedirect("/admin/kuponlar");
}

export async function deleteCoupon(formData: FormData) {
  const session = await requireAdmin(["coupons:manage"]);
  const id = formData.get("id") as string;
  await prisma.coupon.delete({ where: { id } });
  await logActivity({ userId: session.user.id, action: "DELETE", entity: "Coupon", entityId: id });
  revalidatePath("/admin/kuponlar");
}
