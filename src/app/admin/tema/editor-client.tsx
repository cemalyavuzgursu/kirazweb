"use client";

import { useReducer, useState, useCallback, useRef, useEffect } from "react";
import { type EditorData, type ThemeTemplate, buildCssVars } from "@/lib/theme-settings";
import { type PageSection, type SectionBlock } from "@/lib/page-sections";
import { saveDraft, publishTheme } from "@/server/actions/theme";
import { TopBar } from "./components/top-bar";
import { Sidebar } from "./components/sidebar";

export type PageTemplate = "homepage" | "product" | "category";
export type DeviceSize = "desktop" | "tablet" | "mobile";

export interface EditorUIState {
  currentPage: PageTemplate;
  expandedSectionId: string | null;
  activeTab: "sections" | "theme" | "templates" | "page" | "header" | "footer";
  deviceSize: DeviceSize;
  isAddSectionOpen: boolean;
  isTemplateManagerOpen: boolean;
  isSaving: boolean;
  saveError: string | null;
}

// Reducer for undoable data
type DataAction =
  | { type: "SET_SECTIONS"; sections: PageSection[] }
  | { type: "TOGGLE_SECTION_VISIBLE"; id: string }
  | { type: "UPDATE_SECTION_SETTINGS"; id: string; settings: Record<string, unknown> }
  | { type: "ADD_SECTION"; section: PageSection }
  | { type: "REMOVE_SECTION"; id: string }
  | { type: "ADD_BLOCK"; sectionId: string; block: SectionBlock }
  | { type: "UPDATE_BLOCK"; sectionId: string; blockId: string; settings: Record<string, unknown> }
  | { type: "REMOVE_BLOCK"; sectionId: string; blockId: string }
  | { type: "MOVE_BLOCK"; sectionId: string; fromIndex: number; toIndex: number }
  | { type: "UPDATE_THEME"; settings: Partial<EditorData["themeSettings"]> }
  | { type: "UPDATE_GLOBAL"; settings: Partial<EditorData["globalSettings"]> }
  | { type: "UPDATE_GLOBAL_BAR"; settings: Partial<EditorData["globalSettings"]["announcementBar"]> }
  | { type: "UPDATE_PRODUCT_PAGE"; settings: Partial<EditorData["productPageSettings"]> }
  | { type: "UPDATE_CATEGORY_PAGE"; settings: Partial<EditorData["categoryPageSettings"]> }
  | { type: "SET_CUSTOM_CSS"; css: string }
  | { type: "LOAD_TEMPLATE"; data: Partial<EditorData> };

function dataReducer(state: EditorData, action: DataAction): EditorData {
  switch (action.type) {
    case "SET_SECTIONS":
      return { ...state, homepageSections: action.sections };
    case "TOGGLE_SECTION_VISIBLE":
      return {
        ...state,
        homepageSections: state.homepageSections.map((s) =>
          s.id === action.id ? { ...s, visible: !s.visible } : s,
        ),
      };
    case "UPDATE_SECTION_SETTINGS":
      return {
        ...state,
        homepageSections: state.homepageSections.map((s) =>
          s.id === action.id ? { ...s, settings: { ...s.settings, ...action.settings } } : s,
        ),
      };
    case "ADD_SECTION":
      return { ...state, homepageSections: [...state.homepageSections, action.section] };
    case "REMOVE_SECTION":
      return { ...state, homepageSections: state.homepageSections.filter((s) => s.id !== action.id) };
    case "ADD_BLOCK":
      return {
        ...state,
        homepageSections: state.homepageSections.map((s) =>
          s.id === action.sectionId ? { ...s, blocks: [...(s.blocks ?? []), action.block] } : s,
        ),
      };
    case "UPDATE_BLOCK":
      return {
        ...state,
        homepageSections: state.homepageSections.map((s) =>
          s.id === action.sectionId
            ? {
                ...s,
                blocks: (s.blocks ?? []).map((b) =>
                  b.id === action.blockId ? { ...b, settings: { ...b.settings, ...action.settings } } : b,
                ),
              }
            : s,
        ),
      };
    case "REMOVE_BLOCK":
      return {
        ...state,
        homepageSections: state.homepageSections.map((s) =>
          s.id === action.sectionId
            ? { ...s, blocks: (s.blocks ?? []).filter((b) => b.id !== action.blockId) }
            : s,
        ),
      };
    case "MOVE_BLOCK":
      return {
        ...state,
        homepageSections: state.homepageSections.map((s) => {
          if (s.id !== action.sectionId) return s;
          const blocks = [...(s.blocks ?? [])];
          const [removed] = blocks.splice(action.fromIndex, 1);
          blocks.splice(action.toIndex, 0, removed);
          return { ...s, blocks };
        }),
      };
    case "UPDATE_THEME":
      return { ...state, themeSettings: { ...state.themeSettings, ...action.settings } };
    case "UPDATE_GLOBAL":
      return { ...state, globalSettings: { ...state.globalSettings, ...action.settings } };
    case "UPDATE_GLOBAL_BAR":
      return {
        ...state,
        globalSettings: {
          ...state.globalSettings,
          announcementBar: { ...state.globalSettings.announcementBar, ...action.settings },
        },
      };
    case "UPDATE_PRODUCT_PAGE":
      return { ...state, productPageSettings: { ...state.productPageSettings, ...action.settings } };
    case "UPDATE_CATEGORY_PAGE":
      return { ...state, categoryPageSettings: { ...state.categoryPageSettings, ...action.settings } };
    case "SET_CUSTOM_CSS":
      return { ...state, customCss: action.css };
    case "LOAD_TEMPLATE":
      return {
        ...state,
        themeSettings: action.data.themeSettings ?? state.themeSettings,
        customCss: action.data.customCss ?? state.customCss,
        homepageSections: action.data.homepageSections ?? state.homepageSections,
        productPageSettings: action.data.productPageSettings
          ? { ...state.productPageSettings, ...action.data.productPageSettings }
          : state.productPageSettings,
        categoryPageSettings: action.data.categoryPageSettings
          ? { ...state.categoryPageSettings, ...action.data.categoryPageSettings }
          : state.categoryPageSettings,
      };
    default:
      return state;
  }
}

