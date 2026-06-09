import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { getPublishedThemeSettings, getDraftData } from "@/server/actions/theme";
import { getSettings } from "@/lib/settings";
import { buildCssVarString, buildGoogleFontsUrl, DEFAULT_THEME_SETTINGS } from "@/lib/theme-settings";

function faviconType(url: string): string | undefined {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ico":
      return "image/x-icon";
    case "png":
      return "image/png";
    case "svg":
      return "image/svg+xml";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    default:
      return undefined;
  }
}

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kiraz Tasarım — Çeyiz ve Ev Aksesuarları",
    template: "%s | Kiraz Tasarım",
  },
  description:
    "El emeği ile hazırlanan çeyiz ve ev aksesuarları. Tasarım vazolar, dekoratif objeler, mutfak takımları ve daha fazlası Kiraz Tasarım'da.",
  applicationName: "Kiraz Tasarım",
  generator: "Kiraz Tasarım",
};

export const viewport: Viewport = {
  themeColor: "#fdfaf6",
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const isPreview = hdrs.get("x-preview-mode") === "1";
  const draft = isPreview ? await getDraftData().catch(() => null) : null;
  const { themeSettings, customCss } = draft ?? await getPublishedThemeSettings().catch(() => ({
    themeSettings: DEFAULT_THEME_SETTINGS,
    customCss: null,
  }));

  const faviconSettings = await getSettings(["site.favicon", "store.favicon"]).catch(
    () => ({}) as Record<string, unknown>,
  );
  const faviconRaw = faviconSettings["site.favicon"] ?? faviconSettings["store.favicon"];
  const faviconUrl = faviconRaw ? String(faviconRaw).trim() : "";

  const fontUrl = buildGoogleFontsUrl(themeSettings.fontBody, themeSettings.fontDisplay);
  // CSS vars contain only color/font values — no user-HTML, safe for style tag
  const cssVars = buildCssVarString(themeSettings);
  // Strip </style> to prevent injection; custom CSS is admin-only content
  const safeCustomCss = customCss ? customCss.replace(/<\/style\s*>/gi, "") : "";

  return (
    <html lang="tr" className={inter.variable}>
      <head>
        {faviconUrl && (
          <link rel="icon" href={faviconUrl} type={faviconType(faviconUrl)} />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={fontUrl} />
        {/* Theme CSS variables — values derived from admin-controlled settings, not user input */}
        <style>{cssVars}</style>
        {safeCustomCss && <style>{safeCustomCss}</style>}
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
