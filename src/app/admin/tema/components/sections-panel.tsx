"use client";

import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { PageSection } from "@/lib/page-sections";
import { SectionItem } from "./section-item";
import { AddSectionDrawer } from "./add-section-drawer";

interface SectionsPanelProps {
  sections: PageSection[];
  expandedSectionId: string | null;
  onExpand: (id: string) => void;
  dispatch: (action: any) => void;
  isAddSectionOpen: boolean;
  setIsAddSectionOpen: (v: boolean) => void;
}

export function SectionsPanel({
  sections,
  expandedSectionId,
  onExpand,
  dispatch,
  isAddSectionOpen,
  setIsAddSectionOpen,
}: SectionsPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    dispatch({ type: "SET_SECTIONS", sections: arrayMove(sections, oldIdx, newIdx) });
  };

  return (
    <div className="flex flex-col">
      <div className="px-3 py-2 bg-cream-50 border-b border-cream-100 flex items-center justify-between">
        <span className="text-xs text-ink-400 font-medium uppercase tracking-wider">Ana Sayfa Bölümleri</span>
        <span className="text-xs text-ink-300">{sections.length} bölüm</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              isExpanded={expandedSectionId === section.id}
              onExpand={() => onExpand(section.id)}
              dispatch={dispatch}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={() => setIsAddSectionOpen(true)}
        className="flex items-center justify-center gap-2 mx-3 my-3 py-2.5 border-2 border-dashed border-cream-300 rounded-lg text-sm text-ink-400 hover:border-rose-300 hover:text-rose-500 transition"
      >
        <Plus className="h-4 w-4" />
        Bölüm Ekle
      </button>

      {isAddSectionOpen && (
        <AddSectionDrawer
          onClose={() => setIsAddSectionOpen(false)}
          onAdd={(section) => {
            dispatch({ type: "ADD_SECTION", section });
            setIsAddSectionOpen(false);
          }}
        />
      )}
    </div>
  );
}
