"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, ShoppingBag, User, Search, BookOpen } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  url: string;
}

interface MobileNavProps {
  siteName: string;
  menuItems: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ siteName, menuItems, isOpen, onClose }: MobileNavProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  // Portal target is only available on the client. We render into `.kt-public`
  // (not document.body) so the drawer inherits the theme CSS variables that are
  // scoped to that wrapper, while still escaping the header's backdrop-filter
  // containing block.
  useEffect(() => {
    setPortalTarget(
      document.querySelector<HTMLElement>(".kt-public") ?? document.body,
    );
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus inside drawer when open
  useEffect(() => {
    if (!isOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function trapFocus(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    drawer.addEventListener("keydown", trapFocus);
    first?.focus();
    return () => drawer.removeEventListener("keydown", trapFocus);
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!portalTarget) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Gezinme menüsü"
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 shadow-xl flex flex-col",
          "transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{ backgroundColor: "var(--kt-surface)" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--kt-border)" }}>
          <span className="font-display text-xl tracking-tight" style={{ color: "var(--kt-heading)" }}>
            {siteName}
          </span>
          <button
            onClick={onClose}
            aria-label="Menüyü kapat"
            className="p-1.5 rounded-md transition"
            style={{ color: "var(--kt-muted)" }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              onClick={onClose}
              className="flex items-center py-3 px-6 border-b transition-colors text-sm"
              style={{ borderColor: "var(--kt-border)", color: "var(--kt-heading)" }}
            >
              {item.label}
            </Link>
          ))}

          {/* Fixed quick links */}
          <div className="mt-4 px-6 pb-2 space-y-1">
            <Link
              href="/urunler"
              onClick={onClose}
              className="flex items-center gap-3 py-2.5 text-sm transition-colors"
              style={{ color: "var(--kt-muted, #6b6459)" }}
            >
              <Search className="h-4 w-4 shrink-0" />
              Ürünleri Keşfet
            </Link>
            <Link
              href="/blog"
              onClick={onClose}
              className="flex items-center gap-3 py-2.5 text-sm transition-colors"
              style={{ color: "var(--kt-muted, #6b6459)" }}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              Blog
            </Link>
            <Link
              href="/sepet"
              onClick={onClose}
              className="flex items-center gap-3 py-2.5 text-sm transition-colors"
              style={{ color: "var(--kt-muted, #6b6459)" }}
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              Sepetim
            </Link>
            <Link
              href="/hesabim/siparisler"
              onClick={onClose}
              className="flex items-center gap-3 py-2.5 text-sm transition-colors"
              style={{ color: "var(--kt-muted, #6b6459)" }}
            >
              <User className="h-4 w-4 shrink-0" />
              Hesabım
            </Link>
          </div>
        </nav>
      </div>
    </>,
    portalTarget,
  );
}
