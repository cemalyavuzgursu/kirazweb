"use server";

import { revalidatePath } from "next/cache";
import { adminRedirect } from "@/lib/admin-redirect";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";
import { slugify } from "@/lib/slug";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function saveCategory(formData: FormData) {
  const session = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = categorySchema.parse({
    ...raw,
    isActive: raw.isActive === "on" || raw.isActive === "true",
  });

  const slug = parsed.slug ? slugify(parsed.slug) : slugify(parsed.name);
  const data = {
    name: parsed.name,
    slug,
    description: parsed.description || null,
    image: parsed.image || null,
    parentId: parsed.parentId || null,
    sortOrder: parsed.sortOrder,
    isActive: parsed.isActive,
    seoTitle: parsed.seoTitle || null,
    seoDescription: parsed.seoDescription || null,
  };

  let id = parsed.id;
  if (id) {
    await prisma.category.update({ where: { id }, data });
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Category", entityId: id });
  } else {
    const created = await prisma.category.create({ data });
    id = created.id;
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Category", entityId: id });
  }

  revalidatePath("/");
  revalidatePath("/admin/kategoriler");
  await adminRedirect("/admin/kategoriler");
}

export async function createCategoryQuick(formData: FormData): Promise<{ id: string; name: string }> {
  await requireAdmin();
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) throw new Error("Ad zorunlu");
  const slug = slugify(name);
  const category = await prisma.category.create({
    data: { name, slug, isActive: true },
  });
  revalidatePath("/admin/urunler");
  revalidatePath("/");
  return { id: category.id, name: category.name };
}

export async function deleteCategory(formData: FormData) {
  const session = await requireAdmin(["content:delete"]);
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.category.delete({ where: { id } });
  await logActivity({ userId: session.user.id, action: "DELETE", entity: "Category", entityId: id });
  revalidatePath("/admin/kategoriler");
  revalidatePath("/");
}
