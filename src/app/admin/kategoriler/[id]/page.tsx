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
import { SingleImageField } from "@/components/admin/single-image-field";
import { saveCategory } from "@/server/actions/categories";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const { id } = await params;
  const isNew = id === "yeni";

  const [category, parents] = await Promise.all([
    isNew ? null : prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({
      where: isNew ? {} : { id: { not: id } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!isNew && !category) notFound();

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title={isNew ? "Yeni Kategori" : category!.name} />
      <form action={saveCategory} className="space-y-6 max-w-3xl">
        {category?.id ? <input type="hidden" name="id" value={category.id} /> : null}
        <Card>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">İsim *</Label>
              <Input id="name" name="name" defaultValue={category?.name} required />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={category?.slug} placeholder="otomatik" />
            </div>
            <div>
              <Label htmlFor="parentId">Üst Kategori</Label>
              <select
                id="parentId"
                name="parentId"
                defaultValue={category?.parentId ?? ""}
                className="flex h-10 w-full rounded-md border border-cream-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">— Yok (ana kategori) —</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea id="description" name="description" defaultValue={category?.description ?? ""} rows={3} />
            </div>
            <div>
              <Label>Görsel</Label>
              <SingleImageField name="image" defaultValue={category?.image ?? ""} />
            </div>
            <div>
              <Label htmlFor="sortOrder">Sıralama</Label>
              <Input id="sortOrder" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={category?.isActive ?? true}
                className="h-4 w-4 rounded border-cream-300 text-rose-500"
              />
              Aktif
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <h3 className="font-display text-lg text-ink-700">SEO</h3>
            <div>
              <Label htmlFor="seoTitle">SEO Başlığı</Label>
              <Input id="seoTitle" name="seoTitle" defaultValue={category?.seoTitle ?? ""} />
            </div>
            <div>
              <Label htmlFor="seoDescription">Meta Açıklama</Label>
              <Textarea id="seoDescription" name="seoDescription" defaultValue={category?.seoDescription ?? ""} rows={2} maxLength={160} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit">{isNew ? "Oluştur" : "Güncelle"}</Button>
          <Link href="/admin/kategoriler"><Button type="button" variant="outline">İptal</Button></Link>
        </div>
      </form>
    </AdminShell>
  );
}
