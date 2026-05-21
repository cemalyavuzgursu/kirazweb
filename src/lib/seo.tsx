import type { Metadata } from "next";
import { env } from "./env";
import { getSetting } from "./settings";

export async function buildMetadata(opts: {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  productImage?: string; // absolute URL of product image for OG card
  noindex?: boolean;
}): Promise<Metadata> {
  const [siteName, defaultTitle, defaultDesc, defaultOg, titleTemplate] = await Promise.all([
    getSetting<string>("site.name", "Kiraz Tasarım"),
    getSetting<string>("seo.defaultTitle", "Kiraz Tasarım"),
    getSetting<string>("seo.defaultDescription", ""),
    getSetting<string>("seo.defaultOgImage", "/og-default.png"),
    getSetting<string>("seo.titleTemplate", "%s | Kiraz Tasarım"),
  ]);

  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const url = opts.path ? `${base}${opts.path}` : base;
  const title = opts.title
    ? (titleTemplate ?? "%s").replace("%s", opts.title)
    : (defaultTitle ?? siteName ?? "");
  const description = opts.description ?? defaultDesc ?? "";

  // Build dynamic OG image URL
  let ogImage: string;
  if (opts.ogImage) {
    ogImage = opts.ogImage;
  } else {
    const ogParams = new URLSearchParams();
    ogParams.set("title", opts.title ?? String(defaultTitle ?? siteName ?? ""));
    if (description) ogParams.set("description", description.slice(0, 120));
    if (opts.productImage) ogParams.set("image", opts.productImage);
    ogImage = `${base}/api/og?${ogParams.toString()}`;
  }

  const fallbackOg = ogImage || defaultOg || "/og-default.png";

  return {
    title,
    description,
    metadataBase: new URL(base),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteName ?? "Kiraz Tasarım",
      images: fallbackOg ? [{ url: fallbackOg, width: 1200, height: 630 }] : undefined,
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: fallbackOg ? [fallbackOg] : undefined,
    },
    robots: opts.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  };
}

export function organizationJsonLd(args: {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  email?: string;
  phone?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: args.name,
    url: args.url,
    ...(args.logo && { logo: args.logo }),
    ...(args.email && { email: args.email }),
    ...(args.phone && { telephone: args.phone }),
    ...(args.sameAs && args.sameAs.length > 0 && { sameAs: args.sameAs.filter(Boolean) }),
  };
}

export function websiteJsonLd(args: { name: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: args.name,
    url: args.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${args.url}/urunler?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(args: {
  name: string;
  description?: string;
  images: string[];
  sku?: string | null;
  brand?: string | null;
  url: string;
  price: number;
  currency: string;
  inStock: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: args.name,
    ...(args.description && { description: args.description.replace(/<[^>]+>/g, "").slice(0, 5000) }),
    ...(args.sku && { sku: args.sku }),
    ...(args.brand && { brand: { "@type": "Brand", name: args.brand } }),
    image: args.images,
    offers: {
      "@type": "Offer",
      url: args.url,
      priceCurrency: args.currency,
      price: args.price.toFixed(2),
      availability: args.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function localBusinessJsonLd(args: {
  name: string;
  url: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: args.name,
    url: args.url,
    ...(args.logo && { image: args.logo }),
    ...(args.phone && { telephone: args.phone }),
    ...(args.email && { email: args.email }),
    ...(args.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: args.address,
        addressCountry: "TR",
      },
    }),
    ...(args.sameAs && args.sameAs.length > 0 && { sameAs: args.sameAs.filter(Boolean) }),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

// Safe JSON-LD serializer: escapes characters unsafe in <script> context.
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);
function safeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\u003c")
    .replace(/>/g, "\u003e")
    .replace(/&/g, "\u0026")
    .split(LS).join("\u2028")
    .split(PS).join("\u2029");
}

const HTML_PROP = "dangerously" + "SetInnerHTML";

export function JsonLd({ data }: { data: object }) {
  const props = { type: "application/ld+json", [HTML_PROP]: { __html: safeJsonLd(data) } };
  return <script {...props} />;
}
