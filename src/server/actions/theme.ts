"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { parseSections, DEFAULT_SECTIONS } from "@/lib/page-sections";
import {
  DEFAULT_THEME_SETTINGS,
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_PRODUCT_PAGE_SETTINGS,
  DEFAULT_CATEGORY_PAGE_SETTINGS,
  type EditorData,
  type ThemeTemplate,
  type ThemeSettings,
  type GlobalSettings,
  type ProductPageSettings,
  type CategoryPageSettings,
} from "@/lib/theme-settings";
import crypto from "node:crypto";

function cast<T>(v: unknown): T {
  return v as T;
}

async function row(key: string) {
  return prisma.setting.findUnique({ where: { key } });
}

export async function getThemeEditorData(): Promise<EditorData> {
  const [sectionsRow, themeRow, globalRow, productRow, categoryRow, cssRow] = await Promise.all([
    row("homepage.sections"),
    row("theme.settings"),
    row("global.settings"),
    row("product_page.settings"),
    row("category_page.settings"),
    row("theme.custom_css"),
  ]);

  return {
    homepageSections: parseSections(sectionsRow?.value ?? DEFAULT_SECTIONS),
    themeSettings: themeRow?.value ? cast<ThemeSettings>(themeRow.value) : DEFAULT_THEME_SETTINGS,
    globalSettings: globalRow?.value ? cast<GlobalSettings>(globalRow.value) : DEFAULT_GLOBAL_SETTINGS,
    productPageSettings: productRow?.value ? cast<ProductPageSettings>(productRow.value) : DEFAULT_PRODUCT_PAGE_SETTINGS,
    categoryPageSettings: categoryRow?.value ? cast<CategoryPageSettings>(categoryRow.value) : DEFAULT_CATEGORY_PAGE_SETTINGS,
    customCss: typeof cssRow?.value === "string" ? cssRow.value : String(cssRow?.value ?? ""),
  };
}

export async function saveDraft(data: EditorData): Promise<void> {
  await requireAdmin();
  await prisma.setting.upsert({
    where: { key: "theme.draft" },
    update: { value: data as never },
    create: { key: "theme.draft", value: data as never },
  });
}

export async function getDraftData(): Promise<EditorData | null> {
  const r = await row("theme.draft");
  if (!r) return null;
  return cast<EditorData>(r.value);
}

export async function publishTheme(data: EditorData): Promise<void> {
  await requireAdmin();

  const upserts = [
    { key: "homepage.sections", value: data.homepageSections as never },
    { key: "theme.settings", value: data.themeSettings as never },
    { key: "global.settings", value: data.globalSettings as never },
    { key: "product_page.settings", value: data.productPageSettings as never },
    { key: "category_page.settings", value: data.categoryPageSettings as never },
    { key: "theme.custom_css", value: data.customCss as never },
    { key: "theme.draft", value: data as never },
  ];

  await Promise.all(
    upserts.map((u) =>
      prisma.setting.upsert({
        where: { key: u.key },
        update: { value: u.value },
        create: { key: u.key, value: u.value },
      }),
    ),
  );

  revalidatePath("/", "layout");
  revalidatePath("/urunler", "layout");
  revalidatePath("/kategori", "layout");
}

export async function discardDraft(): Promise<void> {
  await requireAdmin();
  await prisma.setting.deleteMany({ where: { key: "theme.draft" } });
}

export async function getSavedTemplates(): Promise<ThemeTemplate[]> {
  const r = await row("theme.templates");
  if (!r || !Array.isArray(r.value)) return [];
  return cast<ThemeTemplate[]>(r.value);
}

export async function saveTemplate(name: string, data: EditorData): Promise<void> {
  await requireAdmin();
  const existing = await getSavedTemplates();
  const newTemplate: ThemeTemplate = {
    id: crypto.randomBytes(6).toString("hex"),
    name,
    createdAt: new Date().toISOString(),
    data: { themeSettings: data.themeSettings, customCss: data.customCss },
  };
  const updated = [...existing, newTemplate];
  await prisma.setting.upsert({
    where: { key: "theme.templates" },
    update: { value: updated as never },
    create: { key: "theme.templates", value: updated as never },
  });
}

export async function deleteTemplate(id: string): Promise<void> {
  await requireAdmin();
  const existing = await getSavedTemplates();
  const updated = existing.filter((t) => t.id !== id);
  await prisma.setting.upsert({
    where: { key: "theme.templates" },
    update: { value: updated as never },
    create: { key: "theme.templates", value: updated as never },
  });
}

export async function getPublishedThemeSettings() {
  const [themeRow, globalRow, cssRow] = await Promise.all([
    row("theme.settings"),
    row("global.settings"),
    row("theme.custom_css"),
  ]);
  return {
    themeSettings: themeRow?.value ? cast<ThemeSettings>(themeRow.value) : DEFAULT_THEME_SETTINGS,
    globalSettings: globalRow?.value ? cast<GlobalSettings>(globalRow.value) : DEFAULT_GLOBAL_SETTINGS,
    customCss: typeof cssRow?.value === "string" ? cssRow.value : String(cssRow?.value ?? ""),
  };
}

export async function getProductPageSettings(): Promise<ProductPageSettings> {
  const r = await row("product_page.settings");
  return r?.value ? cast<ProductPageSettings>(r.value) : DEFAULT_PRODUCT_PAGE_SETTINGS;
}

export async function getCategoryPageSettings(): Promise<CategoryPageSettings> {
  const r = await row("category_page.settings");
  return r?.value ? cast<CategoryPageSettings>(r.value) : DEFAULT_CATEGORY_PAGE_SETTINGS;
}
