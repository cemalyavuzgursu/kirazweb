"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = { id: string; question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id} className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--kt-border)" }}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition"
              style={{ backgroundColor: "var(--kt-surface)" }}
              aria-expanded={isOpen}
            >
              <span className="font-medium pr-4" style={{ color: "var(--kt-heading)" }}>{item.question}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                style={{ color: "var(--kt-muted)" }}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-sm leading-relaxed" style={{ backgroundColor: "var(--kt-surface)", color: "var(--kt-text)", borderTop: "1px solid var(--kt-border)" }}>
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
