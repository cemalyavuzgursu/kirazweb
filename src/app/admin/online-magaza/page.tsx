import { headers } from "next/headers";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getPublishedThemeSettings, getSavedTemplates } from "@/server/actions/theme";
import { PRESET_TEMPLATES } from "@/lib/theme-settings";
import type { ThemeTemplate, ThemeSettings } from "@/lib/theme-settings";
import { PerfStats } from "./_components/perf-stats";
import { Pencil, Eye, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

function ThemeMiniPreview({ t }: { t: ThemeSettings }) {
  return (
    <div
      className="w-12 h-12 rounded-md border border-black/10 flex flex-col overflow-hidden shrink-0"
      style={{ background: t.colorBackground }}
    >
      <div className="h-3 w-full" style={{ background: t.colorPrimary }} />
      <div className="flex-1 flex items-center justify-center gap-0.5 px-1">
        <div className="h-1 rounded-full flex-1" style={{ background: t.colorText, opacity: 0.3 }} />
        <div className="h-1 rounded-full w-2" style={{ background: t.colorAccent, opacity: 0.6 }} />
      </div>
    </div>
  );
}

function ColorSwatches({ t }: { t: ThemeSettings }) {
  const colors = [t.colorBackground, t.colorPrimary, t.colorAccent, t.colorText];
  return (
    <div className="flex gap-1">
      {colors.map((c, i) => (
        <span
          key={i}
          className="w-4 h-4 rounded-sm border border-black/10"
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

function TemplateRow({
  template,
  editHref,
}: {
  template: ThemeTemplate;
  editHref: string;
}) {
  const t = template.data.themeSettings;
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-cream-200 bg-white hover:border-rose-200 transition">
      <ThemeMiniPreview t={t} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-700 truncate">{template.name}</p>
        <ColorSwatches t={t} />
      </div>
      <Link
        href={editHref}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition shrink-0"
      >
        <Pencil className="h-3 w-3" />
        Düzenle
      </Link>
    </div>
  );
}

export default async function OnlineMagazaPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/online-magaza";

  const [published, savedTemplates] = await Promise.all([
    getPublishedThemeSettings(),
    getSavedTemplates(),
  ]);

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Online Mağaza"
        description="Performans, tema ve mağaza yapılandırması"
      />

      {/* Performance Stats */}
      <section className="mb-10">
        <h2 className="font-display text-lg text-ink-700 mb-4">Performans</h2>
        <PerfStats />
      </section>

      {/* Theme Management */}
      <section className="space-y-8">
        <h2 className="font-display text-lg text-ink-700">Tema Yönetimi</h2>

        {/* Active theme */}
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-ink-400 uppercase tracking-wider mb-4">Yayındaki Tema</p>
            <div className="flex items-center gap-4 mb-4">
              <ThemeMiniPreview t={published.themeSettings} />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-700 mb-1">Aktif Tema</p>
                <ColorSwatches t={published.themeSettings} />
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/tema"
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-ink-700 text-white hover:bg-ink-800 transition"
              >
                <Pencil className="h-3.5 w-3.5" />
                Düzenle
              </Link>
              <Link
                href="/?preview=1"
                target="_blank"
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border border-cream-200 text-ink-600 hover:bg-cream-50 transition"
              >
                <Eye className="h-3.5 w-3.5" />
                Önizle
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Draft templates */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ink-600 uppercase tracking-wide">Taslak Temalar</h3>
          {savedTemplates.length === 0 ? (
            <p className="text-sm text-ink-300 px-1">Henüz kaydedilen taslak yok.</p>
          ) : (
            <div className="space-y-2">
              {savedTemplates.map((t) => (
                <TemplateRow
                  key={t.id}
                  template={t}
                  editHref={`/admin/tema?template=${t.id}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Preset templates */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-rose-400" />
            <h3 className="text-sm font-semibold text-ink-600 uppercase tracking-wide">Hazır Şablonlar</h3>
          </div>
          <div className="space-y-2">
            {PRESET_TEMPLATES.map((t) => (
              <TemplateRow
                key={t.id}
                template={t}
                editHref={`/admin/tema?template=${t.id}`}
              />
            ))}
          </div>
        </div>

        {/* Discover themes placeholder */}
        <div className="border-2 border-dashed border-cream-200 rounded-xl p-8 text-center">
          <Sparkles className="h-8 w-8 text-cream-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-ink-500 mb-1">Temaları Keşfet</p>
          <p className="text-xs text-ink-300">
            Çok yakında — daha fazla profesyonel tema geliyor
          </p>
        </div>
      </section>
    </AdminShell>
  );
}
