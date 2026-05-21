import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { BannerPosition } from "@prisma/client";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SingleImageField } from "@/components/admin/single-image-field";
import { saveBanner } from "@/server/actions/banners";

export const dynamic = "force-dynamic";

export default async function EditBannerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const { id } = await params;
  const { error } = await searchParams;
  const isNew = id === "yeni";

  const banner = isNew ? null : await prisma.banner.findUnique({ where: { id } });
  if (!isNew && !banner) notFound();

  const fmtDateInput = (d: Date | null | undefined) =>
    d ? new Date(d).toISOString().slice(0, 16) : "";

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title={isNew ? "Yeni Banner" : banner!.title} />
      {error && (
        <div className="max-w-3xl rounded-md bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <form action={saveBanner} className="space-y-6 max-w-3xl">
        {banner?.id ? <input type="hidden" name="id" value={banner.id} /> : null}
        <Card>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık *</Label>
              <Input id="title" name="title" defaultValue={banner?.title} required />
            </div>
            <div>
              <Label htmlFor="subtitle">Alt başlık</Label>
              <Input id="subtitle" name="subtitle" defaultValue={banner?.subtitle ?? ""} />
            </div>

            <div>
              <Label>Masaüstü Görsel *</Label>
              <SingleImageField name="image" defaultValue={banner?.image ?? ""} folder="banners" />
            </div>
            <div>
              <Label>Mobil Görsel (opsiyonel)</Label>
              <SingleImageField name="mobileImage" defaultValue={banner?.mobileImage ?? ""} folder="banners" />
            </div>

            <div>
              <Label htmlFor="ctaText">Buton Metni</Label>
              <Input id="ctaText" name="ctaText" defaultValue={banner?.ctaText ?? ""} placeholder="Hemen Keşfet" />
            </div>
            <div>
              <Label htmlFor="link">Bağlantı (URL)</Label>
              <Input id="link" name="link" defaultValue={banner?.link ?? ""} placeholder="/urunler veya /kategori/vazo" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Konum</Label>
                <select
                  id="position"
                  name="position"
                  defaultValue={banner?.position ?? BannerPosition.HERO}
                  className="flex h-10 w-full rounded-md border border-cream-200 bg-white px-3 py-2 text-sm"
                >
                  <option value={BannerPosition.HERO}>Ana sayfa hero (slider)</option>
                  <option value={BannerPosition.SECONDARY}>İkincil banner</option>
                  <option value={BannerPosition.POPUP}>Popup</option>
                </select>
              </div>
              <div>
                <Label htmlFor="sortOrder">Sıralama</Label>
                <Input id="sortOrder" name="sortOrder" type="number" defaultValue={banner?.sortOrder ?? 0} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startsAt">Başlangıç</Label>
                <Input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={fmtDateInput(banner?.startsAt)}
                />
              </div>
              <div>
                <Label htmlFor="endsAt">Bitiş</Label>
                <Input
                  id="endsAt"
                  name="endsAt"
                  type="datetime-local"
                  defaultValue={fmtDateInput(banner?.endsAt)}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={banner?.isActive ?? true}
                className="h-4 w-4 rounded border-cream-300 text-rose-500"
              />
              Aktif
            </label>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit">{isNew ? "Oluştur" : "Güncelle"}</Button>
          <Link href="/admin/bannerlar"><Button type="button" variant="outline">İptal</Button></Link>
        </div>
      </form>
    </AdminShell>
  );
}
