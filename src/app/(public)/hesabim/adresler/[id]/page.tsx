import { notFound } from "next/navigation";
import { requireCustomer } from "@/lib/customer-session";
import { prisma } from "@/lib/db";
import { AddressFormClient } from "./address-form-client";

export const dynamic = "force-dynamic";

export default async function AddressFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCustomer();

  let address = null;
  if (id !== "yeni") {
    address = await prisma.address.findFirst({
      where: { id, customerId: session.customerId },
    });
    if (!address) notFound();
  }

  return (
    <div>
      <h1 className="font-display text-2xl mb-6" style={{ color: "var(--kt-heading)" }}>
        {address ? "Adresi Düzenle" : "Yeni Adres"}
      </h1>
      <AddressFormClient address={address} />
    </div>
  );
}
