import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { RichText } from "@/components/public/rich-text";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.isPublished) return buildMetadata({ title: "Sayfa bulunamadı", noindex: true });
  return buildMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
    path: `/${page.slug}`,
    ogImage: page.ogImage ?? undefined,
  });
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.isPublished) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <nav className="text-xs flex items-center gap-1 mb-6" style={{ color: "var(--kt-muted)" }}>
        <Link href="/" className="hover:underline" style={{ color: "var(--kt-muted)" }}>Ana Sayfa</Link>
        <ChevronRight className="h-3 w-3" />
        <span style={{ color: "var(--kt-text)" }}>{page.title}</span>
      </nav>
      <h1 className="font-display text-4xl mb-8" style={{ color: "var(--kt-heading)" }}>{page.title}</h1>
      <RichText html={page.content} />
    </article>
  );
}
