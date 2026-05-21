"use client";

import Link from "next/link";
import { ColorPicker } from "@/components/ui/color-picker";
import type { ThemeSettings, GlobalSettings } from "@/lib/theme-settings";

interface HeaderEditorProps {
  settings: ThemeSettings;
  globalSettings: GlobalSettings;
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

function RadioGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelCls}>{label}</label>
      <div className="flex gap-1.5 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-2.5 py-1 text-xs border rounded transition ${
              value === opt.value
                ? "bg-rose-500 text-white border-rose-500"
                : "border-cream-200 text-ink-600 hover:border-rose-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>
        {label}: {value}{unit ?? ""}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-rose-500"
      />
    </div>
  );
}

export function HeaderEditor({ settings: s, globalSettings: g, dispatch }: HeaderEditorProps) {
  const upd = (patch: Partial<ThemeSettings>) =>
    dispatch({ type: "UPDATE_THEME", settings: patch });
  const updGlobal = (patch: Partial<GlobalSettings>) =>
    dispatch({ type: "UPDATE_GLOBAL", settings: patch });
  const updBar = (patch: Partial<GlobalSettings["announcementBar"]>) =>
    dispatch({ type: "UPDATE_GLOBAL_BAR", settings: patch });

  const bar = g.announcementBar;

  return (
    <div className="flex flex-col">

      {/* ── Genel Başlık Ayarları ─────────────────────────────────────────── */}
      <SectionHeader>Genel Başlık Ayarları</SectionHeader>
      <div className="px-4 py-3 space-y-3 border-b border-cream-100">
        <RadioGroup
          label="Header Stili"
          value={s.headerStyle}
          options={[
            { value: "sticky", label: "Sabit" },
            { value: "static", label: "Statik" },
            { value: "transparent", label: "Şeffaf" },
          ]}
          onChange={(v) => upd({ headerStyle: v })}
        />
        <SliderField
          label="Logo Yüksekliği"
          value={s.headerLogoHeight}
          min={36}
          max={80}
          step={4}
          unit="px"
          onChange={(v) => upd({ headerLogoHeight: v })}
        />
        <RadioGroup
          label="Alt Kenarlık"
          value={s.headerBorderStyle ?? "thin"}
          options={[
            { value: "none", label: "Yok" },
            { value: "thin", label: "İnce" },
            { value: "medium", label: "Orta" },
            { value: "thick", label: "Kalın" },
          ]}
          onChange={(v) => upd({ headerBorderStyle: v })}
        />
        <RadioGroup
          label="Header Düzeni"
          value={s.headerLayout ?? "default"}
          options={[
            { value: "default", label: "Varsayılan" },
            { value: "centered", label: "Ortalı" },
            { value: "minimal", label: "Minimal" },
            { value: "split", label: "Bölünmüş" },
          ]}
          onChange={(v) => upd({ headerLayout: v })}
        />
        <p className="text-xs text-ink-400">
          Logo yönetimi için →{" "}
          <Link href="/admin/ayarlar" className="text-rose-500 hover:underline">
            Ayarlar sayfasına git
          </Link>
        </p>
      </div>

      {/* ── Duyuru Çubuğu ────────────────────────────────────────────────── */}
      <SectionHeader>Duyuru Çubuğu</SectionHeader>
      <div className="px-4 py-3 space-y-3 border-b border-cream-100">
        {/* Enabled toggle */}
        <div className="flex items-center justify-between">
          <label className={labelCls}>Etkin</label>
          <button
            type="button"
            onClick={() => updBar({ enabled: !bar.enabled })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              bar.enabled ? "bg-rose-500" : "bg-cream-200"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                bar.enabled ? "translate-x-[18px]" : "translate-x-[2px]"
              }`}
            />
          </button>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Duyuru Metni</label>
          <input
            type="text"
            className={inputCls}
            value={bar.text}
            placeholder="Duyuru metni..."
            onChange={(e) => updBar({ text: e.target.value })}
          />
        </div>

        {/* Link */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Bağlantı (opsiyonel)</label>
          <input
            type="text"
            className={inputCls}
            value={bar.link}
            placeholder="/urunler veya https://..."
            onChange={(e) => updBar({ link: e.target.value })}
          />
        </div>

        {/* Colors */}
        <ColorPicker
          label="Arka Plan Rengi"
          value={bar.bgColor}
          onChange={(v) => updBar({ bgColor: v })}
        />
        <ColorPicker
          label="Metin Rengi"
          value={bar.textColor}
          onChange={(v) => updBar({ textColor: v })}
        />

        {/* Dismissible toggle */}
        <div className="flex items-center justify-between">
          <label className={labelCls}>Kapatılabilir</label>
          <button
            type="button"
            onClick={() => updBar({ dismissible: !bar.dismissible })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              bar.dismissible ? "bg-rose-500" : "bg-cream-200"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                bar.dismissible ? "translate-x-[18px]" : "translate-x-[2px]"
              }`}
            />
          </button>
        </div>
      </div>

    </div>
  );
}
