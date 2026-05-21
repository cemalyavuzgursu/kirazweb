import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { BlogForm } from "./_blog-form";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const { id } = await params;
  const isNew = id === "yeni";

  const post = isNew
    ? null
    : await prisma.blogPost.findUnique({ where: { id } });

  if (!isNew && !post) notFound();

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title={isNew ? "Yeni Yazı" : (post!.title || "Yazıyı Düzenle")} />
      <BlogForm
        post={
          post
            ? {
                id: post.id,
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                content: post.content,
                coverImage: post.coverImage,
                isPublished: post.isPublished,
                seoTitle: post.seoTitle,
                seoDescription: post.seoDescription,
              }
            : undefined
        }
        isNew={isNew}
      />
    </AdminShell>
  );
}
