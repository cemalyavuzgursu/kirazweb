import { requireAdmin } from "@/lib/admin-guard";
import { getThemeEditorData, getSavedTemplates } from "@/server/actions/theme";
import { ThemeEditorClient } from "./editor-client";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { PRESET_TEMPLATES } from "@/lib/theme-settings";

export const dynamic = "force-dynamic";

export default async function ThemeEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const templateId = sp.template;

  const [initialData, savedTemplates, previewProduct, previewCategory] = await Promise.all([
    getThemeEditorData(),
    getSavedTemplates(),
    prisma.product.findFirst({ where: { isActive: true }, select: { slug: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findFirst({ where: { isActive: true }, select: { slug: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (templateId) {
    const found =
      savedTemplates.find((t) => t.id === templateId) ??
      PRESET_TEMPLATES.find((t) => t.id === templateId);
    if (found) {
      initialData.themeSettings = found.data.themeSettings;
      initialData.customCss = found.data.customCss;
    }
  }

  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  return (
    <ThemeEditorClient
      initialData={initialData}
      savedTemplates={savedTemplates}
      siteUrl={siteUrl}
      previewSlugs={{ product: previewProduct?.slug ?? null, category: previewCategory?.slug ?? null }}
    />
  );
}
