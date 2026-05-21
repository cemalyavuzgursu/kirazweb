import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PersonelPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/fiziksel-magaza/personel";

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title="Personel" description="POS personel erişimi ve izinleri" />
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-violet-400" />
          </div>
          <p className="text-sm font-medium text-ink-600 mb-1">Personel Yönetimi</p>
          <p className="text-sm text-ink-400">Bu özellik yakında kullanıma açılacak.</p>
          <span className="inline-block mt-3 text-xs font-medium px-3 py-1 rounded-full bg-violet-100 text-violet-700">
            Yakında
          </span>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
