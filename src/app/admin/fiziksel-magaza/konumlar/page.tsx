import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getSetting } from "@/lib/settings";
import { MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KonumlarPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/fiziksel-magaza/konumlar";

  const address = await getSetting<string>("store.address");

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title="Konumlar" description="Fiziksel mağaza konumları" />

      {address ? (
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-50 shrink-0">
                <MapPin className="h-4 w-4 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-700 mb-0.5">Ana Mağaza</p>
                <p className="text-sm text-ink-500 whitespace-pre-wrap">{address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-violet-400" />
            </div>
            <p className="text-sm font-medium text-ink-600 mb-1">Konum Yönetimi</p>
            <p className="text-sm text-ink-400">Bu özellik yakında kullanıma açılacak.</p>
            <span className="inline-block mt-3 text-xs font-medium px-3 py-1 rounded-full bg-violet-100 text-violet-700">
              Yakında
            </span>
          </CardContent>
        </Card>
      )}
    </AdminShell>
  );
}
