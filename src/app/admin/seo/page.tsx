import { headers } from "next/headers";
import { Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { saveSettingsForm } from "@/server/actions/settings";
import { saveRedirect, deleteRedirect } from "@/server/actions/pages";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SettingsForm } from "@/components/admin/settings-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const SEO_KEYS = [
  "seo.titleTemplate",
  "seo.defaultTitle",
  "seo.defaultDescription",
  "seo.defaultOgImage",
  "seo.googleTagManagerId",
  "seo.googleAnalyticsId",
  "seo.metaPixelId",
  "seo.searchConsoleVerification",
  "seo.robotsTxtExtra",
];

export default async function SeoPage() {
  const session = await requireAdmin(["seo:manage"]);
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/seo";

  const [s, redirects] = await Promise.all([
    getSettings(SEO_KEYS),
    prisma.redirect.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title="SEO" description="Meta etiketler, sitemap ve yönlendirmeler" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardContent className="space-y-4">
            <h3 className="font-display text-lg text-ink-700">Hızlı Linkler</h3>
            <ul className="text-sm space-y-2">
              <li>
                <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-rose-600 hover:underline">
                  /sitemap.xml
                </a>
                {" — "}
                <span className="text-ink-300">Otomatik üretilir</span>
              </li>
              <li>
                <a href="/robots.txt" target="_blank" rel="noreferrer" className="text-rose-600 hover:underline">
                  /robots.txt
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <SettingsForm action={saveSettingsForm}>
        <Card>
          <CardContent className="space-y-4">
            <h3 className="font-display text-lg text-ink-700">Genel SEO</h3>
            <div>
              <Label htmlFor="seo.titleTemplate">Başlık Şablonu</Label>
              <Input id="seo.titleTemplate" name="seo.titleTemplate" defaultValue={String(s["seo.titleTemplate"] ?? "")} />
              <p className="text-xs text-ink-300 mt-1">Örn: <code>%s | Kiraz Tasarım</code></p>
            </div>
            <div>
              <Label htmlFor="seo.defaultTitle">Varsayılan Başlık (ana sayfa)</Label>
              <Input id="seo.defaultTitle" name="seo.defaultTitle" defaultValue={String(s["seo.defaultTitle"] ?? "")} />
            </div>
            <div>
              <Label htmlFor="seo.defaultDescription">Varsayılan Meta Açıklama</Label>
              <Textarea
                id="seo.defaultDescription"
                name="seo.defaultDescription"
                rows={2}
                maxLength={160}
                defaultValue={String(s["seo.defaultDescription"] ?? "")}
              />
            </div>
            <div>
              <Label htmlFor="seo.defaultOgImage">Varsayılan OG Image URL</Label>
              <Input id="seo.defaultOgImage" name="seo.defaultOgImage" defaultValue={String(s["seo.defaultOgImage"] ?? "")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <h3 className="font-display text-lg text-ink-700">Analitik & Doğrulama</h3>
            <div>
              <Label htmlFor="seo.googleTagManagerId">Google Tag Manager ID</Label>
              <Input id="seo.googleTagManagerId" name="seo.googleTagManagerId" defaultValue={String(s["seo.googleTagManagerId"] ?? "")} placeholder="GTM-XXXXXXX" />
              <p className="text-xs text-ink-300 mt-1">GTM varsa GA4 ile birlikte kullanmayın, çakışır.</p>
            </div>
            <div>
              <Label htmlFor="seo.googleAnalyticsId">Google Analytics 4 ID</Label>
              <Input id="seo.googleAnalyticsId" name="seo.googleAnalyticsId" defaultValue={String(s["seo.googleAnalyticsId"] ?? "")} placeholder="G-XXXXXXXXXX" />
            </div>
            <div>
              <Label htmlFor="seo.metaPixelId">Meta Pixel ID</Label>
              <Input id="seo.metaPixelId" name="seo.metaPixelId" defaultValue={String(s["seo.metaPixelId"] ?? "")} />
            </div>
            <div>
              <Label htmlFor="seo.searchConsoleVerification">Search Console Doğrulama</Label>
              <Input id="seo.searchConsoleVerification" name="seo.searchConsoleVerification" defaultValue={String(s["seo.searchConsoleVerification"] ?? "")} placeholder="meta tag içeriği" />
            </div>
            <div>
              <Label htmlFor="seo.robotsTxtExtra">robots.txt — Ek Kurallar</Label>
              <Textarea id="seo.robotsTxtExtra" name="seo.robotsTxtExtra" rows={3} defaultValue={String(s["seo.robotsTxtExtra"] ?? "")} />
            </div>
          </CardContent>
        </Card>
      </SettingsForm>

      <Card className="mt-6">
        <CardContent>
          <h3 className="font-display text-lg text-ink-700 mb-4">URL Yönlendirmeleri</h3>
          <form action={saveRedirect} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_auto] gap-2 items-end mb-6">
            <div>
              <Label>Eski Yol</Label>
              <Input name="fromPath" placeholder="/eski-urun" required />
            </div>
            <div>
              <Label>Yeni Yol</Label>
              <Input name="toPath" placeholder="/urunler/yeni-urun" required />
            </div>
            <div>
              <Label>Tip</Label>
              <select name="statusCode" className="flex h-10 w-full rounded-md border border-cream-200 bg-white px-3 text-sm">
                <option value="301">301 (kalıcı)</option>
                <option value="302">302 (geçici)</option>
              </select>
            </div>
            <input type="hidden" name="isActive" value="on" />
            <Button type="submit">Ekle</Button>
          </form>

          <ul className="divide-y divide-cream-100 border-t border-cream-100">
            {redirects.map((r) => (
              <li key={r.id} className="py-2 text-sm flex items-center gap-2">
                <code className="text-ink-700">{r.fromPath}</code>
                <span className="text-ink-300">→</span>
                <code className="text-ink-700">{r.toPath}</code>
                <span className="text-xs text-ink-300 ml-2">{r.statusCode}</span>
                <form action={deleteRedirect} className="ml-auto">
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="text-ink-300 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </li>
            ))}
            {redirects.length === 0 ? (
              <li className="py-4 text-sm text-ink-300 text-center">Henüz yönlendirme yok.</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
