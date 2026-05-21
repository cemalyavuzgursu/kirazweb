"use server";

import { revalidatePath } from "next/cache";
import { adminRedirect } from "@/lib/admin-redirect";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";
import { ALL_PERMISSIONS } from "@/lib/permissions";

const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Rol adı zorunlu").max(50),
  permissions: z.array(z.string()).default([]),
});

export async function saveRole(formData: FormData) {
  const session = await requireAdmin(["roles:manage"]);

  const rawPermissions = formData.getAll("permissions") as string[];
  const validPermissions = rawPermissions.filter((p) => ALL_PERMISSIONS.includes(p));

  const parsed = roleSchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    permissions: validPermissions,
  });

  if (parsed.id) {
    const existing = await prisma.role.findUnique({ where: { id: parsed.id } });
    if (!existing) throw new Error("Rol bulunamadı");
    if (existing.isSystem) throw new Error("Sistem rolleri düzenlenemez");

    await prisma.role.update({
      where: { id: parsed.id },
      data: { name: parsed.name, permissions: parsed.permissions },
    });
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Role", entityId: parsed.id });
  } else {
    const created = await prisma.role.create({
      data: { name: parsed.name, permissions: parsed.permissions },
    });
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Role", entityId: created.id });
  }

  revalidatePath("/admin/roller");
  await adminRedirect("/admin/roller");
}

export async function deleteRole(formData: FormData) {
  const session = await requireAdmin(["roles:manage"]);
  const id = formData.get("id") as string;
  if (!id) return;

  const role = await prisma.role.findUnique({ where: { id }, select: { isSystem: true, name: true } });
  if (!role) return;
  if (role.isSystem) throw new Error("Sistem rolleri silinemez");

  const userCount = await prisma.user.count({ where: { roleId: id } });
  if (userCount > 0) throw new Error(`Bu role atanmış ${userCount} kullanıcı var. Önce kullanıcıları farklı bir role taşıyın.`);

  await prisma.role.delete({ where: { id } });
  await logActivity({ userId: session.user.id, action: "DELETE", entity: "Role", entityId: id });
  revalidatePath("/admin/roller");
}
