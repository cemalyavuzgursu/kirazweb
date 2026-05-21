import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AbandonedCheckoutsPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/siparisler/terk-edilmis";

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const carts = await prisma.cart.findMany({
    where: {
      updatedAt: { lt: oneHourAgo },
      items: { some: {} },
    },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      items: {
        include: {
          product: {
            select: {
              name: true,
              price: true,
              images: { take: 1, select: { url: true } },
            },
          },
          variant: { select: { name: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Terk Edilmiş Ödemeler"
        description={`${carts.length} terk edilmiş sepet`}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-cream-100">
              <tr className="text-left text-xs uppercase tracking-wider text-ink-300">
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium">Müşteri</th>
                <th className="px-4 py-3 font-medium">Ürünler</th>
                <th className="px-4 py-3 font-medium text-right">Tahmini Tutar</th>
                <th className="px-4 py-3 font-medium">Son Güncelleme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-50">
              {carts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-ink-300">
                    Terk edilmiş ödeme bulunamadı.
                  </td>
                </tr>
              ) : (
                carts.map((cart) => {
                  const estimatedTotal = cart.items.reduce(
                    (sum, item) => sum + item.quantity * Number(item.priceSnapshot),
                    0,
                  );
                  const firstProduct = cart.items[0]?.product?.name ?? "—";
                  const itemCount = cart.items.length;

                  return (
                    <tr key={cart.id} className="hover:bg-cream-50/50">
                      <td className="px-4 py-3 text-ink-500">
                        {formatDate(cart.createdAt, true)}
                      </td>
                      <td className="px-4 py-3">
                        {cart.customer ? (
                          <>
                            <div className="text-ink-700">{cart.customer.name}</div>
                            <div className="text-xs text-ink-300">
                              {cart.customer.phone ?? cart.customer.email ?? ""}
                            </div>
                          </>
                        ) : (
                          <span className="text-ink-400 italic">Misafir</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-ink-700">
                          {itemCount > 1 ? `${itemCount} ürün` : firstProduct}
                        </div>
                        {itemCount > 1 && (
                          <div className="text-xs text-ink-300">{firstProduct}</div>
                        )}
                        {cart.couponCode && (
                          <span className="mt-1 inline-block text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                            {cart.couponCode}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatPrice(estimatedTotal)}
                      </td>
                      <td className="px-4 py-3 text-ink-500">
                        {formatDate(cart.updatedAt, true)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}
