import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildMetadata({ title: "Blog", description: "Son yazılar", path: "/blog" });
}

export default async function BlogListPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl sm:text-5xl mb-3" style={{ color: "var(--kt-heading)" }}>Blog</h1>
        <p style={{ color: "var(--kt-muted)" }}>Tasarım, ilham ve daha fazlası</p>
      </div>

      {posts.length === 0 && (
        <p className="text-center py-16" style={{ color: "var(--kt-muted)" }}>Henüz yayınlanmış yazı yok.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post.id} className="group flex flex-col">
            <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-lg mb-4" style={{ backgroundColor: "var(--kt-surface)" }}>
              {post.coverImage ? (
                <div className="relative aspect-video">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center" style={{ backgroundColor: "var(--kt-surface)" }}>
                  <span className="font-display text-3xl" style={{ color: "var(--kt-muted)" }}>{post.title.charAt(0)}</span>
                </div>
              )}
            </Link>

            <div className="flex flex-col flex-1">
              <p className="text-xs mb-2" style={{ color: "var(--kt-muted)" }}>
                {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
              </p>
              <h2 className="font-display text-xl mb-2 transition" style={{ color: "var(--kt-heading)" }}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              {post.excerpt && (
                <p className="text-sm line-clamp-3 flex-1" style={{ color: "var(--kt-muted)" }}>{post.excerpt}</p>
              )}
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 text-sm font-medium"
                style={{ color: "var(--kt-primary)" }}
              >
                Devamını Oku &rarr;
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
