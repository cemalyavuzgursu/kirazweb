"use client";

import { useState, useRef, type Dispatch, type SetStateAction } from "react";
import { Download, Upload, Trash2, Check, Sparkles, BookMarked } from "lucide-react";
import { saveTemplate, deleteTemplate } from "@/server/actions/theme";
import type { EditorData, ThemeTemplate } from "@/lib/theme-settings";
import { PRESET_TEMPLATES } from "@/lib/theme-settings";

interface TemplateManagerProps {
  templates: ThemeTemplate[];
  setTemplates: Dispatch<SetStateAction<ThemeTemplate[]>>;
  currentData: EditorData;
  dispatch: (action: any) => void;
}

function ColorSwatch({ colors }: { colors: string[] }) {
  return (
    <div className="flex gap-0.5">
      {colors.map((c, i) => (
        <span key={i} className="w-4 h-4 rounded-sm border border-black/10" style={{ background: c }} />
      ))}
    </div>
  );
}

function TemplateCard({
  template,
  onApply,
  onDelete,
  applied,
}: {
  template: ThemeTemplate;
  onApply: () => void;
  onDelete?: () => void;
  applied?: boolean;
}) {
  const { themeSettings: t } = template.data;
  const swatchColors = [t.colorBackground, t.colorPrimary, t.colorAccent, t.colorText];

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-cream-200 bg-white hover:border-rose-200 transition group">
      <div className="shrink-0">
        <div
          className="w-10 h-10 rounded-md border border-black/10 flex flex-col overflow-hidden"
          style={{ background: t.colorBackground }}
        >
          <div className="h-2.5 w-full" style={{ background: t.colorPrimary }} />
          <div className="flex-1 flex items-center justify-center gap-0.5 px-1">
            <div className="h-1 rounded-full flex-1" style={{ background: t.colorText, opacity: 0.3 }} />
            <div className="h-1 rounded-full w-2" style={{ background: t.colorAccent, opacity: 0.6 }} />
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-700 truncate">{template.name}</p>
        <ColorSwatch colors={swatchColors} />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onApply}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
            applied
              ? "bg-green-50 text-green-600 border border-green-200"
              : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
          }`}
        >
          {applied ? <Check className="h-3 w-3" /> : null}
          {applied ? "Aktif" : "Uygula"}
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1 text-ink-200 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function TemplateManager({ templates, setTemplates, currentData, dispatch }: TemplateManagerProps) {
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const name = newName.trim() || `Şablon ${new Date().toLocaleDateString("tr-TR")}`;
    setSaving(true);
    await saveTemplate(name, currentData);
    setTemplates((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        name,
        createdAt: new Date().toISOString(),
        data: { themeSettings: currentData.themeSettings, customCss: currentData.customCss },
      },
    ]);
    setNewName("");
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleApply = (template: ThemeTemplate) => {
    dispatch({ type: "LOAD_TEMPLATE", data: template.data });
    setApplied(template.id);
    setTimeout(() => setApplied(null), 2000);
  };

  const handleExport = () => {
    const json = JSON.stringify(
      { themeSettings: currentData.themeSettings, customCss: currentData.customCss },
      null,
      2,
    );
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kiraz-tema-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.themeSettings) dispatch({ type: "LOAD_TEMPLATE", data: parsed });
        else alert("Geçersiz şablon dosyası.");
      } catch {
        alert("Geçersiz şablon dosyası.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="p-4 space-y-5">
      {/* Preset templates */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-rose-400" />
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Hazır Şablonlar</p>
        </div>
        <div className="space-y-1.5">
          {PRESET_TEMPLATES.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onApply={() => handleApply(t)}
              applied={applied === t.id}
            />
          ))}
        </div>
      </div>

      {/* Saved templates */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <BookMarked className="h-3.5 w-3.5 text-ink-400" />
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Kaydedilen Şablonlar</p>
        </div>
        {templates.length === 0 ? (
          <p className="text-xs text-ink-300 px-1">Henüz kaydedilen şablon yok.</p>
        ) : (
          <div className="space-y-1.5">
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onApply={() => handleApply(t)}
                onDelete={() => handleDelete(t.id)}
                applied={applied === t.id}
              />
            ))}
          </div>
        )}

        {/* Save current as template */}
        <div className="pt-1 flex gap-2">
          <input
            className="flex-1 px-2.5 py-1.5 text-sm border border-cream-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Şablon adı..."
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-sm rounded-md transition disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? "..." : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Import / Export */}
      <div className="border-t border-cream-100 pt-4 flex gap-2">
        <button
          onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs border border-cream-200 rounded-md text-ink-600 hover:bg-cream-50 transition"
        >
          <Download className="h-3.5 w-3.5" />
          JSON İndir
        </button>
        <button
          onClick={() => importRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs border border-cream-200 rounded-md text-ink-600 hover:bg-cream-50 transition"
        >
          <Upload className="h-3.5 w-3.5" />
          JSON Yükle
        </button>
        <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>
    </div>
  );
}
