import Link from "next/link";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Beklemede",
  AWAITING_PAYMENT: "Ödeme Bekleniyor",
  AWAITING_WHATSAPP: "WhatsApp Onayı",
  PAID: "Ödendi",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
  REFUNDED: "İade",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-cream-100 text-ink-500",
  AWAITING_PAYMENT: "bg-amber-50 text-amber-700",
  AWAITING_WHATSAPP: "bg-emerald-50 text-emerald-700",
  PAID: "bg-emerald-50 text-emerald-700",
  PREPARING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-sky-50 text-sky-700",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-50 text-rose-700",
  REFUNDED: "bg-cream-100 text-ink-500",
};

const DRAFT_STATUSES = ["PENDING", "AWAITING_PAYMENT"] as const;
type DraftStatus = (typeof DRAFT_STATUSES)[number];

export default async function DraftOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/siparisler/taslaklar";
  const sp = await searchParams;
  const statusFilter = DRAFT_STATUSES.includes(sp.status as DraftStatus)
    ? (sp.status as DraftStatus)
    : undefined;
  const q = sp.q?.trim() ?? "";

  const orders = await prisma.order.findMany({
    where: {
      status: { in: statusFilter ? [statusFilter] : ["PENDING", "AWAITING_PAYMENT"] },
      ...(q && {
        OR: [
          { orderNumber: { contains: q, mode: "insensitive" } },
          { customerName: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Taslak Siparişler"
        description={`${orders.length} taslak`}
        action={
          <Link
            href="/admin/siparisler/taslaklar/yeni"
            className="h-10 px-4 inline-flex items-center rounded-md bg-ink-700 text-white text-sm hover:bg-ink-800 transition"
          >
            Yeni Taslak Oluştur
          </Link>
        }
      />

      <form className="mb-6 flex flex-wrap gap-2 items-center">
        <input
          name="q"
          defaultValue={q}
          placeholder="Sipariş no veya müşteri adı..."
          className="h-10 px-3 rounded-md border border-cream-200 bg-white text-sm flex-1 min-w-[240px]"
        />
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="h-10 px-3 rounded-md border border-cream-200 bg-white text-sm"
        >
          <option value="">Tüm taslaklar</option>
          <option value="PENDING">{STATUS_LABELS.PENDING}</option>
          <option value="AWAITING_PAYMENT">{STATUS_LABELS.AWAITING_PAYMENT}</option>
        </select>
        <button type="submit" className="h-10 px-4 rounded-md bg-ink-700 text-white text-sm">
          Filtrele
        </button>
      </form>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-cream-100">
              <tr className="text-left text-xs uppercase tracking-wider text-ink-300">
                <th className="px-4 py-3 font-medium">Sipariş No</th>
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium">Müşteri</th>
                <th className="px-4 py-3 font-medium text-right">Tutar</th>
                <th className="px-4 py-3 font-medium text-center">Durum</th>
                <th className="px-4 py-3 font-medium text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-ink-300">
                    Bekleyen sipariş taslağı yok.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-cream-50/50">
                    <td className="px-4 py-3 font-medium text-ink-700">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-ink-500">{formatDate(o.createdAt, true)}</td>
                    <td className="px-4 py-3">
                      <div className="text-ink-700">{o.customerName}</div>
                      <div className="text-xs text-ink-300">{o.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(o.grandTotal.toString())}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[o.status]}`}>
                        {STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/admin/siparisler/${o.id}`}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Görüntüle
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}
