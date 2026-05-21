"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, MapPin, User, LogOut, Heart } from "lucide-react";
import { logoutCustomer } from "@/server/actions/customer-account";

const links = [
  { href: "/hesabim/siparisler", label: "Siparişlerim", icon: ShoppingBag },
  { href: "/hesabim/favoriler", label: "Favorilerim", icon: Heart },
  { href: "/hesabim/adresler", label: "Adreslerim", icon: MapPin },
  { href: "/hesabim/profil", label: "Profilim", icon: User },
];

export function AccountNav({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <aside className="rounded-lg p-4 h-fit" style={{ backgroundColor: "var(--kt-surface)", border: "1px solid var(--kt-border)" }}>
      <p className="text-xs uppercase tracking-wider mb-3 px-2" style={{ color: "var(--kt-muted)" }}>Merhaba,</p>
      <p className="font-display text-lg px-2 mb-4 truncate" style={{ color: "var(--kt-heading)" }}>{name}</p>

      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition font-medium"
              style={active
                ? { backgroundColor: "color-mix(in srgb, var(--kt-primary) 10%, transparent)", color: "var(--kt-primary)" }
                : { color: "var(--kt-muted)" }
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <form action={logoutCustomer} className="mt-4 pt-4" style={{ borderTop: "1px solid var(--kt-border)" }}>
        <button
          type="submit"
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm transition"
          style={{ color: "var(--kt-muted)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--kt-primary)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--kt-muted)"; }}
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </form>
    </aside>
  );
}
