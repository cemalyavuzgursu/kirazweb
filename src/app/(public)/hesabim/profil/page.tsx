import { requireCustomer } from "@/lib/customer-session";
import { prisma } from "@/lib/db";
import { ProfileFormClient } from "./profile-form-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireCustomer();
  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    select: { name: true, email: true, phone: true },
  });

  if (!customer) return null;

  return (
    <div>
      <h1 className="font-display text-2xl mb-6" style={{ color: "var(--kt-heading)" }}>Profilim</h1>
      <ProfileFormClient
        name={customer.name}
        email={customer.email ?? ""}
        phone={customer.phone}
      />
    </div>
  );
}
