"use client";

import { Eye, EyeOff, Trash2, ChevronDown, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PageSection } from "@/lib/page-sections";
import { SECTION_META } from "@/lib/page-sections";
import { SectionEditor } from "./section-editors";

interface SectionItemProps {
  section: PageSection;
  isExpanded: boolean;
  onExpand: () => void;
  dispatch: (action: any) => void;
}

export function SectionItem({ section, isExpanded, onExpand, dispatch }: SectionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const meta = SECTION_META[section.type];

  return (
    <div ref={setNodeRef} style={style} className="border-b border-cream-100">
      {/* Header row */}
      <div
        className={`flex items-center gap-1.5 px-2 py-2.5 cursor-pointer hover:bg-cream-50 transition ${
          isExpanded ? "bg-rose-50" : ""
        }`}
        onClick={onExpand}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-1 text-ink-200 hover:text-ink-500 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Sürükle"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Icon */}
        <span className="text-base w-5 text-center shrink-0">{meta.icon}</span>

        {/* Name + desc */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isExpanded ? "text-rose-700" : "text-ink-700"}`}>
            {meta.label}
          </p>
          {section.settings.title && (
            <p className="text-xs text-ink-300 truncate">{section.settings.title}</p>
          )}
        </div>

        {/* Visibility */}
        <button
          onClick={(e) => { e.stopPropagation(); dispatch({ type: "TOGGLE_SECTION_VISIBLE", id: section.id }); }}
          className="p-1 text-ink-300 hover:text-ink-600 transition"
          title={section.visible ? "Gizle" : "Göster"}
        >
          {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-ink-200" />}
        </button>

        {/* Expand arrow */}
        <ChevronDown
          className={`h-3.5 w-3.5 text-ink-300 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </div>

      {/* Settings panel */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 bg-rose-50/30 border-t border-rose-100">
          <SectionEditor section={section} dispatch={dispatch} />

          <button
            onClick={() => { dispatch({ type: "REMOVE_SECTION", id: section.id }); }}
            className="mt-3 flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Bu bölümü kaldır
          </button>
        </div>
      )}
    </div>
  );
}
