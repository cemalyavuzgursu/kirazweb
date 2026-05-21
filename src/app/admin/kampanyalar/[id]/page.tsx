import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { CampaignType } from "@prisma/client";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { saveCampaign } from "@/server/actions/campaigns";
import { CampaignFormFields } from "./_campaign-form";

export const dynamic = "force-dynamic";

const fmtDate = (d: Date | null | undefined) =>
  d ? new Date(d).toISOString().slice(0, 16) : "";

export default async function EditCampaignPage({
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

  const [campaign, categories] = await Promise.all([
    isNew ? null : prisma.campaign.findUnique({ where: { id } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!isNew && !campaign) notFound();

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title={isNew ? "Yeni Kampanya" : campaign!.name}
        action={<Link href="/admin/kampanyalar"><Button variant="outline">Geri</Button></Link>}
      />
      {error && (
        <div className="max-w-2xl rounded-md bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 mb-4">
          {error}
        </div>
      )}
      <form action={saveCampaign} className="space-y-6 max-w-2xl">
        {campaign?.id ? <input type="hidden" name="id" value={campaign.id} /> : null}

        <Card>
          <CardContent className="space-y-4">
            <h3 className="font-display text-lg text-ink-700">Genel</h3>
            <div>
              <Label htmlFor="name">Kampanya Adı *</Label>
              <Input id="name" name="name" required defaultValue={campaign?.name} placeholder="3 al 1 bedava — Nisan" />
            </div>
            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea id="description" name="description" rows={2} defaultValue={campaign?.description ?? ""} />
            </div>
          </CardContent>
        </Card>

        {/* Dynamic fields based on campaign type */}
        <CampaignFormFields
          defaultType={(campaign?.type as CampaignType | undefined) ?? CampaignType.PERCENT_DISCOUNT}
          campaign={campaign ? {
            discountValue: campaign.discountValue?.toString() ?? "",
            minQuantity: campaign.minQuantity ?? undefined,
            freeQuantity: campaign.freeQuantity ?? undefined,
            minSubtotal: campaign.minSubtotal?.toString() ?? "",
            categoryId: campaign.categoryId ?? "",
          } : undefined}
          categories={categories}
        />

        <Card>
          <CardContent className="space-y-4">
            <h3 className="font-display text-lg text-ink-700">Zamanlama & Öncelik</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startsAt">Başlangıç</Label>
                <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={fmtDate(campaign?.startsAt)} />
              </div>
              <div>
                <Label htmlFor="endsAt">Bitiş</Label>
                <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={fmtDate(campaign?.endsAt)} />
              </div>
            </div>
            <div>
              <Label htmlFor="priority">Öncelik</Label>
              <Input id="priority" name="priority" type="number" defaultValue={campaign?.priority ?? 0} />
              <p className="text-xs text-ink-300 mt-1">Yüksek öncelikli kampanya aynı anda aktif olanlara göre önce uygulanır.</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={campaign?.isActive ?? true}
                className="h-4 w-4 rounded border-cream-300 text-rose-500"
              />
              Aktif
            </label>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit">{isNew ? "Oluştur" : "Güncelle"}</Button>
          <Link href="/admin/kampanyalar"><Button type="button" variant="outline">İptal</Button></Link>
        </div>
      </form>
    </AdminShell>
  );
}
