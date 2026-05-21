"use server";

import { revalidatePath } from "next/cache";
import { adminRedirect } from "@/lib/admin-redirect";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";
import { CampaignType } from "@prisma/client";

const campaignSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Kampanya adı zorunlu"),
  description: z.string().optional(),
  type: z.nativeEnum(CampaignType),
  discountValue: z.coerce.number().min(0).optional().or(z.literal("")),
  minQuantity: z.coerce.number().int().min(1).optional().or(z.literal("")),
  freeQuantity: z.coerce.number().int().min(1).optional().or(z.literal("")),
  minSubtotal: z.coerce.number().min(0).optional().or(z.literal("")),
  categoryId: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
  priority: z.coerce.number().int().default(0),
});

export async function saveCampaign(formData: FormData) {
  const session = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const result = campaignSchema.safeParse({
    ...raw,
    isActive: raw.isActive === "on" || raw.isActive === "true",
  });
  if (!result.success) {
    const id = raw.id as string | undefined;
    const base = id ? `/admin/kampanyalar/${id}` : "/admin/kampanyalar/yeni";
    const msg = result.error.errors.map((e) => e.message).join(", ");
    await adminRedirect(`${base}?error=${encodeURIComponent(msg)}`);
  }
  const data = result.data!;

  const payload = {
    name: data.name,
    description: data.description || null,
    type: data.type,
    discountValue: data.discountValue && data.discountValue !== ("" as unknown) ? Number(data.discountValue) : null,
    minQuantity: data.minQuantity && data.minQuantity !== ("" as unknown) ? Number(data.minQuantity) : null,
    freeQuantity: data.freeQuantity && data.freeQuantity !== ("" as unknown) ? Number(data.freeQuantity) : null,
    minSubtotal: data.minSubtotal && data.minSubtotal !== ("" as unknown) ? Number(data.minSubtotal) : null,
    categoryId: data.categoryId || null,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    endsAt: data.endsAt ? new Date(data.endsAt) : null,
    isActive: data.isActive,
    priority: data.priority,
  };

  let id = data.id;
  if (id) {
    await prisma.campaign.update({ where: { id }, data: payload });
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Campaign", entityId: id });
  } else {
    const created = await prisma.campaign.create({ data: payload });
    id = created.id;
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Campaign", entityId: id });
  }

  revalidatePath("/admin/kampanyalar");
  await adminRedirect("/admin/kampanyalar");
}

export async function deleteCampaign(formData: FormData) {
  const session = await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.campaign.delete({ where: { id } });
  await logActivity({ userId: session.user.id, action: "DELETE", entity: "Campaign", entityId: id });
  revalidatePath("/admin/kampanyalar");
}

export async function toggleCampaign(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const campaign = await prisma.campaign.findUnique({ where: { id }, select: { isActive: true } });
  if (!campaign) return;
  await prisma.campaign.update({ where: { id }, data: { isActive: !campaign.isActive } });
  revalidatePath("/admin/kampanyalar");
}
