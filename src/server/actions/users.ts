"use server";

import { revalidatePath } from "next/cache";
import { adminRedirect } from "@/lib/admin-redirect";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";

const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string().min(1),
  roleId: z.string().min(1, "Rol seçimi zorunlu"),
  password: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
});

export async function saveUser(formData: FormData) {
  const session = await requireAdmin(["users:manage"]);
  const raw = Object.fromEntries(formData.entries());
  const parsed = userSchema.parse({
    ...raw,
    isActive: raw.isActive === "on" || raw.isActive === "true",
  });

  const data: Record<string, unknown> = {
    email: parsed.email.toLowerCase(),
    name: parsed.name,
    roleId: parsed.roleId,
    isActive: parsed.isActive,
  };

  if (parsed.password && parsed.password.length >= 8) {
    data.passwordHash = await bcrypt.hash(parsed.password, 12);
  } else if (!parsed.id) {
    throw new Error("Yeni kullanıcı için en az 8 karakterli şifre gereklidir");
  }

  if (parsed.id) {
    await prisma.user.update({ where: { id: parsed.id }, data });
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "User", entityId: parsed.id });
  } else {
    const created = await prisma.user.create({ data: data as never });
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "User", entityId: created.id });
  }

  revalidatePath("/admin/kullanicilar");
  await adminRedirect("/admin/kullanicilar");
}

export async function deleteUser(formData: FormData) {
  const session = await requireAdmin(["users:manage"]);
  const id = formData.get("id") as string;
  if (id === session.user.id) throw new Error("Kendi hesabınızı silemezsiniz");
  await prisma.user.delete({ where: { id } });
  await logActivity({ userId: session.user.id, action: "DELETE", entity: "User", entityId: id });
  revalidatePath("/admin/kullanicilar");
}
