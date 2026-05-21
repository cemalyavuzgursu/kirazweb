import Link from "next/link";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { requireCustomer } from "@/lib/customer-session";
import { prisma } from "@/lib/db";
import { deleteAddress, setDefaultAddress } from "@/server/actions/customer-account";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const session = await requireCustomer();

  const addresses = await prisma.address.findMany({
    where: { customerId: session.customerId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  const shipping = addresses.filter((a) => a.type === "SHIPPING");
  const billing = addresses.filter((a) => a.type === "BILLING");

  function AddressCard({ addr }: { addr: (typeof addresses)[0] }) {
    return (
      <div
        className="rounded-lg p-4 relative"
        style={{ border: `1px solid ${addr.isDefault ? "var(--kt-primary)" : "var(--kt-border)"}` }}
      >
        {addr.isDefault && (
          <span className="absolute top-3 right-3 text-xs flex items-center gap-1" style={{ color: "var(--kt-primary)" }}>
            <Star className="h-3 w-3" style={{ fill: "var(--kt-primary)" }} /> Varsayılan
          </span>
        )}
        <p className="font-medium" style={{ color: "var(--kt-heading)" }}>{addr.fullName}</p>
        <p className="text-sm mt-1" style={{ color: "var(--kt-muted)" }}>{addr.phone}</p>
        <p className="text-sm mt-1" style={{ color: "var(--kt-muted)" }}>
          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
        </p>
        <p className="text-sm" style={{ color: "var(--kt-muted)" }}>
          {[addr.district, addr.city, addr.postalCode].filter(Boolean).join(", ")}
        </p>

        <div className="flex items-center gap-3 mt-4 pt-3 border-t" style={{ borderColor: "var(--kt-border)" }}>
          <Link href={`/hesabim/adresler/${addr.id}`} className="flex items-center gap-1 text-xs" style={{ color: "var(--kt-muted)" }}>
            <Pencil className="h-3.5 w-3.5" /> Düzenle
          </Link>
          {!addr.isDefault && (
            <form action={setDefaultAddress}>
              <input type="hidden" name="id" value={addr.id} />
              <input type="hidden" name="type" value={addr.type} />
              <button type="submit" className="flex items-center gap-1 text-xs" style={{ color: "var(--kt-muted)" }}>
                <Star className="h-3.5 w-3.5" /> Varsayılan Yap
              </button>
            </form>
          )}
          <form action={deleteAddress} className="ml-auto">
            <input type="hidden" name="id" value={addr.id} />
            <button type="submit" className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-600">
              <Trash2 className="h-3.5 w-3.5" /> Sil
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl" style={{ color: "var(--kt-heading)" }}>Adreslerim</h1>
        <Link href="/hesabim/adresler/yeni"
          className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-md transition"
          style={{ backgroundColor: "var(--kt-primary)" }}>
          <Plus className="h-4 w-4" /> Yeni Adres
        </Link>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: "var(--kt-muted)" }}>Teslimat Adresleri</h2>
          {shipping.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shipping.map((a) => <AddressCard key={a.id} addr={a} />)}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--kt-muted)" }}>Teslimat adresiniz yok.</p>
          )}
        </section>

        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: "var(--kt-muted)" }}>Fatura Adresleri</h2>
          {billing.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {billing.map((a) => <AddressCard key={a.id} addr={a} />)}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--kt-muted)" }}>Fatura adresiniz yok.</p>
          )}
        </section>
      </div>
    </div>
  );
}
