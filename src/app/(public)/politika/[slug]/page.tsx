import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { RichText } from "@/components/public/rich-text";

export const revalidate = 3600;

const SLUG_MAP: Record<string, { key: string; title: string; path: string }> = {
  iade: {
    key: "policy.return",
    title: "İade ve Para İadesi Politikası",
    path: "/politika/iade",
  },
  gizlilik: {
    key: "policy.privacy",
    title: "Gizlilik Politikası",
    path: "/politika/gizlilik",
  },
  "hizmet-sartlari": {
    key: "policy.terms",
    title: "Hizmet Şartları",
    path: "/politika/hizmet-sartlari",
  },
  kargo: {
    key: "policy.shipping",
    title: "Kargo Politikası",
    path: "/politika/kargo",
  },
  iletisim: {
    key: "policy.contact",
    title: "İletişim Bilgileri",
    path: "/politika/iletisim",
  },
};

export async function generateStaticParams() {
  return Object.keys(SLUG_MAP).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = SLUG_MAP[slug];
  if (!meta) return buildMetadata({ title: "Sayfa bulunamadı", noindex: true });
  return buildMetadata({ title: meta.title, path: meta.path });
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = SLUG_MAP[slug];
  if (!meta) notFound();

  const setting = await prisma.setting.findUnique({ where: { key: meta.key } });
  const content = setting?.value ? String(setting.value) : null;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <nav className="text-xs flex items-center gap-1 mb-6" style={{ color: "var(--kt-muted)", opacity: 0.6 }}>
        <Link href="/" style={{ color: "var(--kt-muted)" }}>
          Ana Sayfa
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span style={{ color: "var(--kt-muted)" }}>{meta.title}</span>
      </nav>
      <h1 className="font-display text-4xl mb-8" style={{ color: "var(--kt-heading)" }}>{meta.title}</h1>
      {content ? (
        <RichText html={content} />
      ) : (
        <p className="italic" style={{ color: "var(--kt-muted)" }}>Bu politika henüz oluşturulmamıştır.</p>
      )}
    </article>
  );
}
