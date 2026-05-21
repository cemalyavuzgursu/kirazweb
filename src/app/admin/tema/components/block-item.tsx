"use client";

import { Plus, Trash2, GripVertical, ChevronDown } from "lucide-react";
import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PageSection, SectionBlock } from "@/lib/page-sections";

const inputCls =
  "w-full px-2.5 py-1.5 text-sm border border-cream-200 rounded-md bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-rose-200";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-ink-400">{label}</label>
      {children}
    </div>
  );
}

function BlockEditor({
  block,
  sectionType,
  dispatch,
  sectionId,
}: {
  block: SectionBlock;
  sectionType: "features" | "testimonials";
  dispatch: (a: any) => void;
  sectionId: string;
}) {
  const upd = (settings: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK", sectionId, blockId: block.id, settings });

  if (sectionType === "features") {
    return (
      <div className="space-y-2">
        <Field label="İkon (emoji)">
          <input className={inputCls} value={block.settings.icon ?? ""} onChange={(e) => upd({ icon: e.target.value })} placeholder="✨" />
        </Field>
        <Field label="Başlık">
          <input className={inputCls} value={block.settings.title ?? ""} onChange={(e) => upd({ title: e.target.value })} placeholder="Özellik başlığı" />
        </Field>
        <Field label="Açıklama">
          <textarea
            className={`${inputCls} min-h-[60px] resize-none`}
            value={block.settings.description ?? ""}
            onChange={(e) => upd({ description: e.target.value })}
            placeholder="Kısa açıklama..."
          />
        </Field>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Field label="Yorum">
        <textarea
          className={`${inputCls} min-h-[70px] resize-none`}
          value={block.settings.content ?? ""}
          onChange={(e) => upd({ content: e.target.value })}
          placeholder="Müşteri yorumu..."
        />
      </Field>
      <Field label="İsim">
        <input className={inputCls} value={block.settings.author ?? ""} onChange={(e) => upd({ author: e.target.value })} placeholder="Ad Soyad" />
      </Field>
      <Field label="Ünvan">
        <input className={inputCls} value={block.settings.role ?? ""} onChange={(e) => upd({ role: e.target.value })} placeholder="Müşteri" />
      </Field>
      <Field label="Puan (1-5)">
        <input
          type="number"
          className={inputCls}
          min={1}
          max={5}
          value={block.settings.rating ?? 5}
          onChange={(e) => upd({ rating: Number(e.target.value) })}
        />
      </Field>
    </div>
  );
}

function SortableBlockItem({
  block,
  sectionType,
  sectionId,
  dispatch,
}: {
  block: SectionBlock;
  sectionType: "features" | "testimonials";
  sectionId: string;
  dispatch: (a: any) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const label =
    sectionType === "features"
      ? block.settings.title || "Özellik"
      : block.settings.author || "Yorum";

  return (
    <div ref={setNodeRef} style={style} className="border border-cream-200 rounded-lg overflow-hidden">
      <div
        className={`flex items-center gap-1.5 px-2 py-2 cursor-pointer ${expanded ? "bg-cream-50" : "bg-white"}`}
        onClick={() => setExpanded((e) => !e)}
      >
        <button {...attributes} {...listeners} onClick={(e) => e.stopPropagation()} className="cursor-grab p-0.5">
          <GripVertical className="h-3.5 w-3.5 text-ink-200" />
        </button>
        {sectionType === "features" && block.settings.icon && (
          <span className="text-sm">{block.settings.icon}</span>
        )}
        <span className="flex-1 text-sm text-ink-600 truncate">{label}</span>
        <button
          onClick={(e) => { e.stopPropagation(); dispatch({ type: "REMOVE_BLOCK", sectionId, blockId: block.id }); }}
          className="p-0.5 text-ink-200 hover:text-rose-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <ChevronDown className={`h-3.5 w-3.5 text-ink-300 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </div>
      {expanded && (
        <div className="px-3 py-2.5 border-t border-cream-100 bg-cream-50/50">
          <BlockEditor block={block} sectionType={sectionType} dispatch={dispatch} sectionId={sectionId} />
        </div>
      )}
    </div>
  );
}

export function BlocksPanel({
  section,
  dispatch,
}: {
  section: PageSection;
  dispatch: (a: any) => void;
}) {
  const sectionType = section.type as "features" | "testimonials";
  const blocks = section.blocks ?? [];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    if (oldIdx !== -1 && newIdx !== -1) {
      dispatch({ type: "MOVE_BLOCK", sectionId: section.id, fromIndex: oldIdx, toIndex: newIdx });
    }
  };

  const addBlock = () => {
    const id = Math.random().toString(36).slice(2, 10);
    const newBlock: SectionBlock =
      sectionType === "features"
        ? { id, type: "feature", settings: { icon: "✨", title: "Yeni Özellik", description: "" } }
        : { id, type: "testimonial", settings: { content: "", author: "", role: "Müşteri", rating: 5 } };
    dispatch({ type: "ADD_BLOCK", sectionId: section.id, block: newBlock });
  };

  const blockLabel = sectionType === "features" ? "Özellik" : "Yorum";

  return (
    <div className="space-y-2">
      <p className="text-xs text-ink-400 font-medium uppercase tracking-wider">Bloklar</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {blocks.map((block) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                sectionType={sectionType}
                sectionId={section.id}
                dispatch={dispatch}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button
        onClick={addBlock}
        className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 py-1 transition"
      >
        <Plus className="h-3.5 w-3.5" />
        {blockLabel} Ekle
      </button>
    </div>
  );
}
