import Link from "next/link";
import { headers } from "next/headers";
import { Plus, Trash2, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { CouponType } from "@prisma/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteCoupon } from "@/server/actions/coupons";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<CouponType, string> = {
  PERCENT: "% indirim",
  FIXED: "Sabit ₺",
  FREE_SHIPPING: "Ücretsiz Kargo",
};

export default async function CouponsListPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/kuponlar";

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Kuponlar"
        description={`${coupons.length} kupon`}
        action={
          <Link href="/admin/kuponlar/yeni">
            <Button><Plus className="h-4 w-4" /> Yeni Kupon</Button>
          </Link>
        }
      />

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-cream-100">
            <tr className="text-left text-xs uppercase tracking-wider text-ink-300">
              <th className="px-4 py-3 font-medium">Kod</th>
              <th className="px-4 py-3 font-medium">Tip</th>
              <th className="px-4 py-3 font-medium text-right">Değer</th>
              <th className="px-4 py-3 font-medium text-right">Kullanım</th>
              <th className="px-4 py-3 font-medium">Geçerlilik</th>
              <th className="px-4 py-3 font-medium text-center">Durum</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-50">
            {coupons.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-300">Henüz kupon yok.</td></tr>
            ) : coupons.map((c) => (
              <tr key={c.id} className="hover:bg-cream-50/50">
                <td className="px-4 py-3 font-mono text-ink-700">{c.code}</td>
                <td className="px-4 py-3 text-ink-500">{TYPE_LABEL[c.type]}</td>
                <td className="px-4 py-3 text-right">
                  {c.type === "PERCENT"
                    ? `%${c.value}`
                    : c.type === "FIXED"
                      ? formatPrice(c.value.toString())
                      : "—"}
                </td>
                <td className="px-4 py-3 text-right text-ink-500 text-xs">
                  {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3 text-xs text-ink-500">
                  {c.endsAt ? `→ ${formatDate(c.endsAt)}` : "Süresiz"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-1 rounded ${c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-cream-100 text-ink-300"}`}>
                    {c.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/kuponlar/${c.id}`} className="text-ink-300 hover:text-ink-700">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form action={deleteCoupon}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="text-ink-300 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}
