import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { savePage } from "@/server/actions/pages";

export const dynamic = "force-dynamic";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const { id } = await params;
  const isNew = id === "yeni";

  const page = isNew ? null : await prisma.page.findUnique({ where: { id } });
  if (!isNew && !page) notFound();

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title={isNew ? "Yeni Sayfa" : page!.title} />
      <form action={savePage} className="space-y-6 max-w-4xl">
        {page?.id ? <input type="hidden" name="id" value={page.id} /> : null}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Başlık *</Label>
                  <Input id="title" name="title" defaultValue={page?.title} required />
                </div>
                <div>
                  <Label htmlFor="slug">URL slug *</Label>
                  <Input id="slug" name="slug" defaultValue={page?.slug} required placeholder="hakkimizda" />
                  <p className="text-xs text-ink-300 mt-1">Sayfa /<span className="font-mono">slug</span> adresinden açılır.</p>
                </div>
                <div>
                  <Label htmlFor="content">İçerik (HTML)</Label>
                  <Textarea
                    id="content"
                    name="content"
                    rows={20}
                    defaultValue={page?.content ?? ""}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-ink-300 mt-1">
                    HTML etiketleri kullanabilirsiniz: <code>&lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;a&gt;, &lt;strong&gt;</code> vb.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4">
                <h3 className="font-display text-lg text-ink-700">Yayın</h3>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isPublished"
                    defaultChecked={page?.isPublished ?? true}
                    className="h-4 w-4 rounded border-cream-300 text-rose-500"
                  />
                  Yayında
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4">
                <h3 className="font-display text-lg text-ink-700">SEO</h3>
                <div>
                  <Label htmlFor="seoTitle">SEO Başlık</Label>
                  <Input id="seoTitle" name="seoTitle" defaultValue={page?.seoTitle ?? ""} />
                </div>
                <div>
                  <Label htmlFor="seoDescription">Meta Açıklama</Label>
                  <Textarea
                    id="seoDescription"
                    name="seoDescription"
                    rows={3}
                    maxLength={160}
                    defaultValue={page?.seoDescription ?? ""}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button type="submit">{isNew ? "Oluştur" : "Güncelle"}</Button>
              <Link href="/admin/sayfalar"><Button type="button" variant="outline" className="w-full">İptal</Button></Link>
            </div>
          </div>
        </div>
      </form>
    </AdminShell>
  );
}
