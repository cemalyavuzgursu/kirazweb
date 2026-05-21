"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <label className="text-sm text-ink-600 flex-1">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-ink-300 w-16 text-right">{value}</span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-8 h-8 rounded-md border-2 border-cream-200 shadow-sm hover:border-cream-400 transition cursor-pointer overflow-hidden"
          style={{ backgroundColor: value }}
          aria-label={`${label} rengi seç`}
        />
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          aria-hidden
        />
      </div>
    </div>
  );
}
