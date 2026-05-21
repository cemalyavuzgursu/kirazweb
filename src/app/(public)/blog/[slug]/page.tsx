import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return buildMetadata({ title: "Yazı bulunamadı", noindex: true });
  return buildMetadata({
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    path: `/blog/${post.slug}`,
    ogImage: post.ogImage ?? undefined,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post || !post.isPublished) notFound();

  // Content is admin-authored HTML — trusted source, not user input.
  const contentHtml = post.content ?? "";

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm mb-8 transition"
        style={{ color: "var(--kt-muted)" }}
      >
        &larr; Blog&apos;a Dön
      </Link>

      {post.coverImage && (
        <div className="relative aspect-video rounded-lg overflow-hidden mb-8" style={{ backgroundColor: "var(--kt-surface)" }}>
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(min-width:768px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <header className="mb-8">
        <p className="text-sm mb-3" style={{ color: "var(--kt-muted)" }}>
          {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl" style={{ color: "var(--kt-heading)" }}>{post.title}</h1>
        {post.excerpt && (
          <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--kt-muted)" }}>{post.excerpt}</p>
        )}
      </header>

      <div
        className="prose prose-sm sm:prose max-w-none prose-headings:font-display"
        style={{ color: "var(--kt-heading)" }}
        // Admin-authored content only — not user input
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  );
}
