"use client";

import Link from "next/link";
import type { ThemeSettings } from "@/lib/theme-settings";

interface FooterEditorProps {
  settings: ThemeSettings;
  dispatch: (action: any) => void;
}

const labelCls = "text-xs text-ink-500 font-medium";

const inputCls =
  "w-full px-2.5 py-1.5 text-sm border border-cream-200 rounded-md bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-rose-200";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2.5 bg-cream-50 border-b border-cream-100">
      <p className="text-xs font-medium text-ink-400 uppercase tracking-wider">{children}</p>
    </div>
  );
}

export function FooterEditor({ settings: s, dispatch }: FooterEditorProps) {
  const upd = (patch: Partial<ThemeSettings>) =>
    dispatch({ type: "UPDATE_THEME", settings: patch });

  return (
    <div className="flex flex-col">

      {/* ── Marka Bilgileri ───────────────────────────────────────────────── */}
      <SectionHeader>Marka Bilgileri</SectionHeader>
      <div className="px-4 py-3 space-y-3 border-b border-cream-100">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Slogan</label>
          <input
            type="text"
            className={inputCls}
            value={s.brandTagline ?? ""}
            placeholder="Kısa slogan..."
            onChange={(e) => upd({ brandTagline: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Hakkımızda (Footer)</label>
          <textarea
            className={`${inputCls} min-h-[72px] resize-y`}
            value={s.brandDescription ?? ""}
            placeholder="Marka açıklaması..."
            onChange={(e) => upd({ brandDescription: e.target.value })}
          />
        </div>
      </div>

      {/* ── Sosyal Medya ──────────────────────────────────────────────────── */}
      <SectionHeader>Sosyal Medya</SectionHeader>
      <div className="px-4 py-3 space-y-2 border-b border-cream-100">
        {(
          [
            { key: "socialInstagram", label: "Instagram" },
            { key: "socialFacebook", label: "Facebook" },
            { key: "socialYoutube", label: "YouTube" },
            { key: "socialTiktok", label: "TikTok" },
            { key: "socialTwitter", label: "Twitter / X" },
            { key: "socialPinterest", label: "Pinterest" },
          ] as { key: keyof ThemeSettings; label: string }[]
        ).map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-0.5">
            <label className={labelCls}>{label}</label>
            <input
              type="url"
              className={inputCls}
              value={(s[key] as string) ?? ""}
              placeholder="https://..."
              onChange={(e) => upd({ [key]: e.target.value })}
            />
          </div>
        ))}
      </div>

      {/* ── Footer Ayarları ───────────────────────────────────────────────── */}
      <SectionHeader>Footer Ayarları</SectionHeader>
      <div className="px-4 py-3 border-b border-cream-100">
        <p className="text-xs text-ink-400">
          Alt bilgi navigasyon menüsü için →{" "}
          <Link href="/admin/menuler" className="text-rose-500 hover:underline">
            Menüler
          </Link>
        </p>
      </div>

    </div>
  );
}
