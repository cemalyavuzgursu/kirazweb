"use client";

import Link from "next/link";
import { ChevronDown, ArrowLeft, RotateCcw, RotateCw, Loader2, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { PageTemplate } from "../editor-client";

const PAGE_OPTIONS: { value: PageTemplate; label: string; icon: string }[] = [
  { value: "homepage", label: "Ana Sayfa", icon: "🏠" },
  { value: "product", label: "Ürün Detay", icon: "📦" },
  { value: "category", label: "Kategori", icon: "🗂" },
];

interface TopBarProps {
  currentPage: PageTemplate;
  onPageChange: (p: PageTemplate) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isDirty: boolean;
  isSaving: boolean;
  isSavingDraft: boolean;
  draftSaved: boolean;
  saveError: string | null;
  onSave: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
}

export function TopBar({
  currentPage,
  onPageChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isDirty,
  isSaving,
  isSavingDraft,
  draftSaved,
  saveError,
  onSave,
  onSaveDraft,
  onDiscard,
}: TopBarProps) {
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const current = PAGE_OPTIONS.find((p) => p.value === currentPage)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="h-12 bg-white border-b border-cream-200 flex items-center px-3 gap-2 shrink-0 shadow-sm z-10">
      {/* Back */}
      <Link
        href="/admin"
        className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-ink-700 transition mr-1"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Panele Dön
      </Link>

      <div className="w-px h-5 bg-cream-200" />

      {/* Page selector */}
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-cream-50 text-sm font-medium text-ink-700 transition"
        >
          <span>{current.icon}</span>
          <span>{current.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-300" />
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-cream-200 py-1 z-50">
            {PAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onPageChange(opt.value); setOpen(false); }}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition ${
                  currentPage === opt.value
                    ? "bg-rose-50 text-rose-700 font-medium"
                    : "text-ink-600 hover:bg-cream-50"
                }`}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Undo/Redo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="p-1.5 rounded hover:bg-cream-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        title="Geri Al (Ctrl+Z)"
      >
        <RotateCcw className="h-3.5 w-3.5 text-ink-500" />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="p-1.5 rounded hover:bg-cream-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        title="İleri Al (Ctrl+Y)"
      >
        <RotateCw className="h-3.5 w-3.5 text-ink-500" />
      </button>

      <div className="w-px h-5 bg-cream-200" />

      {/* Save state */}
      {saveError ? (
        <span className="text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" /> {saveError}
        </span>
      ) : draftSaved ? (
        <span className="text-xs text-emerald-600">✓ Taslak kaydedildi</span>
      ) : isDirty ? (
        <span className="text-xs text-ink-400">● Kaydedilmemiş değişiklikler</span>
      ) : (
        <span className="text-xs text-emerald-600">✓ Yayınlandı</span>
      )}

      {/* Actions */}
      {isDirty && (
        <button
          onClick={onDiscard}
          className="px-3 py-1.5 text-xs rounded-md text-ink-500 hover:bg-cream-50 hover:text-ink-700 transition"
        >
          Vazgeç
        </button>
      )}
      <button
        onClick={onSaveDraft}
        disabled={isSavingDraft || !isDirty}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-cream-300 bg-white hover:bg-cream-50 disabled:opacity-50 disabled:cursor-not-allowed text-ink-600 text-xs font-medium rounded-md transition"
      >
        {isSavingDraft && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {isSavingDraft ? "..." : "Taslak Kaydet"}
      </button>
      <button
        onClick={onSave}
        disabled={isSaving || !isDirty}
        className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition"
      >
        {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {isSaving ? "Yayınlanıyor..." : "Kaydet & Yayınla"}
      </button>
    </div>
  );
}
