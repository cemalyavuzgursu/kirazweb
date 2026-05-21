"use client";

import type { Dispatch, SetStateAction } from "react";
import type { EditorUIState } from "../editor-client";
import type { EditorData, ThemeTemplate } from "@/lib/theme-settings";
import { SectionsPanel } from "./sections-panel";
import { ThemeSettingsPanel } from "./theme-settings-panel";
import { PageSettingsPanel } from "./page-settings-panel";
import { TemplateManager } from "./template-manager";
import { CustomCssEditor } from "./custom-css-editor";
import { HeaderEditor } from "./header-editor";
import { FooterEditor } from "./footer-editor";

interface SidebarProps {
  ui: EditorUIState;
  setUI: Dispatch<SetStateAction<EditorUIState>>;
  data: EditorData;
  dispatch: (action: any) => void;
  templates: ThemeTemplate[];
  setTemplates: Dispatch<SetStateAction<ThemeTemplate[]>>;
  onPreviewRefresh: () => void;
}

export function Sidebar({ ui, setUI, data, dispatch, templates, setTemplates, onPreviewRefresh }: SidebarProps) {
  const showSectionsTab = ui.currentPage === "homepage";
  const showPageSettingsTab = ui.currentPage === "product" || ui.currentPage === "category";

  type TabKey = "sections" | "theme" | "templates" | "page" | "header" | "footer";

  const tabs: TabKey[] = showSectionsTab
    ? ["sections", "header", "footer", "theme", "templates"]
    : ["page", "header", "footer", "theme", "templates"];

  const tabLabels: Record<TabKey, string> = {
    sections: "Bölümler",
    theme: "Tema",
    templates: "Şablonlar",
    page: "Sayfa",
    header: "Üstbilgi",
    footer: "Alt Bilgi",
  };

  const activeTab = ui.activeTab as TabKey;

  return (
    <div className="w-[360px] shrink-0 bg-white border-r border-cream-200 flex flex-col overflow-hidden shadow-sm">
      {/* Tabs */}
      <div className="flex border-b border-cream-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setUI((u) => ({ ...u, activeTab: tab as any }))}
            className={`flex-1 py-2.5 text-xs font-medium transition ${
              activeTab === tab
                ? "border-b-2 border-rose-500 text-rose-600"
                : "text-ink-400 hover:text-ink-600"
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "sections" && showSectionsTab && (
          <SectionsPanel
            sections={data.homepageSections}
            expandedSectionId={ui.expandedSectionId}
            onExpand={(id) => setUI((u) => ({ ...u, expandedSectionId: u.expandedSectionId === id ? null : id }))}
            dispatch={dispatch}
            isAddSectionOpen={ui.isAddSectionOpen}
            setIsAddSectionOpen={(v) => setUI((u) => ({ ...u, isAddSectionOpen: v }))}
          />
        )}

        {activeTab === "header" && (
          <HeaderEditor
            settings={data.themeSettings}
            globalSettings={data.globalSettings}
            dispatch={dispatch}
          />
        )}

        {activeTab === "footer" && (
          <FooterEditor settings={data.themeSettings} dispatch={dispatch} />
        )}

        {activeTab === "theme" && (
          <div className="flex flex-col gap-0">
            <ThemeSettingsPanel settings={data.themeSettings} dispatch={dispatch} />
            <div className="border-t border-cream-100">
              <CustomCssEditor value={data.customCss} onChange={(css) => dispatch({ type: "SET_CUSTOM_CSS", css })} />
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <TemplateManager
            templates={templates}
            setTemplates={setTemplates}
            currentData={data}
            dispatch={dispatch}
          />
        )}

        {activeTab === "page" && showPageSettingsTab && (
          <PageSettingsPanel
            currentPage={ui.currentPage as "product" | "category"}
            productPageSettings={data.productPageSettings}
            categoryPageSettings={data.categoryPageSettings}
            dispatch={dispatch}
          />
        )}

      </div>
    </div>
  );
}
