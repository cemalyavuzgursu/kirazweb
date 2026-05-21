"use client";

import { ColorPicker } from "@/components/ui/color-picker";
import { BODY_FONTS, DISPLAY_FONTS, type ThemeSettings } from "@/lib/theme-settings";

interface ThemeSettingsPanelProps {
  settings: ThemeSettings;
  dispatch: (action: any) => void;
}

function upd(dispatch: (a: any) => void, patch: Partial<ThemeSettings>) {
  dispatch({ type: "UPDATE_THEME", settings: patch });
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2.5 bg-cream-50 border-b border-cream-100">
      <p className="text-xs font-medium text-ink-400 uppercase tracking-wider">{children}</p>
    </div>
  );
}

const selectCls =
  "w-full px-2.5 py-1.5 text-sm border border-cream-200 rounded-md bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-rose-200";

const inputCls =
  "w-full px-2.5 py-1.5 text-sm border border-cream-200 rounded-md bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-rose-200";

const labelCls = "text-xs text-ink-500 font-medium";

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

export function ThemeSettingsPanel({ settings: s, dispatch }: ThemeSettingsPanelProps) {
  return (
    <div className="flex flex-col">

      {/* ── 1. Renkler ──────────────────────────────────────────────────── */}
      <SectionHeader>Renk Şemaları</SectionHeader>
      <div className="px-4 py-3 space-y-3 border-b border-cream-100">
        <ColorPicker label="Ana Renk" value={s.colorPrimary} onChange={(v) => upd(dispatch, { colorPrimary: v })} />
        <ColorPicker label="Koyu Ton" value={s.colorDark} onChange={(v) => upd(dispatch, { colorDark: v })} />
        <ColorPicker label="Metin Rengi" value={s.colorText} onChange={(v) => upd(dispatch, { colorText: v })} />
        <ColorPicker label="Başlık Rengi" value={s.colorHeading} onChange={(v) => upd(dispatch, { colorHeading: v })} />
        <ColorPicker label="Arkaplan" value={s.colorBackground} onChange={(v) => upd(dispatch, { colorBackground: v })} />
        <ColorPicker label="Vurgu Rengi" value={s.colorAccent} onChange={(v) => upd(dispatch, { colorAccent: v })} />
        <ColorPicker label="Yüzey Rengi" value={s.colorSurface ?? s.colorBackground} onChange={(v) => upd(dispatch, { colorSurface: v })} />
        <ColorPicker label="Kenarlık Rengi" value={s.colorBorder ?? "#e2ddd6"} onChange={(v) => upd(dispatch, { colorBorder: v })} />
        <ColorPicker label="İkincil Metin" value={s.colorMuted ?? "#6b6459"} onChange={(v) => upd(dispatch, { colorMuted: v })} />
      </div>

      {/* ── 2. Tipografi ─────────────────────────────────────────────────── */}
      <SectionHeader>Tipografi</SectionHeader>
      <div className="px-4 py-3 space-y-3 border-b border-cream-100">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Gövde Fontu</label>
          <select className={selectCls} value={s.fontBody} onChange={(e) => upd(dispatch, { fontBody: e.target.value })}>
            {BODY_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <SliderField
          label="Gövde Font Boyutu"
          value={s.fontBodyScale ?? 100}
          min={80}
          max={120}
          unit="%"
          onChange={(v) => upd(dispatch, { fontBodyScale: v })}
        />
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Başlık Fontu</label>
          <select className={selectCls} value={s.fontDisplay} onChange={(e) => upd(dispatch, { fontDisplay: e.target.value })}>
            {DISPLAY_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Başlık Font Ağırlığı</label>
          <select className={selectCls} value={s.fontDisplayWeight ?? "400"} onChange={(e) => upd(dispatch, { fontDisplayWeight: e.target.value as ThemeSettings["fontDisplayWeight"] })}>
            {(["300", "400", "500", "600", "700", "900"] as const).map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
        <RadioGroup
          label="Başlık Stili"
          value={s.fontDisplayStyle ?? "normal"}
          options={[
            { value: "normal", label: "Normal" },
            { value: "italic", label: "İtalik" },
          ]}
          onChange={(v) => upd(dispatch, { fontDisplayStyle: v })}
        />
        <RadioGroup
          label="Başlık Büyük/Küçük"
          value={s.fontDisplayTransform ?? "none"}
          options={[
            { value: "none", label: "Varsayılan" },
            { value: "uppercase", label: "BÜYÜK" },
            { value: "lowercase", label: "küçük" },
          ]}
          onChange={(v) => upd(dispatch, { fontDisplayTransform: v })}
        />
        <SliderField
          label="Başlık Harf Aralığı"
          value={s.fontDisplayLetterSpacing ?? 0}
          min={-10}
          max={30}
          unit=" (×0.01em)"
          onChange={(v) => upd(dispatch, { fontDisplayLetterSpacing: v })}
        />
      </div>

      {/* ── 3. Düzen ─────────────────────────────────────────────────────── */}
      <SectionHeader>Düzen</SectionHeader>
      <div className="px-4 py-3 space-y-3 border-b border-cream-100">
        <SliderField
          label="Sayfa Genişliği"
          value={s.pageWidth ?? 1280}
          min={1024}
          max={1600}
          step={8}
          unit="px"
          onChange={(v) => upd(dispatch, { pageWidth: v })}
        />
        <SliderField
          label="Bölüm Aralığı"
          value={s.sectionSpacing ?? 64}
          min={20}
          max={120}
          step={4}
          unit="px"
          onChange={(v) => upd(dispatch, { sectionSpacing: v })}
        />
        <SliderField
          label="Grid Sütun Boşluğu"
          value={s.gridColumnGap ?? 24}
          min={8}
          max={48}
          step={4}
          unit="px"
          onChange={(v) => upd(dispatch, { gridColumnGap: v })}
        />
        <SliderField
          label="Grid Satır Boşluğu"
          value={s.gridRowGap ?? 24}
          min={8}
          max={48}
          step={4}
          unit="px"
          onChange={(v) => upd(dispatch, { gridRowGap: v })}
        />
        <RadioGroup
          label="Bölüm Ayırıcı"
          value={s.sectionBorderStyle ?? "none"}
          options={[
            { value: "none", label: "Yok" },
            { value: "line", label: "İnce" },
            { value: "thick", label: "Kalın" },
          ]}
          onChange={(v) => upd(dispatch, { sectionBorderStyle: v })}
        />
      </div>

      {/* ── 4. Animasyonlar ──────────────────────────────────────────────── */}
      <SectionHeader>Animasyonlar</SectionHeader>
      <div className="px-4 py-3 border-b border-cream-100">
        <RadioGroup
          label="Hover Efekti"
          value={s.hoverEffect ?? "lift"}
          options={[
            { value: "none", label: "Yok" },
            { value: "lift", label: "Yukarı" },
            { value: "fade", label: "Solma" },
            { value: "scale", label: "Büyüt" },
          ]}
          onChange={(v) => upd(dispatch, { hoverEffect: v })}
        />
      </div>

      {/* ── 5. Düğmeler ──────────────────────────────────────────────────── */}
      <SectionHeader>Düğmeler</SectionHeader>
      <div className="px-4 py-3 space-y-3 border-b border-cream-100">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Köşe Yuvarlama</label>
          <div className="flex gap-2 flex-wrap">
            {(
              [
                { value: "none", label: "Kare" },
                { value: "sm", label: "Hafif" },
                { value: "md", label: "Yuvarlak" },
                { value: "lg", label: "Oval" },
                { value: "full", label: "Hap" },
              ] as { value: ThemeSettings["buttonRadius"]; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => upd(dispatch, { buttonRadius: opt.value })}
                className={`px-3 py-1 text-xs border transition ${
                  s.buttonRadius === opt.value
                    ? "bg-rose-500 text-white border-rose-500"
                    : "border-cream-200 text-ink-600 hover:border-rose-300"
                }`}
                style={{
                  borderRadius:
                    opt.value === "none" ? 0
                    : opt.value === "sm" ? 4
                    : opt.value === "md" ? 8
                    : opt.value === "lg" ? 12
                    : 9999,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <RadioGroup
          label="Metin Büyük/Küçük"
          value={s.buttonTextTransform ?? "none"}
          options={[
            { value: "none", label: "Normal" },
            { value: "uppercase", label: "BÜYÜK" },
          ]}
          onChange={(v) => upd(dispatch, { buttonTextTransform: v })}
        />
        <SliderField
          label="Harf Aralığı"
          value={s.buttonLetterSpacing ?? 0}
          min={0}
          max={30}
          unit=" (×0.01em)"
          onChange={(v) => upd(dispatch, { buttonLetterSpacing: v })}
        />
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Font Ailesi</label>
          <select className={selectCls} value={s.buttonFontFamily ?? "body"} onChange={(e) => upd(dispatch, { buttonFontFamily: e.target.value as ThemeSettings["buttonFontFamily"] })}>
            <option value="body">Gövde Fontu</option>
            <option value="display">Başlık Fontu</option>
            <option value="mono">Mono</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Font Ağırlığı</label>
          <select className={selectCls} value={s.buttonFontWeight ?? "500"} onChange={(e) => upd(dispatch, { buttonFontWeight: e.target.value as ThemeSettings["buttonFontWeight"] })}>
            {(["300", "400", "500", "600", "700"] as const).map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
        <ColorPicker
          label="Metin Rengi (boş = beyaz)"
          value={s.buttonTextColorOverride || "#ffffff"}
          onChange={(v) => upd(dispatch, { buttonTextColorOverride: v === "#ffffff" ? "" : v })}
        />
        <SliderField
          label="Kenarlık Kalınlığı"
          value={s.buttonBorderWidth ?? 0}
          min={0}
          max={4}
          unit="px"
          onChange={(v) => upd(dispatch, { buttonBorderWidth: v })}
        />
      </div>

      {/* ── 6. Ürün Kartları ─────────────────────────────────────────────── */}
      <SectionHeader>Ürün Kartları</SectionHeader>
      <div className="px-4 py-3 space-y-3 border-b border-cream-100">
        <RadioGroup
          label="Kart Stili"
          value={s.cardStyle ?? "borderless"}
          options={[
            { value: "borderless", label: "Kenarsız" },
            { value: "bordered", label: "Kenarlı" },
            { value: "elevated", label: "Gölgeli" },
          ]}
          onChange={(v) => upd(dispatch, { cardStyle: v })}
        />
        <ColorPicker
          label="Görsel Arka Planı"
          value={s.cardImageBg ?? "#f3f0eb"}
          onChange={(v) => upd(dispatch, { cardImageBg: v })}
        />
        <RadioGroup
          label="Hizalama"
          value={s.cardAlignment ?? "left"}
          options={[
            { value: "left", label: "Sol" },
            { value: "center", label: "Orta" },
          ]}
          onChange={(v) => upd(dispatch, { cardAlignment: v })}
        />
        <RadioGroup
          label="Ürün Adı Fontu"
          value={s.cardNameFont ?? "body"}
          options={[
            { value: "body", label: "Gövde" },
            { value: "display", label: "Başlık" },
          ]}
          onChange={(v) => upd(dispatch, { cardNameFont: v })}
        />
        <RadioGroup
          label="Ürün Adı Stili"
          value={s.cardNameStyle ?? "normal"}
          options={[
            { value: "normal", label: "Normal" },
            { value: "italic", label: "İtalik" },
          ]}
          onChange={(v) => upd(dispatch, { cardNameStyle: v })}
        />
        <RadioGroup
          label="Ürün Adı Büyük/Küçük"
          value={s.cardNameTransform ?? "none"}
          options={[
            { value: "none", label: "Varsayılan" },
            { value: "uppercase", label: "BÜYÜK" },
          ]}
          onChange={(v) => upd(dispatch, { cardNameTransform: v })}
        />
        <RadioGroup
          label="Etiket Büyük/Küçük"
          value={s.cardLabelTransform ?? "none"}
          options={[
            { value: "none", label: "Varsayılan" },
            { value: "uppercase", label: "BÜYÜK" },
          ]}
          onChange={(v) => upd(dispatch, { cardLabelTransform: v })}
        />
        <SliderField
          label="Kart Köşe Yuvarlama"
          value={s.cardRadius ?? 8}
          min={0}
          max={32}
          unit="px"
          onChange={(v) => upd(dispatch, { cardRadius: v })}
        />
      </div>

      {/* ── 7. Rozetler ──────────────────────────────────────────────────── */}
      <SectionHeader>Rozetler</SectionHeader>
      <div className="px-4 py-3 space-y-3 border-b border-cream-100">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Rozet Pozisyonu</label>
          <select
            className={selectCls}
            value={s.badgePosition ?? "top-left"}
            onChange={(e) => upd(dispatch, { badgePosition: e.target.value as ThemeSettings["badgePosition"] })}
          >
            <option value="top-left">Sol Üst</option>
            <option value="top-right">Sağ Üst</option>
            <option value="bottom-left">Sol Alt</option>
          </select>
        </div>
        <SliderField
          label="Rozet Köşe Yuvarlama"
          value={s.badgeRadius ?? 4}
          min={0}
          max={999}
          step={2}
          unit="px"
          onChange={(v) => upd(dispatch, { badgeRadius: v })}
        />
      </div>

      {/* ── 8. Sepet ─────────────────────────────────────────────────────── */}
      <SectionHeader>Sepet</SectionHeader>
      <div className="px-4 py-3 border-b border-cream-100">
        <RadioGroup
          label="Sepet Tipi"
          value={s.cartType ?? "drawer"}
          options={[
            { value: "drawer", label: "Çekmece" },
            { value: "popup", label: "Popup" },
            { value: "page", label: "Sayfa" },
          ]}
          onChange={(v) => upd(dispatch, { cartType: v })}
        />
      </div>


    </div>
  );
}
