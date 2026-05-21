import { Phone, Mail, MapPin, Instagram } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";
import { RichText } from "@/components/public/rich-text";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildMetadata({
    title: "İletişim",
    description: "Kiraz Tasarım ile iletişim — telefon, e-posta ve sosyal medya kanalları.",
    path: "/iletisim",
  });
}

export default async function ContactPage() {
  const [page, s] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "iletisim" } }),
    getSettings([
      "site.name",
      "site.contact.phone",
      "site.contact.email",
      "site.contact.address",
      "site.workingHours",
      "site.social.instagram",
      "whatsapp.number",
    ]),
  ]);

  const phone = String(s["site.contact.phone"] ?? "");
  const email = String(s["site.contact.email"] ?? "");
  const address = String(s["site.contact.address"] ?? "");
  const hours = String(s["site.workingHours"] ?? "");
  const instagram = String(s["site.social.instagram"] ?? "");
  const whatsapp = String(s["whatsapp.number"] ?? "");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-4xl mb-3" style={{ color: "var(--kt-heading)" }}>İletişim</h1>
      <p className="mb-12" style={{ color: "var(--kt-muted)" }}>Sorularınız ve siparişleriniz için her zaman buradayız.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          {phone ? (
            <div className="flex gap-4 items-start">
              <Phone className="h-5 w-5 shrink-0 mt-1" style={{ color: "var(--kt-primary)" }} />
              <div>
                <div className="font-medium" style={{ color: "var(--kt-text)" }}>Telefon</div>
                <a href={`tel:${phone}`} className="hover:underline" style={{ color: "var(--kt-muted)" }}>{phone}</a>
              </div>
            </div>
          ) : null}
          {whatsapp ? (
            <div className="flex gap-4 items-start">
              <Phone className="h-5 w-5 text-emerald-500 shrink-0 mt-1" />
              <div>
                <div className="font-medium" style={{ color: "var(--kt-text)" }}>WhatsApp</div>
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600"
                  style={{ color: "var(--kt-muted)" }}
                >
                  {whatsapp}
                </a>
              </div>
            </div>
          ) : null}
          {email ? (
            <div className="flex gap-4 items-start">
              <Mail className="h-5 w-5 shrink-0 mt-1" style={{ color: "var(--kt-primary)" }} />
              <div>
                <div className="font-medium" style={{ color: "var(--kt-text)" }}>E-posta</div>
                <a href={`mailto:${email}`} className="hover:underline" style={{ color: "var(--kt-muted)" }}>{email}</a>
              </div>
            </div>
          ) : null}
          {address ? (
            <div className="flex gap-4 items-start">
              <MapPin className="h-5 w-5 shrink-0 mt-1" style={{ color: "var(--kt-primary)" }} />
              <div>
                <div className="font-medium" style={{ color: "var(--kt-text)" }}>Adres</div>
                <p className="whitespace-pre-line" style={{ color: "var(--kt-muted)" }}>{address}</p>
              </div>
            </div>
          ) : null}
          {instagram ? (
            <div className="flex gap-4 items-start">
              <Instagram className="h-5 w-5 shrink-0 mt-1" style={{ color: "var(--kt-primary)" }} />
              <div>
                <div className="font-medium" style={{ color: "var(--kt-text)" }}>Instagram</div>
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: "var(--kt-muted)" }}
                >
                  {instagram.replace(/^https?:\/\//, "")}
                </a>
              </div>
            </div>
          ) : null}
          {hours ? (
            <p className="text-sm pt-4" style={{ color: "var(--kt-muted)", borderTop: "1px solid var(--kt-border)" }}>
              Çalışma saatleri: {hours}
            </p>
          ) : null}
        </div>

        <div>
          {page?.content ? <RichText html={page.content} /> : null}
        </div>
      </div>
    </div>
  );
}
