import { prisma } from "@/lib/db";
import { buildMetadata, faqJsonLd, JsonLd } from "@/lib/seo";
import { RichText } from "@/components/public/rich-text";
import { FaqAccordion } from "@/components/public/faq-accordion";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await prisma.page.findUnique({ where: { slug: "sss" } });
  return buildMetadata({
    title: page?.seoTitle ?? "Sıkça Sorulan Sorular",
    description: page?.seoDescription ?? undefined,
    path: "/sss",
  });
}

export default async function FAQPage() {
  const [page, faqItems] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "sss" } }),
    prisma.faqItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return (
    <>
      {faqItems.length > 0 && (
        <JsonLd
          data={faqJsonLd(faqItems.map((f) => ({ question: f.question, answer: f.answer })))}
        />
      )}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-display text-4xl mb-10" style={{ color: "var(--kt-heading)" }}>
          {page?.title ?? "Sıkça Sorulan Sorular"}
        </h1>

        {faqItems.length > 0 && (
          <section className="mb-12">
            <FaqAccordion items={faqItems} />
          </section>
        )}

        {page?.content && (
          <RichText html={page.content} />
        )}
      </article>
    </>
  );
}
