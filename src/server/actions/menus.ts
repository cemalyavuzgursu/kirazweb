"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { MenuLocation } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";
import { adminRedirect } from "@/lib/admin-redirect";

const menuItemSchema = z.object({
  id: z.string().optional(),
  location: z.nativeEnum(MenuLocation),
  label: z.string().min(1, "Etiket zorunludur"),
  url: z.string().min(1, "URL zorunludur"),
  parentId: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function saveMenuItem(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());

  const parsed = menuItemSchema.parse({
    id: raw.id || undefined,
    location: raw.location,
    label: raw.label,
    url: raw.url,
    parentId: raw.parentId || undefined,
    sortOrder: raw.sortOrder || 0,
    isActive: raw.isActive === "on" || raw.isActive === "true",
  });

  const data = {
    location: parsed.location,
    label: parsed.label,
    url: parsed.url,
    parentId: parsed.parentId ?? null,
    sortOrder: parsed.sortOrder,
    isActive: parsed.isActive,
  };

  if (parsed.id) {
    await prisma.navMenu.update({ where: { id: parsed.id }, data });
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "NavMenu", entityId: parsed.id });
  } else {
    const created = await prisma.navMenu.create({ data });
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "NavMenu", entityId: created.id });
  }

  revalidatePath("/admin/menuler");
  revalidatePath("/", "layout");
  await adminRedirect("/admin/menuler");
}

export async function deleteMenuItem(id: string): Promise<void> {
  const session = await requireAdmin();

  await prisma.navMenu.deleteMany({ where: { parentId: id } });
  await prisma.navMenu.delete({ where: { id } });

  await logActivity({ userId: session.user.id, action: "DELETE", entity: "NavMenu", entityId: id });

  revalidatePath("/admin/menuler");
  revalidatePath("/", "layout");
  await adminRedirect("/admin/menuler");
}
