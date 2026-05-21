"use client";

import { useState } from "react";
import { ChevronDown, Code2 } from "lucide-react";

interface CustomCssEditorProps {
  value: string;
  onChange: (css: string) => void;
}

export function CustomCssEditor({ value, onChange }: CustomCssEditorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-ink-600 hover:bg-cream-50 transition"
      >
        <span className="flex items-center gap-2 font-medium">
          <Code2 className="h-4 w-4" />
          Özel CSS
        </span>
        <ChevronDown className={`h-4 w-4 text-ink-300 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-cream-100 pt-3">
          <p className="text-xs text-ink-300 mb-2">
            Siteye özel CSS ekleyin. Yalnızca güvenilir içerik girin.
          </p>
          <textarea
            className="w-full h-48 px-3 py-2.5 text-xs font-mono border border-cream-200 rounded-md bg-ink-900 text-cream-100 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-y"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`/* Özel CSS */\n.my-element {\n  color: red;\n}`}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
