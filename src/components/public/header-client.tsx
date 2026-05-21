"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { MobileNav } from "./mobile-nav";

interface MenuItem {
  id: string;
  label: string;
  url: string;
}

interface HeaderClientProps {
  siteName: string;
  menuItems: MenuItem[];
}

export function HeaderClient({ siteName, menuItems }: HeaderClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 rounded-md transition"
        style={{ color: "var(--kt-text, #161108)", opacity: 0.6 }}
        aria-label="Menüyü aç"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
      >
        <Menu className="h-5 w-5" />
      </button>

      <MobileNav
        siteName={siteName}
        menuItems={menuItems}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
