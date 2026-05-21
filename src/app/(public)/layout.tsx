import Script from "next/script";
import { headers } from "next/headers";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { CookieBanner } from "@/components/public/cookie-banner";
import { AnnouncementBar } from "@/components/public/announcement-bar";
import { MarqueeBar } from "@/components/public/marquee-bar";
import { PreviewListener } from "@/components/public/preview-listener";
import { Analytics } from "@/components/public/analytics";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import { getPublishedThemeSettings, getDraftData } from "@/server/actions/theme";
import { getSections } from "@/server/actions/editor";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const isPreview = hdrs.get("x-preview-mode") === "1";
  const draft = isPreview ? await getDraftData() : null;

  const allSections = draft?.homepageSections ?? await getSections();
  const topMarquees = allSections.filter(
    (s) => s.type === "marquee" && s.visible && s.settings.position === "top",
  );

  const [s, published] = await Promise.all([
    getSettings([
      "site.name",
      "site.logo",
      "site.contact.email",
      "site.contact.phone",
      "site.social.instagram",
      "site.social.facebook",
      "site.social.tiktok",
      "seo.googleTagManagerId",
      "seo.googleAnalyticsId",
    ]),
    getPublishedThemeSettings(),
  ]);

  const { globalSettings, themeSettings } = draft
    ? { globalSettings: draft.globalSettings, themeSettings: draft.themeSettings }
    : published;

  const sanitizeTrackingId = (raw: unknown) =>
    raw ? String(raw).trim().replace(/[^A-Za-z0-9-]/g, "") : "";
  const gtmId = sanitizeTrackingId(s["seo.googleTagManagerId"]);
  const ga4Id = sanitizeTrackingId(s["seo.googleAnalyticsId"]);

  const url = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const name = String(s["site.name"] ?? "Kiraz Tasarım");

  const bar = globalSettings.announcementBar;

  return (
    <div className="kt-public">
      {gtmId && (
        <Script
          id="gtm"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
        />
      )}
      {!gtmId && ga4Id && (
        <Script
          id="ga4"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
        />
      )}

      <JsonLd
        data={organizationJsonLd({
          name,
          url,
          logo: s["site.logo"] ? `${url}${String(s["site.logo"])}` : undefined,
          email: s["site.contact.email"] ? String(s["site.contact.email"]) : undefined,
          phone: s["site.contact.phone"] ? String(s["site.contact.phone"]) : undefined,
          sameAs: [
            s["site.social.instagram"] ? String(s["site.social.instagram"]) : "",
            s["site.social.facebook"] ? String(s["site.social.facebook"]) : "",
            s["site.social.tiktok"] ? String(s["site.social.tiktok"]) : "",
          ].filter(Boolean),
        })}
      />
      <JsonLd data={websiteJsonLd({ name, url })} />
      <Analytics gtmId={gtmId} ga4Id={ga4Id} />
      <PreviewListener />
      {topMarquees.map((sec) => (
        <MarqueeBar
          key={sec.id}
          text={sec.settings.title ?? ""}
          separator={sec.settings.marqueeSeparator}
          animated={sec.settings.animated}
          speed={sec.settings.marqueeSpeed}
          background={sec.settings.background}
          textColor={sec.settings.textColor}
          textSize={sec.settings.textSize}
        />
      ))}
      {bar.enabled && bar.text && (
        <AnnouncementBar
          text={bar.text}
          link={bar.link || undefined}
          bgColor={bar.bgColor}
          textColor={bar.textColor}
          dismissible={bar.dismissible}
        />
      )}
      <Header headerStyle={themeSettings.headerStyle} logoHeight={themeSettings.headerLogoHeight} headerLayout={themeSettings.headerLayout} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
