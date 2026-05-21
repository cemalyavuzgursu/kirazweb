import Link from "next/link";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { MenuLocation } from "@prisma/client";

export async function Footer() {
  const [s, footerMenu] = await Promise.all([
    getSettings([
      "site.name",
      "site.tagline",
      "site.contact.phone",
      "site.contact.email",
      "site.contact.address",
      "site.workingHours",
      "site.social.instagram",
      "site.social.facebook",
    ]),
    prisma.navMenu.findMany({
      where: { location: MenuLocation.FOOTER, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-20"
      style={{
        backgroundColor: "var(--kt-surface, #161108)",
        color: "var(--kt-text, #fdfaf6)",
        borderTop: "1px solid var(--kt-border, #e2ddd6)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl mb-3" style={{ color: "var(--kt-heading, inherit)" }}>
              {String(s["site.name"] ?? "")}
            </h3>
            <p className="text-sm leading-relaxed mb-6 max-w-md" style={{ color: "var(--kt-muted, rgba(255,255,255,0.6))" }}>
              {String(s["site.tagline"] ?? "")}
            </p>
            <div className="space-y-2 text-sm" style={{ color: "var(--kt-muted, rgba(255,255,255,0.6))" }}>
              {s["site.contact.phone"] ? (
                <a
                  href={`tel:${s["site.contact.phone"]}`}
                  className="flex items-center gap-2 hover:opacity-100 opacity-80 transition-opacity"
                  style={{ color: "inherit" }}
                >
                  <Phone className="h-4 w-4" />
                  {String(s["site.contact.phone"])}
                </a>
              ) : null}
              {s["site.contact.email"] ? (
                <a
                  href={`mailto:${s["site.contact.email"]}`}
                  className="flex items-center gap-2 hover:opacity-100 opacity-80 transition-opacity"
                  style={{ color: "inherit" }}
                >
                  <Mail className="h-4 w-4" />
                  {String(s["site.contact.email"])}
                </a>
              ) : null}
            </div>
            <div className="flex gap-3 mt-6">
              {s["site.social.instagram"] ? (
                <a
                  href={String(s["site.social.instagram"])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md transition hover:opacity-100 opacity-70"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--kt-text, #fff) 15%, transparent)",
                    color: "var(--kt-text, #fff)",
                  }}
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              ) : null}
              {s["site.social.facebook"] ? (
                <a
                  href={String(s["site.social.facebook"])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md transition hover:opacity-100 opacity-70"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--kt-text, #fff) 15%, transparent)",
                    color: "var(--kt-text, #fff)",
                  }}
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div>
            <h4
              className="text-sm font-medium mb-4 uppercase tracking-wider"
              style={{ color: "var(--kt-muted, rgba(255,255,255,0.5))" }}
            >
              Kurumsal
            </h4>
            <ul className="space-y-2 text-sm">
              {footerMenu.slice(0, 4).map((m) => (
                <li key={m.id}>
                  <Link
                    href={m.url}
                    className="hover:opacity-100 opacity-70 transition-opacity"
                    style={{ color: "var(--kt-text, inherit)" }}
                  >
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className="text-sm font-medium mb-4 uppercase tracking-wider"
              style={{ color: "var(--kt-muted, rgba(255,255,255,0.5))" }}
            >
              Yardım
            </h4>
            <ul className="space-y-2 text-sm">
              {footerMenu.slice(4).map((m) => (
                <li key={m.id}>
                  <Link
                    href={m.url}
                    className="hover:opacity-100 opacity-70 transition-opacity"
                    style={{ color: "var(--kt-text, inherit)" }}
                  >
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className="text-sm font-medium mb-4 uppercase tracking-wider"
              style={{ color: "var(--kt-muted, rgba(255,255,255,0.5))" }}
            >
              Politikalar
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/blog", label: "Blog" },
                { href: "/politika/iade", label: "İade ve Para İadesi" },
                { href: "/politika/gizlilik", label: "Gizlilik Politikası" },
                { href: "/politika/hizmet-sartlari", label: "Hizmet Şartları" },
                { href: "/politika/kargo", label: "Kargo Politikası" },
                { href: "/iletisim", label: "İletişim" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:opacity-100 opacity-70 transition-opacity"
                    style={{ color: "var(--kt-text, inherit)" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-6 text-xs flex flex-col sm:flex-row justify-between gap-2"
          style={{
            borderTop: "1px solid color-mix(in srgb, var(--kt-border, #e2ddd6) 50%, transparent)",
            color: "var(--kt-muted, rgba(255,255,255,0.4))",
          }}
        >
          <span>© {year} {String(s["site.name"] ?? "")}. Tüm hakları saklıdır.</span>
          <span>{String(s["site.workingHours"] ?? "")}</span>
        </div>
      </div>
    </footer>
  );
}
