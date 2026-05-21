"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Image as ImageIcon,
  FileText,
  Tag,
  Users,
  UserCog,
  Settings,
  Search,
  LogOut,
  HelpCircle,
  Megaphone,
  FolderOpen,
  BookOpen,
  Globe,
  Store,
  BarChart2,
  Menu,
  Mail,
  X,
} from "lucide-react";
import { signOutAction } from "@/server/actions/sign-out";
import { cn } from "@/lib/utils";

type SubItem = {
  href: string;
  label: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  sub?: SubItem[];
};

type NavGroup = {
  label?: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    items: [
      { href: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "SATIŞ",
    items: [
      {
        href: "/admin/siparisler",
        label: "Siparişler",
        icon: ShoppingBag,
        sub: [
          { href: "/admin/siparisler/taslaklar", label: "Taslaklar" },
          { href: "/admin/siparisler/terk-edilmis", label: "Terk Edilmiş Ödemeler" },
        ],
      },
      {
        href: "/admin/urunler",
        label: "Ürünler",
        icon: Package,
        sub: [
          { href: "/admin/urunler/envanter", label: "Envanter" },
          { href: "/admin/kategoriler", label: "Koleksiyonlar" },
        ],
      },
      {
        href: "/admin/musteriler",
        label: "Müşteriler",
        icon: Users,
        sub: [
          { href: "/admin/musteriler/segmentler", label: "Segmentler" },
        ],
      },
    ],
  },
  {
    label: "İÇERİK & PAZARLAMA",
    items: [
      { href: "/admin/kampanyalar", label: "Kampanyalar", icon: Megaphone },
      { href: "/admin/kuponlar", label: "Kuponlar", icon: Tag },
      { href: "/admin/bannerlar", label: "Bannerlar", icon: ImageIcon },
      { href: "/admin/sayfalar", label: "Sayfalar", icon: FileText },
      {
        href: "/admin/blog",
        label: "Blog",
        icon: BookOpen,
        sub: [
          { href: "/admin/blog/yazilar", label: "Yazılar" },
        ],
      },
      { href: "/admin/menuler", label: "Menüler", icon: Menu },
      { href: "/admin/sss", label: "SSS", icon: HelpCircle },
      { href: "/admin/medya", label: "Medya", icon: FolderOpen },
      { href: "/admin/newsletter", label: "Bülten", icon: Mail },
    ],
  },
  {
    label: "ANALİZ & AYARLAR",
    items: [
      {
        href: "/admin/analizler",
        label: "Analizler",
        icon: BarChart2,
        sub: [
          { href: "/admin/analizler/raporlar", label: "Raporlar" },
          { href: "/admin/analizler/canli", label: "Canlı Görünüm" },
        ],
      },
      { href: "/admin/seo", label: "SEO", icon: Search },
      {
        href: "/admin/kullanicilar",
        label: "Kullanıcılar",
        icon: UserCog,
        sub: [
          { href: "/admin/roller", label: "Roller" },
        ],
      },
      { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
    ],
  },
  {
    label: "SATIŞ KANALLARI",
    items: [
      {
        href: "/admin/online-magaza",
        label: "Online Mağaza",
        icon: Globe,
        sub: [
          { href: "/admin/sayfalar", label: "Sayfalar" },
          { href: "/admin/online-magaza/tercihler", label: "Tercihler" },
        ],
      },
      {
        href: "/admin/fiziksel-magaza",
        label: "Fiziksel Mağaza",
        icon: Store,
        sub: [
          { href: "/admin/fiziksel-magaza/personel", label: "Personel" },
          { href: "/admin/fiziksel-magaza/konumlar", label: "Konumlar" },
          { href: "/admin/fiziksel-magaza/ayarlar", label: "Ayarlar" },
        ],
      },
    ],
  },
];

function SidebarContent({
  userName,
  pathname,
  onNavClick,
}: {
  userName: string;
  pathname: string;
  onNavClick?: () => void;
}) {
  return (
    <>
      <div className="px-6 py-5 border-b border-cream-100">
        <Link href="/admin" className="block" onClick={onNavClick}>
          <h1 className="font-display text-xl text-ink-700 leading-tight">Kiraz Tasarım</h1>
          <p className="text-[10px] text-ink-300 uppercase tracking-widest mt-0.5">Yönetim Paneli</p>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {navGroups.map((group, gi) => {
          const groupKey = group.label ?? `group-${gi}`;
          return (
            <div key={groupKey}>
              {group.label && (
                <p className="text-[10px] tracking-widest text-ink-300 px-3 pt-4 pb-1 uppercase select-none">
                  {group.label}
                </p>
              )}
              <div className="px-2 space-y-0.5">
                {group.items.map((item) => {
                  const extraPaths = item.sub?.map((s) => s.href) ?? [];
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href) ||
                      extraPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
                  const Icon = item.icon;
                  const showSub = isActive && item.sub && item.sub.length > 0;

                  return (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition -ml-px",
                          isActive
                            ? "bg-rose-50 text-rose-700 font-medium border-l-2 border-rose-500"
                            : "text-ink-500 hover:bg-cream-50 hover:text-ink-700",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>

                      {showSub && (
                        <div className="ml-4 mt-0.5 mb-1 border-l border-cream-200 pl-3 space-y-0.5">
                          {item.sub!.map((sub) => {
                            const subActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={onNavClick}
                                className={cn(
                                  "flex items-center gap-1.5 pl-1 py-1.5 rounded text-xs transition",
                                  subActive
                                    ? "text-rose-700 font-medium"
                                    : "text-ink-400 hover:text-ink-700",
                                )}
                              >
                                <span className="text-ink-300 select-none">·</span>
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-cream-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-500 truncate">{userName}</span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-ink-300 hover:text-rose-600 transition p-1"
              title="Çıkış"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export function AdminShell({
  children,
  userName,
  pathname,
  topbar,
}: {
  children: React.ReactNode;
  userName: string;
  pathname: string;
  topbar?: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white shadow-sm border-r border-cream-200 flex-col shrink-0">
        <SidebarContent userName={userName} pathname={pathname} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg flex flex-col transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1 text-ink-400 hover:text-ink-700"
          aria-label="Menüyü kapat"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent userName={userName} pathname={pathname} onNavClick={() => setMobileOpen(false)} />
      </aside>

      <main className="flex-1 overflow-x-hidden min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-cream-200 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md text-ink-500 hover:bg-cream-50"
            aria-label="Menüyü aç"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-base text-ink-700">Kiraz Tasarım</span>
        </div>
        {topbar}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl text-ink-700">{title}</h1>
        {description ? <p className="text-ink-500 mt-1">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

