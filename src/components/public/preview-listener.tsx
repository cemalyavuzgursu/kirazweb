"use client";

import { useEffect } from "react";

export function PreviewListener() {
  useEffect(() => {
    const isPreview = new URLSearchParams(window.location.search).get("preview") === "1";
    if (!isPreview) return;

    // Apply CSS vars from theme editor postMessage.
    // Root-scoped vars go to :root; palette-override vars go to .kt-public
    // so the admin panel (which has no .kt-public ancestor) is unaffected.
    const PUBLIC_SCOPED = new Set([
      // kt theme color tokens
      "--kt-primary", "--kt-dark", "--kt-text", "--kt-heading", "--kt-bg", "--kt-accent",
      // Tailwind palette overrides
      "--color-rose-500", "--color-rose-600", "--color-gold-500",
      "--color-ink-700", "--color-ink-900",
      // Semantic color aliases
      "--bg", "--fg", "--primary", "--accent",
      // Border radius — scoped so admin buttons keep their default shape
      "--kt-radius", "--radius", "--radius-sm", "--radius-md", "--radius-lg", "--radius-xl",
      // Typography extended
      "--kt-font-body", "--kt-font-display",
      "--kt-body-scale", "--kt-display-weight", "--kt-display-style",
      "--kt-display-transform", "--kt-display-spacing",
      // Cards
      "--kt-card-img-bg", "--kt-card-radius", "--kt-card-border-width", "--kt-card-shadow",
      "--kt-card-name-style", "--kt-card-name-transform", "--kt-card-label-transform", "--kt-card-align",
      "--kt-card-name-font-family",
      // Buttons
      "--kt-btn-transform", "--kt-btn-spacing", "--kt-btn-weight", "--kt-btn-text", "--kt-btn-border-width",
      "--kt-btn-font-family",
      // Layout
      "--kt-page-width", "--kt-section-spacing", "--kt-grid-col-gap", "--kt-grid-row-gap",
      // Extended colors
      "--kt-surface", "--kt-border", "--kt-muted",
      // Hover
      "--kt-hover-transform", "--kt-hover-opacity",
      // Badges
      "--kt-badge-radius",
      // Header border
      "--kt-header-border-width",
    ]);
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== "KIRAZ_THEME_PREVIEW") return;
      const vars = e.data.vars as Record<string, string>;
      const rootVars: string[] = [];
      const publicVars: string[] = [];
      for (const [k, v] of Object.entries(vars)) {
        if (PUBLIC_SCOPED.has(k)) publicVars.push(`${k}:${v}`);
        else rootVars.push(`${k}:${v}`);
      }
      let el = document.getElementById("kiraz-preview-override") as HTMLStyleElement | null;
      if (!el) {
        el = document.createElement("style");
        el.id = "kiraz-preview-override";
        document.head.appendChild(el);
      }
      const root = rootVars.length ? `:root{${rootVars.join(";")}}` : "";
      const pub = publicVars.length ? `.kt-public{${publicVars.join(";")}}` : "";
      el.textContent = `${root}${pub}`;
    };
    window.addEventListener("message", handler);

    // Signal parent editor that this preview is hydrated and ready to receive theme vars
    window.parent.postMessage({ type: "KIRAZ_PREVIEW_READY" }, "*");

    // Keep ?preview=1 on all in-page link navigations
    const linkHandler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor || !anchor.href) return;
      try {
        const url = new URL(anchor.href);
        if (url.origin === window.location.origin && url.searchParams.get("preview") !== "1") {
          e.preventDefault();
          url.searchParams.set("preview", "1");
          window.location.href = url.toString();
        }
      } catch {
        // external link, leave it
      }
    };
    document.addEventListener("click", linkHandler, true);

    return () => {
      window.removeEventListener("message", handler);
      document.removeEventListener("click", linkHandler, true);
    };
  }, []);

  return null;
}
