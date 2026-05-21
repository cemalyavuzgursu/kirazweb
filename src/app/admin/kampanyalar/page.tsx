import Link from "next/link";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toggleCampaign } from "@/server/actions/campaigns";
import { CampaignType } from "@prisma/client";
import { Tag, Pencil, Power } from "lucide-react";
import { DeleteCampaignButton } from "./_delete-button";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<CampaignType, string> = {
  PERCENT_DISCOUNT: "Yüzde İndirim",
  FIXED_DISCOUNT: "Sabit İndirim (₺)",
  BUY_X_GET_Y_FREE: "X Al Y Bedava",
  SPEND_X_GET_FREE: "X₺ Üzeri İndirim",
  FREE_SHIPPING: "Ücretsiz Kargo",
};

function campaignSummary(c: {
  type: CampaignType;
  discountValue: unknown;
  minQuantity: number | null;
  freeQuantity: number | null;
  minSubtotal: unknown;
}) {
  switch (c.type) {
    case "PERCENT_DISCOUNT":
      return `%${c.discountValue} indirim`;
    case "FIXED_DISCOUNT":
      return `${formatPrice(Number(c.discountValue ?? 0))} indirim`;
    case "BUY_X_GET_Y_FREE":
      return `${c.minQuantity ?? "?"} al ${c.freeQuantity ?? "?"} bedava`;
    case "SPEND_X_GET_FREE":
      return `${formatPrice(Number(c.minSubtotal ?? 0))} üzeri ${c.discountValue ? formatPrice(Number(c.discountValue)) : ""} indirim`;
    case "FREE_SHIPPING":
      return c.minSubtotal ? `${formatPrice(Number(c.minSubtotal))} üzeri ücretsiz kargo` : "Ücretsiz kargo";
  }
}

export default async function CampaignsPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/kampanyalar";

  const campaigns = await prisma.campaign.findMany({
    orderBy: [{ isActive: "desc" }, { priority: "desc" }, { createdAt: "desc" }],
    include: { category: { select: { name: true } } },
  });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Kampanyalar"
        action={
          <Link href="/admin/kampanyalar/yeni">
            <Button size="sm">Yeni Kampanya</Button>
          </Link>
        }
      />

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-ink-300">
            <Tag className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p>Henüz kampanya yok.</p>
            <Link href="/admin/kampanyalar/yeni" className="mt-3 inline-block">
              <Button size="sm" variant="outline">İlk Kampanyayı Oluştur</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className={`flex items-center gap-4 p-4 rounded-lg border bg-white transition ${
                c.isActive ? "border-cream-200" : "border-cream-100 opacity-60"
              }`}
            >
              <div className={`h-3 w-3 rounded-full shrink-0 ${c.isActive ? "bg-emerald-400" : "bg-cream-300"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-ink-700">{c.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                    {TYPE_LABELS[c.type]}
                  </span>
                  {c.category && (
                    <span className="text-xs text-ink-400">· {c.category.name}</span>
                  )}
                </div>
                <p className="text-sm text-ink-500 mt-0.5">{campaignSummary(c)}</p>
                {(c.startsAt || c.endsAt) && (
                  <p className="text-xs text-ink-300 mt-0.5">
                    {c.startsAt ? new Date(c.startsAt).toLocaleDateString("tr-TR") : "—"}
                    {" → "}
                    {c.endsAt ? new Date(c.endsAt).toLocaleDateString("tr-TR") : "∞"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <form action={toggleCampaign}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    title={c.isActive ? "Devre dışı bırak" : "Etkinleştir"}
                    className={`h-8 w-8 rounded-md border flex items-center justify-center transition ${
                      c.isActive
                        ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        : "border-cream-200 text-ink-400 hover:bg-cream-100"
                    }`}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                </form>
                <Link href={`/admin/kampanyalar/${c.id}`}>
                  <button
                    type="button"
                    className="h-8 w-8 rounded-md border border-cream-200 flex items-center justify-center text-ink-400 hover:border-rose-300 hover:text-rose-600 transition"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </Link>
                <DeleteCampaignButton id={c.id} name={c.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
