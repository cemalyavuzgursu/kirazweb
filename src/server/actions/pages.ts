"use server";

import { revalidatePath } from "next/cache";
import { adminRedirect } from "@/lib/admin-redirect";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";
import { slugify } from "@/lib/slug";

const pageSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  content: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isPublished: z.coerce.boolean().default(true),
});

export async function savePage(formData: FormData) {
  const session = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = pageSchema.parse({
    ...raw,
    isPublished: raw.isPublished === "on" || raw.isPublished === "true",
  });

  const slug = slugify(parsed.slug);
  const data = {
    slug,
    title: parsed.title,
    content: parsed.content || "",
    seoTitle: parsed.seoTitle || null,
    seoDescription: parsed.seoDescription || null,
    isPublished: parsed.isPublished,
  };

  let id = parsed.id;
  if (id) {
    await prisma.page.update({ where: { id }, data });
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Page", entityId: id });
  } else {
    const created = await prisma.page.create({ data });
    id = created.id;
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Page", entityId: id });
  }

  revalidatePath(`/${slug}`);
  revalidatePath("/admin/sayfalar");
  await adminRedirect("/admin/sayfalar");
}

export async function deletePage(formData: FormData) {
  const session = await requireAdmin(["content:delete"]);
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.page.delete({ where: { id } });
  await logActivity({ userId: session.user.id, action: "DELETE", entity: "Page", entityId: id });
  revalidatePath("/admin/sayfalar");
}

const redirectSchema = z.object({
  id: z.string().optional(),
  fromPath: z.string().min(1).startsWith("/"),
  toPath: z.string().min(1),
  statusCode: z.coerce.number().int().refine((n) => n === 301 || n === 302),
  isActive: z.coerce.boolean().default(true),
});

export async function saveRedirect(formData: FormData) {
  const session = await requireAdmin(["seo:manage"]);
  const raw = Object.fromEntries(formData.entries());
  const parsed = redirectSchema.parse({
    ...raw,
    isActive: raw.isActive === "on" || raw.isActive === "true",
  });
  const data = {
    fromPath: parsed.fromPath,
    toPath: parsed.toPath,
    statusCode: parsed.statusCode,
    isActive: parsed.isActive,
  };
  if (parsed.id) {
    await prisma.redirect.update({ where: { id: parsed.id }, data });
  } else {
    await prisma.redirect.create({ data });
  }
  await logActivity({ userId: session.user.id, action: "SAVE", entity: "Redirect" });
  revalidatePath("/admin/seo");
}

export async function deleteRedirect(formData: FormData) {
  const session = await requireAdmin(["seo:manage"]);
  const id = formData.get("id") as string;
  await prisma.redirect.delete({ where: { id } });
  await logActivity({ userId: session.user.id, action: "DELETE", entity: "Redirect", entityId: id });
  revalidatePath("/admin/seo");
}
