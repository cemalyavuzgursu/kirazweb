"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "kiraz-cookie-consent";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) setShow(true);
  }, []);

  if (!show) return null;

  function accept() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, at: Date.now() }));
    setShow(false);
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-md z-50 rounded-lg shadow-lg p-5" style={{ backgroundColor: "var(--kt-surface)", border: "1px solid var(--kt-border)" }}>
      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--kt-muted)" }}>
        Bu sitede deneyiminizi iyileştirmek için çerezler kullanıyoruz. Detaylar için{" "}
        <Link href="/kvkk" className="underline" style={{ color: "var(--kt-primary)" }}>KVKK</Link> ve{" "}
        <Link href="/gizlilik" className="underline" style={{ color: "var(--kt-primary)" }}>Gizlilik Politikası</Link>&apos;na göz atabilirsiniz.
      </p>
      <div className="flex gap-2">
        <button
          onClick={accept}
          className="flex-1 px-4 py-2 rounded-md text-white text-sm font-medium transition"
          style={{ backgroundColor: "var(--kt-primary)" }}
        >
          Kabul Et
        </button>
      </div>
    </div>
  );
}
