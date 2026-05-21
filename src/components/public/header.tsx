import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, User } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getCustomerSession } from "@/lib/customer-session";
import { MenuLocation } from "@prisma/client";
import type { ThemeSettings } from "@/lib/theme-settings";
import { HeaderClient } from "./header-client";
import { HeaderSearch } from "./header-search";

interface HeaderProps {
  headerStyle?: ThemeSettings["headerStyle"];
  logoHeight?: number;
  headerLayout?: ThemeSettings["headerLayout"];
}

export async function Header({
  headerStyle = "sticky",
  logoHeight = 32,
  headerLayout = "default",
}: HeaderProps) {
  const [s, menuItems, customerSession] = await Promise.all([
    getSettings(["site.name", "site.logo"]),
    prisma.navMenu.findMany({
      where: { location: MenuLocation.HEADER, isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
    }),
    getCustomerSession(),
  ]);

  const siteName = String(s["site.name"] ?? "Kiraz Tasarım");
  const logoUrl = s["site.logo"] ? String(s["site.logo"]) : null;

  const headerClass =
    headerStyle === "static"
      ? "relative z-40 kt-header-bordered"
      : headerStyle === "transparent"
        ? "fixed top-0 inset-x-0 z-40"
        : "sticky top-0 z-40 backdrop-blur kt-header-bordered";

  const headerBg =
    headerStyle === "transparent"
      ? "transparent"
      : "color-mix(in srgb, var(--kt-bg, #fdfaf6) 95%, transparent)";

  const logoEl = (
    <Link href="/" aria-label={siteName}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={siteName}
          height={logoHeight}
          width={logoHeight * 4}
          style={{ height: logoHeight, width: "auto" }}
          className="object-contain"
        />
      ) : (
        <span
          className="font-display text-2xl tracking-tight"
          style={{ color: "var(--kt-heading, #2b2419)" }}
        >
          {siteName}
        </span>
      )}
    </Link>
  );

  const navLinks = (
    <>
      {menuItems.map((item) => (
        <Link
          key={item.id}
          href={item.url}
          className="text-sm transition-colors opacity-70 hover:opacity-100 [color:var(--kt-text,#161108)] hover:[color:var(--kt-primary,#c95265)]"
        >
          {item.label}
        </Link>
      ))}
      <Link
        href="/blog"
        className="text-sm transition-colors opacity-70 hover:opacity-100 [color:var(--kt-text,#161108)] hover:[color:var(--kt-primary,#c95265)]"
      >
        Blog
      </Link>
    </>
  );

  const iconsEl = (
    <div className="flex items-center gap-2">
      <HeaderSearch />
      <Link
        href={customerSession ? "/hesabim/siparisler" : "/hesabim/giris"}
        className="p-2 rounded-md transition"
        style={{ color: "var(--kt-text, #161108)", opacity: 0.6 }}
        aria-label="Hesabım"
      >
        <User className="h-5 w-5" />
      </Link>
      <Link
        href="/sepet"
        className="p-2 rounded-md transition"
        style={{ color: "var(--kt-text, #161108)", opacity: 0.6 }}
        aria-label="Sepet"
      >
        <ShoppingBag className="h-5 w-5" />
      </Link>
      <HeaderClient siteName={siteName} menuItems={menuItems} />
    </div>
  );

  let innerContent: React.ReactNode;

  if (headerLayout === "centered") {
    // 2-row: logo centered on top, nav below; icons float top-right
    innerContent = (
      <div className="relative flex flex-col items-center py-4 gap-3">
        {logoEl}
        <nav className="hidden lg:flex items-center gap-7">{navLinks}</nav>
        <div className="absolute right-0 top-0 flex items-center gap-2">
          <HeaderSearch />
          <Link
            href={customerSession ? "/hesabim/siparisler" : "/hesabim/giris"}
            className="p-2 rounded-md transition"
            style={{ color: "var(--kt-text, #161108)", opacity: 0.6 }}
            aria-label="Hesabım"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/sepet"
            className="p-2 rounded-md transition"
            style={{ color: "var(--kt-text, #161108)", opacity: 0.6 }}
            aria-label="Sepet"
          >
            <ShoppingBag className="h-5 w-5" />
          </Link>
          <HeaderClient siteName={siteName} menuItems={menuItems} />
        </div>
      </div>
    );
  } else if (headerLayout === "minimal") {
    // Logo + icons only — no desktop nav shown; mobile burger still present
    innerContent = (
      <div className="h-16 flex items-center justify-between px-0">
        {logoEl}
        {iconsEl}
      </div>
    );
  } else if (headerLayout === "split") {
    // Logo left, nav inline left, icons right — compact h-16
    innerContent = (
      <div className="h-16 flex items-center gap-8">
        {logoEl}
        <nav className="hidden lg:flex items-center gap-6 flex-1">{navLinks}</nav>
        {iconsEl}
      </div>
    );
  } else {
    // default: logo left, nav center, icons right
    innerContent = (
      <div className="h-20 flex items-center justify-between">
        {logoEl}
        <nav className="hidden lg:flex items-center gap-7">{navLinks}</nav>
        {iconsEl}
      </div>
    );
  }

  return (
    <header
      className={headerClass}
      style={{
        backgroundColor: headerBg,
        borderBottomColor: headerStyle !== "transparent"
          ? "var(--kt-border, color-mix(in srgb, var(--kt-text, #161108) 10%, transparent))"
          : "transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {innerContent}
      </div>
    </header>
  );
}