interface HistoryState {
  past: EditorData[];
  present: EditorData;
  future: EditorData[];
}

type HistoryAction = DataAction | { type: "UNDO" } | { type: "REDO" } | { type: "RESET"; data: EditorData };

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  if (action.type === "UNDO") {
    if (state.past.length === 0) return state;
    return {
      past: state.past.slice(0, -1),
      present: state.past[state.past.length - 1],
      future: [state.present, ...state.future.slice(0, 49)],
    };
  }
  if (action.type === "REDO") {
    if (state.future.length === 0) return state;
    return {
      past: [...state.past.slice(-49), state.present],
      present: state.future[0],
      future: state.future.slice(1),
    };
  }
  if (action.type === "RESET") {
    return { past: [], present: action.data, future: [] };
  }
  return {
    past: [...state.past.slice(-49), state.present],
    present: dataReducer(state.present, action as DataAction),
    future: [],
  };
}

interface ThemeEditorClientProps {
  initialData: EditorData;
  savedTemplates: ThemeTemplate[];
  siteUrl: string;
  previewSlugs: { product: string | null; category: string | null };
}

export function ThemeEditorClient({ initialData, savedTemplates: initialTemplates, siteUrl, previewSlugs }: ThemeEditorClientProps) {
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialData,
    future: [],
  });
  const data = history.present;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;
  const isDirty = history.past.length > 0;

  const [ui, setUI] = useState<EditorUIState>({
    currentPage: "homepage",
    expandedSectionId: null,
    activeTab: "sections",
    deviceSize: "desktop",
    isAddSectionOpen: false,
    isTemplateManagerOpen: false,
    isSaving: false,
    saveError: null,
  });
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const [templates, setTemplates] = useState<ThemeTemplate[]>(initialTemplates);
  const [previewTs, setPreviewTs] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const needsContentReload = useRef(false);
  const themeRef = useRef(data.themeSettings);
  themeRef.current = data.themeSettings;

  // Stable initial timestamp after mount (avoids hydration mismatch)
  useEffect(() => { setPreviewTs(Date.now()); }, []);

  // Relative URL — middleware bypasses admin rewrite when ?preview=1 is present,
  // so the iframe loads the public page on the same origin. No CSP/X-Frame issues.
  const previewPath =
    ui.currentPage === "homepage" ? "/"
    : ui.currentPage === "product"
      ? previewSlugs.product ? `/urunler/${previewSlugs.product}` : "/urunler"
    : ui.currentPage === "category"
      ? previewSlugs.category ? `/kategori/${previewSlugs.category}` : "/"
    : "/";
  const previewUrl = `${previewPath}?preview=1&t=${previewTs}`;

  // Send CSS vars to iframe via postMessage for instant visual feedback
  const sendThemeToIframe = useCallback((themeSettings: EditorData["themeSettings"]) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "KIRAZ_THEME_PREVIEW", vars: buildCssVars(themeSettings) },
      "*",
    );
  }, []);

  // Debounced draft save → reload iframe only for non-theme changes
  const scheduleDraftSave = useCallback((d: EditorData) => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(async () => {
      await saveDraft(d);
      if (needsContentReload.current) {
        needsContentReload.current = false;
        setPreviewTs(Date.now());
      }
    }, 400);
  }, []);

  // Dispatch with side effects: instant CSS postMessage + debounced draft save
  const dispatchData = useCallback(
    (action: DataAction) => {
      dispatch(action);
      if (action.type === "UPDATE_THEME") {
        const merged = { ...data.themeSettings, ...action.settings };
        setTimeout(() => sendThemeToIframe(merged), 0);
        // headerStyle and logoHeight require HTML re-render (server component),
        // not just CSS var update, so trigger a draft save + iframe reload.
        if ("headerStyle" in action.settings || "headerLogoHeight" in action.settings) {
          needsContentReload.current = true;
        }
      } else {
        needsContentReload.current = true;
      }
      if (action.type === "LOAD_TEMPLATE" && action.data.themeSettings) {
        setTimeout(() => sendThemeToIframe(action.data.themeSettings!), 0);
      }
    },
    [data.themeSettings, sendThemeToIframe],
  );

  // When iframe signals it's ready (after hydration), send current theme
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "KIRAZ_PREVIEW_READY") {
        sendThemeToIframe(themeRef.current);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [sendThemeToIframe]);

  // Re-send theme to iframe whenever it (re)loads (fallback for non-SPA navigation)
  const handleIframeLoad = useCallback(() => {
    sendThemeToIframe(data.themeSettings);
  }, [data.themeSettings, sendThemeToIframe]);

  // When data changes, schedule draft save
  useEffect(() => {
    if (isDirty) scheduleDraftSave(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        dispatch({ type: "REDO" });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSave = async () => {
    setUI((u) => ({ ...u, isSaving: true, saveError: null }));
    setDraftSaved(false);
    try {
      await publishTheme(data);
      dispatch({ type: "RESET", data });
      setPreviewTs(Date.now());
    } catch {
      setUI((u) => ({ ...u, isSaving: false, saveError: "Yayınlama başarısız oldu." }));
      return;
    }
    setUI((u) => ({ ...u, isSaving: false }));
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setDraftSaved(false);
    try {
      await saveDraft(data);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch {
      // silent fail — draft save is best-effort
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleDiscard = () => { window.location.reload(); };

  const DEVICE_WIDTHS: Record<DeviceSize, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f0f0f0]">
      <TopBar
        currentPage={ui.currentPage}
        onPageChange={(p) => setUI((u) => ({ ...u, currentPage: p, expandedSectionId: null }))}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => dispatch({ type: "UNDO" })}
        onRedo={() => dispatch({ type: "REDO" })}
        isDirty={isDirty}
        isSaving={ui.isSaving}
        isSavingDraft={isSavingDraft}
        draftSaved={draftSaved}
        saveError={ui.saveError}
        onSave={handleSave}
        onSaveDraft={handleSaveDraft}
        onDiscard={handleDiscard}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          ui={ui}
          setUI={setUI}
          data={data}
          dispatch={dispatchData}
          templates={templates}
          setTemplates={setTemplates}
          onPreviewRefresh={() => setPreviewTs(Date.now())}
        />

        {/* Preview area */}
        <div className="flex-1 flex flex-col overflow-hidden p-3 gap-2">
          {/* Device toolbar */}
          <div className="flex items-center justify-center gap-1">
            {(["desktop", "tablet", "mobile"] as DeviceSize[]).map((d) => (
              <button
                key={d}
                onClick={() => setUI((u) => ({ ...u, deviceSize: d }))}
                className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                  ui.deviceSize === d ? "bg-white shadow text-ink-700" : "text-ink-400 hover:text-ink-600"
                }`}
              >
                {d === "desktop" ? "💻 Masaüstü" : d === "tablet" ? "📱 Tablet" : "📱 Mobil"}
              </button>
            ))}
            <a
              href={`${siteUrl}${previewPath}?preview=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 px-3 py-1.5 rounded text-xs text-ink-400 hover:text-ink-600 transition"
            >
              🔗 Yeni sekme
            </a>
          </div>

          {/* Iframe container */}
          <div className="flex-1 flex justify-center overflow-hidden">
            <div
              className="relative h-full bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300"
              style={{ width: DEVICE_WIDTHS[ui.deviceSize] }}
            >
              {previewTs > 0 && (
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  onLoad={handleIframeLoad}
                  className="w-full h-full border-0"
                  title="Site Önizleme"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
