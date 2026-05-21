"use client";

import { X } from "lucide-react";
import { SECTION_META, newSection, type SectionType } from "@/lib/page-sections";

interface AddSectionDrawerProps {
  onClose: () => void;
  onAdd: (section: ReturnType<typeof newSection>) => void;
}

const SECTION_GROUPS = [
  {
    label: "Ürün ve Kategori",
    types: ["hero", "categories", "featured_products", "new_products"] as SectionType[],
  },
  {
    label: "İçerik",
    types: ["rich_text", "image_text", "banner_cta", "features", "testimonials"] as SectionType[],
  },
  {
    label: "Diğer",
    types: ["marquee", "newsletter", "spacer"] as SectionType[],
  },
];

export function AddSectionDrawer({ onClose, onAdd }: AddSectionDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="w-[360px] bg-white shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200">
          <h2 className="text-sm font-medium text-ink-700">Bölüm Ekle</h2>
          <button onClick={onClose} className="p-1 text-ink-300 hover:text-ink-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {SECTION_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-4 py-1.5 text-xs text-ink-300 uppercase tracking-wider font-medium bg-cream-50">
                {group.label}
              </p>
              <div className="divide-y divide-cream-50">
                {group.types.map((type) => {
                  const meta = SECTION_META[type];
                  return (
                    <button
                      key={type}
                      onClick={() => onAdd(newSection(type))}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 text-left transition"
                    >
                      <span className="text-2xl w-8 text-center shrink-0">{meta.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink-700">{meta.label}</p>
                        <p className="text-xs text-ink-300 truncate">{meta.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
