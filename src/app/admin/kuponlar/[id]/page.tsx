import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { CouponType } from "@prisma/client";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveCoupon } from "@/server/actions/coupons";

export const dynamic = "force-dynamic";

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const { id } = await params;
  const isNew = id === "yeni";

  const coupon = isNew ? null : await prisma.coupon.findUnique({ where: { id } });
  if (!isNew && !coupon) notFound();

  const fmtDate = (d: Date | null | undefined) =>
    d ? new Date(d).toISOString().slice(0, 10) : "";

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title={isNew ? "Yeni Kupon" : coupon!.code} />
      <form action={saveCoupon} className="space-y-6 max-w-2xl">
        {coupon?.id ? <input type="hidden" name="id" value={coupon.id} /> : null}
        <Card>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Kupon Kodu *</Label>
                <Input id="code" name="code" required defaultValue={coupon?.code} placeholder="HOSGELDIN10" />
              </div>
              <div>
                <Label htmlFor="type">Tip *</Label>
                <select id="type" name="type" defaultValue={coupon?.type ?? CouponType.PERCENT} className="flex h-10 w-full rounded-md border border-cream-200 bg-white px-3 text-sm">
                  <option value={CouponType.PERCENT}>% indirim</option>
                  <option value={CouponType.FIXED}>Sabit ₺ indirim</option>
                  <option value={CouponType.FREE_SHIPPING}>Ücretsiz kargo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">Değer</Label>
                <Input id="value" name="value" type="number" step="0.01" min="0" defaultValue={coupon?.value.toString() ?? "10"} />
                <p className="text-xs text-ink-300 mt-1">% için 1-100, ₺ için tutar.</p>
              </div>
              <div>
                <Label htmlFor="minSubtotal">Min. Sepet Tutarı</Label>
                <Input id="minSubtotal" name="minSubtotal" type="number" step="0.01" min="0" defaultValue={coupon?.minSubtotal?.toString() ?? ""} />
              </div>
            </div>

            <div>
              <Label htmlFor="usageLimit">Kullanım Limiti (toplam)</Label>
              <Input id="usageLimit" name="usageLimit" type="number" min="0" defaultValue={coupon?.usageLimit?.toString() ?? ""} placeholder="Boş = sınırsız" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startsAt">Başlangıç</Label>
                <Input id="startsAt" name="startsAt" type="date" defaultValue={fmtDate(coupon?.startsAt)} />
              </div>
              <div>
                <Label htmlFor="endsAt">Bitiş</Label>
                <Input id="endsAt" name="endsAt" type="date" defaultValue={fmtDate(coupon?.endsAt)} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={coupon?.isActive ?? true} className="h-4 w-4 rounded border-cream-300 text-rose-500" />
              Aktif
            </label>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit">{isNew ? "Oluştur" : "Güncelle"}</Button>
          <Link href="/admin/kuponlar"><Button type="button" variant="outline">İptal</Button></Link>
        </div>
      </form>
    </AdminShell>
  );
}
