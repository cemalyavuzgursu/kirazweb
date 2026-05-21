"use server";

import { revalidatePath } from "next/cache";
import { adminRedirect } from "@/lib/admin-redirect";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";
import { slugify } from "@/lib/slug";

const blogPostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function saveBlogPost(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());

  const parsed = blogPostSchema.parse({
    ...raw,
    isPublished: raw.isPublished === "on" || raw.isPublished === "true",
  });

  const slug = slugify(parsed.slug);

  const slugConflict = await prisma.blogPost.findUnique({ where: { slug } });
  if (slugConflict && slugConflict.id !== parsed.id) {
    throw new Error(`"${slug}" slug'ı zaten kullanılıyor.`);
  }

  let id = parsed.id;

  if (id) {
    const current = await prisma.blogPost.findUnique({ where: { id } });
    const publishedAt = parsed.isPublished
      ? (current?.publishedAt ?? new Date())
      : null;

    await prisma.blogPost.update({
      where: { id },
      data: {
        title: parsed.title,
        slug,
        excerpt: parsed.excerpt || null,
        content: parsed.content || null,
        coverImage: parsed.coverImage || null,
        isPublished: parsed.isPublished,
        publishedAt,
        seoTitle: parsed.seoTitle || null,
        seoDescription: parsed.seoDescription || null,
      },
    });
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "BlogPost", entityId: id });
  } else {
    const created = await prisma.blogPost.create({
      data: {
        title: parsed.title,
        slug,
        excerpt: parsed.excerpt || null,
        content: parsed.content || null,
        coverImage: parsed.coverImage || null,
        isPublished: parsed.isPublished,
        publishedAt: parsed.isPublished ? new Date() : null,
        seoTitle: parsed.seoTitle || null,
        seoDescription: parsed.seoDescription || null,
      },
    });
    id = created.id;
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "BlogPost", entityId: id });
  }

  revalidatePath("/admin/blog/yazilar");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  await adminRedirect("/admin/blog/yazilar");
}

export async function deleteBlogPost(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  await prisma.blogPost.delete({ where: { id } });
  await logActivity({ userId: session.user.id, action: "DELETE", entity: "BlogPost", entityId: id });
  revalidatePath("/admin/blog/yazilar");
  revalidatePath("/blog");
  if (post?.slug) revalidatePath(`/blog/${post.slug}`);
  await adminRedirect("/admin/blog/yazilar");
}
