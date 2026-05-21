import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { NewDraftOrderForm } from "./_new-draft-form";

export const dynamic = "force-dynamic";

export default async function NewDraftOrderPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/siparisler/taslaklar/yeni";

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Yeni Taslak Sipariş"
        description="Manuel olarak yeni bir sipariş oluşturun"
      />
      <NewDraftOrderForm />
    </AdminShell>
  );
}
