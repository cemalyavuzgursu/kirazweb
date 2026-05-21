"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import type { PageSection } from "@/lib/page-sections";
import { BlocksPanel } from "./block-item";
import { MediaPicker } from "@/components/admin/media-picker";

function ImageField({ value, onChange, folder = "banners" }: { value?: string; onChange: (v: string) => void; folder?: string }) {
  return (
    <div className="space-y-1.5">
      {value ? (
        <div className="relative h-24 w-full rounded-md overflow-hidden border border-cream-200 bg-cream-50">
          <Image src={value} alt="" fill sizes="320px" className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded p-0.5 transition"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="h-16 w-full rounded-md border border-dashed border-cream-300 bg-cream-50 flex items-center justify-center text-xs text-ink-300">
          Görsel seçilmedi
        </div>
      )}
      <MediaPicker value={value ?? ""} onChange={onChange} folder={folder} />
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-ink-500 font-medium">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-2.5 py-1.5 text-sm border border-cream-200 rounded-md bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300";

const radioCls = "flex gap-2 flex-wrap";

function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; swatch?: string }[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className={radioCls}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1 text-xs rounded-md border transition flex items-center gap-1.5 ${
            value === opt.value
              ? "bg-rose-500 text-white border-rose-500"
              : "border-cream-200 text-ink-600 hover:border-rose-300"
          }`}
        >
          {opt.swatch !== undefined && (
            <span
              className="w-3 h-3 rounded-sm shrink-0 border border-black/10"
              style={{ backgroundColor: opt.swatch }}
            />
          )}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function update(dispatch: (a: any) => void, id: string, patch: Record<string, unknown>) {
  dispatch({ type: "UPDATE_SECTION_SETTINGS", id, settings: patch });
}

interface SectionEditorProps {
  section: PageSection;
  dispatch: (action: any) => void;
}

export function SectionEditor({ section, dispatch }: SectionEditorProps) {
  const upd = (patch: Record<string, unknown>) => update(dispatch, section.id, patch);
  const s = section.settings;

  if (section.type === "hero") {
    const layout = s.heroLayout ?? "full-bleed";
    return (
      <div className="space-y-2.5">
        <Field label="Düzen">
          <RadioGroup
            options={[
              { value: "full-bleed", label: "Tam genişlik" },
              { value: "split", label: "Bölünmüş" },
              { value: "editorial", label: "Editöryel" },
            ]}
            value={layout}
            onChange={(v) => upd({ heroLayout: v })}
          />
        </Field>
        {layout === "full-bleed" ? (
          <p className="text-xs text-ink-400">
            Görsel ve metin <Link href="/admin/bannerlar" className="text-rose-500 underline">Bannerlar</Link> sayfasından yönetilir.
          </p>
        ) : (
          <>
            <Field label="Üst Etiket (küçük metin)">
              <input className={inputCls} value={s.heroAccentLabel ?? ""} onChange={(e) => upd({ heroAccentLabel: e.target.value })} placeholder="YENİ KOLEKSİYON" />
            </Field>
            <Field label="Başlık">
              <input className={inputCls} value={s.title ?? ""} onChange={(e) => upd({ title: e.target.value })} placeholder="Büyük başlık metni" />
            </Field>
            <Field label="Alt Metin">
              <textarea className={`${inputCls} min-h-[60px] resize-y`} value={s.subtitle ?? ""} onChange={(e) => upd({ subtitle: e.target.value })} placeholder="Kısa açıklama..." />
            </Field>
            <Field label="CTA Metni">
              <input className={inputCls} value={s.ctaText ?? ""} onChange={(e) => upd({ ctaText: e.target.value })} placeholder="KOLEKSİYONU GÖR" />
            </Field>
            <Field label="CTA Bağlantısı">
              <input className={inputCls} value={s.ctaUrl ?? ""} onChange={(e) => upd({ ctaUrl: e.target.value })} placeholder="/urunler" />
            </Field>
          </>
        )}
      </div>
    );
  }

  if (section.type === "spacer") {
    return (
      <Field label={`Yükseklik: ${s.height ?? 48}px`}>
        <input
          type="range"
          min={16}
          max={200}
          step={4}
          value={s.height ?? 48}
          onChange={(e) => upd({ height: Number(e.target.value) })}
          className="w-full accent-rose-500"
        />
      </Field>
    );
  }

  if (section.type === "rich_text") {
    return (
      <div className="space-y-2.5">
        <Field label="Başlık">
          <input className={inputCls} value={s.title ?? ""} onChange={(e) => upd({ title: e.target.value })} placeholder="Bölüm başlığı" />
        </Field>
        <Field label="İçerik">
          <textarea
            className={`${inputCls} min-h-[80px] resize-y`}
            value={s.content ?? ""}
            onChange={(e) => upd({ content: e.target.value })}
            placeholder="Paragraf metni..."
          />
        </Field>
        <Field label="Hizalama">
          <RadioGroup
            options={[{ value: "left", label: "Sol" }, { value: "center", label: "Merkez" }]}
            value={s.textAlign}
            onChange={(v) => upd({ textAlign: v })}
          />
        </Field>
        <Field label="Arkaplan">
          <RadioGroup
            options={[
                { value: "white", label: "Beyaz", swatch: "#ffffff" },
                { value: "cream", label: "Krem", swatch: "#faf3ea" },
                { value: "primary", label: "Tema", swatch: "var(--kt-primary, #c95265)" },
              ]}
            value={s.background}
            onChange={(v) => upd({ background: v })}
          />
        </Field>
      </div>
    );
  }

  if (section.type === "image_text") {
    return (
      <div className="space-y-2.5">
        <Field label="Başlık">
          <input className={inputCls} value={s.title ?? ""} onChange={(e) => upd({ title: e.target.value })} placeholder="Başlık" />
        </Field>
        <Field label="Alt metin">
          <textarea
            className={`${inputCls} min-h-[60px] resize-none`}
            value={s.subtitle ?? ""}
            onChange={(e) => upd({ subtitle: e.target.value })}
            placeholder="Açıklama metni..."
          />
        </Field>
        <Field label="Görsel">
          <ImageField value={s.image} onChange={(v) => upd({ image: v })} />
        </Field>
        <Field label="Görsel Konumu">
          <RadioGroup
            options={[{ value: "left", label: "Sol" }, { value: "right", label: "Sağ" }]}
            value={s.imagePosition}
            onChange={(v) => upd({ imagePosition: v })}
          />
        </Field>
        <Field label="Buton Metni">
          <input className={inputCls} value={s.ctaText ?? ""} onChange={(e) => upd({ ctaText: e.target.value })} placeholder="Keşfet" />
        </Field>
        <Field label="Buton Bağlantısı">
          <input className={inputCls} value={s.ctaUrl ?? ""} onChange={(e) => upd({ ctaUrl: e.target.value })} placeholder="/urunler" />
        </Field>
        <Field label="Arkaplan">
          <RadioGroup
            options={[
                { value: "white", label: "Beyaz", swatch: "#ffffff" },
                { value: "cream", label: "Krem", swatch: "#faf3ea" },
                { value: "primary", label: "Tema", swatch: "var(--kt-primary, #c95265)" },
              ]}
            value={s.background}
            onChange={(v) => upd({ background: v })}
          />
        </Field>
      </div>
    );
  }

  if (section.type === "banner_cta") {
    return (
      <div className="space-y-2.5">
        <Field label="Görsel">
          <ImageField value={s.image} onChange={(v) => upd({ image: v })} />
        </Field>
        <Field label="Başlık">
          <input className={inputCls} value={s.title ?? ""} onChange={(e) => upd({ title: e.target.value })} placeholder="Büyük başlık" />
        </Field>
        <Field label="Alt başlık">
          <input className={inputCls} value={s.subtitle ?? ""} onChange={(e) => upd({ subtitle: e.target.value })} placeholder="Kısa açıklama" />
        </Field>
        <Field label="Buton Metni">
          <input className={inputCls} value={s.ctaText ?? ""} onChange={(e) => upd({ ctaText: e.target.value })} placeholder="Keşfet" />
        </Field>
        <Field label="Buton Bağlantısı">
          <input className={inputCls} value={s.ctaUrl ?? ""} onChange={(e) => upd({ ctaUrl: e.target.value })} placeholder="/urunler" />
        </Field>
        <Field label={`Karartma: %${s.overlayOpacity ?? 40}`}>
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={s.overlayOpacity ?? 40}
            onChange={(e) => upd({ overlayOpacity: Number(e.target.value) })}
            className="w-full accent-rose-500"
          />
        </Field>
      </div>
    );
  }

  if (section.type === "newsletter") {
    return (
      <div className="space-y-2.5">
        <Field label="Başlık">
          <input className={inputCls} value={s.title ?? ""} onChange={(e) => upd({ title: e.target.value })} placeholder="Bültene Abone Ol" />
        </Field>
        <Field label="Alt metin">
          <input className={inputCls} value={s.subtitle ?? ""} onChange={(e) => upd({ subtitle: e.target.value })} placeholder="Yeni ürünlerden haberdar olun" />
        </Field>
        <Field label="E-posta placeholder">
          <input className={inputCls} value={s.placeholder ?? ""} onChange={(e) => upd({ placeholder: e.target.value })} placeholder="E-posta adresiniz" />
        </Field>
        <Field label="Buton Metni">
          <input className={inputCls} value={s.buttonText ?? ""} onChange={(e) => upd({ buttonText: e.target.value })} placeholder="Abone Ol" />
        </Field>
        <Field label="Arkaplan">
          <RadioGroup
            options={[
                { value: "white", label: "Beyaz", swatch: "#ffffff" },
                { value: "cream", label: "Krem", swatch: "#faf3ea" },
                { value: "primary", label: "Tema", swatch: "var(--kt-primary, #c95265)" },
              ]}
            value={s.background}
            onChange={(v) => upd({ background: v })}
          />
        </Field>
      </div>
    );
  }

  if (section.type === "marquee") {
    return (
      <div className="space-y-2.5">
        <Field label="Metin">
          <textarea
            className={`${inputCls} min-h-[72px] resize-y`}
            value={s.title ?? ""}
            onChange={(e) => upd({ title: e.target.value })}
            placeholder="Ücretsiz kargo  ✦  İndirim fırsatları"
          />
        </Field>
        <Field label="Ayraç">
          <div className="flex gap-1.5 items-center">
            <input
              className={`${inputCls} w-16`}
              value={s.marqueeSeparator ?? "✦"}
              onChange={(e) => upd({ marqueeSeparator: e.target.value })}
              maxLength={4}
            />
            <div className="flex gap-1">
              {["✦", "•", "♦", "|", "★"].map((sep) => (
                <button
                  key={sep}
                  type="button"
                  onClick={() => upd({ marqueeSeparator: sep })}
                  className="px-2 py-1 text-xs border border-cream-200 rounded hover:border-rose-300 text-ink-500"
                >
                  {sep}
                </button>
              ))}
            </div>
          </div>
        </Field>
        <Field label="Animasyon">
          <RadioGroup
            options={[
              { value: "true", label: "Kayan" },
              { value: "false", label: "Sabit" },
            ]}
            value={String(s.animated !== false)}
            onChange={(v) => upd({ animated: v === "true" })}
          />
        </Field>
        {s.animated !== false && (
          <Field label={`Hız: ${s.marqueeSpeed ?? 20}sn`}>
            <input
              type="range"
              min={8}
              max={60}
              step={2}
              value={s.marqueeSpeed ?? 20}
              onChange={(e) => upd({ marqueeSpeed: Number(e.target.value) })}
              className="w-full accent-rose-500"
            />
          </Field>
        )}
        <Field label="Arkaplan">
          <RadioGroup
            options={[
              { value: "white", label: "Beyaz", swatch: "#ffffff" },
              { value: "cream", label: "Krem", swatch: "#faf3ea" },
              { value: "primary", label: "Tema", swatch: "var(--kt-primary, #c95265)" },
            ]}
            value={s.background ?? "primary"}
            onChange={(v) => upd({ background: v })}
          />
        </Field>
        <Field label="Metin Rengi">
          <RadioGroup
            options={[
              { value: "light", label: "Beyaz", swatch: "#ffffff" },
              { value: "dark", label: "Koyu", swatch: "#161108" },
            ]}
            value={s.textColor ?? "light"}
            onChange={(v) => upd({ textColor: v })}
          />
        </Field>
        <Field label="Metin Boyutu">
          <RadioGroup
            options={[
              { value: "sm", label: "Küçük" },
              { value: "md", label: "Normal" },
            ]}
            value={s.textSize ?? "sm"}
            onChange={(v) => upd({ textSize: v })}
          />
        </Field>
        <Field label="Konum">
          <RadioGroup
            options={[
              { value: "content", label: "Sayfada" },
              { value: "top", label: "Header Üstü" },
            ]}
            value={s.position ?? "content"}
            onChange={(v) => upd({ position: v })}
          />
        </Field>
      </div>
    );
  }

  // features / testimonials — with blocks
  if (section.type === "features" || section.type === "testimonials") {
    return (
      <div className="space-y-2.5">
        <Field label="Başlık">
          <input className={inputCls} value={s.title ?? ""} onChange={(e) => upd({ title: e.target.value })} placeholder="Bölüm başlığı" />
        </Field>
        <Field label="Alt metin">
          <input className={inputCls} value={s.subtitle ?? ""} onChange={(e) => upd({ subtitle: e.target.value })} placeholder="Kısa açıklama" />
        </Field>
        {section.type === "features" && (
          <Field label="Sütun Sayısı">
            <RadioGroup
              options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]}
              value={String(s.columns ?? 3)}
              onChange={(v) => upd({ columns: Number(v) })}
            />
          </Field>
        )}
        <Field label="Arkaplan">
          <RadioGroup
            options={[
                { value: "white", label: "Beyaz", swatch: "#ffffff" },
                { value: "cream", label: "Krem", swatch: "#faf3ea" },
                { value: "primary", label: "Tema", swatch: "var(--kt-primary, #c95265)" },
              ]}
            value={s.background}
            onChange={(v) => upd({ background: v })}
          />
        </Field>
        <div className="pt-1">
          <BlocksPanel section={section} dispatch={dispatch} />
        </div>
      </div>
    );
  }

  // categories, featured_products, new_products
  return (
    <div className="space-y-2.5">
      <Field label="Başlık">
        <input className={inputCls} value={s.title ?? ""} onChange={(e) => upd({ title: e.target.value })} placeholder="Bölüm başlığı" />
      </Field>
      <Field label="Alt metin">
        <input className={inputCls} value={s.subtitle ?? ""} onChange={(e) => upd({ subtitle: e.target.value })} placeholder="Kısa açıklama" />
      </Field>
      <Field label="Gösterilecek Sayı">
        <input
          type="number"
          className={inputCls}
          value={s.count ?? 8}
          min={2}
          max={24}
          onChange={(e) => upd({ count: Number(e.target.value) })}
        />
      </Field>
      <Field label="Arkaplan">
        <RadioGroup
          options={[
            { value: "white", label: "Beyaz", swatch: "#ffffff" },
            { value: "cream", label: "Krem", swatch: "#faf3ea" },
            { value: "primary", label: "Tema", swatch: "var(--kt-primary, #c95265)" },
          ]}
          value={s.background}
          onChange={(v) => upd({ background: v })}
        />
      </Field>
    </div>
  );
}
