import Link from "next/link";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin/ayarlar/genel", label: "Genel" },
  { href: "/admin/ayarlar/odeme", label: "Ödeme" },
  { href: "/admin/ayarlar/vergi", label: "Vergi" },
  { href: "/admin/ayarlar/odeme-hesap", label: "Ödeme & Hesap" },
  { href: "/admin/ayarlar/politikalar", label: "Politikalar" },
  { href: "/admin/ayarlar/bildirimler", label: "Bildirimler" },
  { href: "/admin/ayarlar/whatsapp", label: "WhatsApp" },
  { href: "/admin/ayarlar/kargo", label: "Kargo" },
  { href: "/admin/ayarlar/eposta", label: "E-posta" },
  { href: "/admin/ayarlar/google-oauth", label: "Google OAuth" },
];

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin(["settings:manage"]);
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/ayarlar";

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title="Ayarlar" description="Site, ödeme, kargo ve iletişim ayarları" />
      <nav className="border-b border-cream-200 mb-6 flex gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "px-4 py-2 text-sm border-b-2 -mb-px transition",
                isActive ? "border-rose-500 text-rose-600 font-medium" : "border-transparent text-ink-500 hover:text-ink-700",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </AdminShell>
  );
}
