"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function Analytics({ gtmId, ga4Id }: { gtmId: string; ga4Id: string }) {
  useEffect(() => {
    if (gtmId) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    }
    if (!gtmId && ga4Id) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args: unknown[]) {
        window.dataLayer.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", ga4Id);
    }
  }, [gtmId, ga4Id]);

  return null;
}
