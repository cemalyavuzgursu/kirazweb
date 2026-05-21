import Link from "next/link";
import { headers } from "next/headers";
import { Plus, Pencil, Trash2, Shield, Lock } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteRole } from "@/server/actions/roles";

export const dynamic = "force-dynamic";

export default async function RolesListPage() {
  const session = await requireAdmin(["roles:manage"]);
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/roller";

  const roles = await prisma.role.findMany({
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    include: { _count: { select: { users: true } } },
  });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Roller"
        description="Kullanıcı rolleri ve izinleri"
        action={
          <Link href="/admin/roller/yeni">
            <Button><Plus className="h-4 w-4" /> Yeni Rol</Button>
          </Link>
        }
      />

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-cream-100">
            <tr className="text-left text-xs uppercase tracking-wider text-ink-300">
              <th className="px-4 py-3 font-medium">Rol Adı</th>
              <th className="px-4 py-3 font-medium">İzin Sayısı</th>
              <th className="px-4 py-3 font-medium">Kullanıcı</th>
              <th className="px-4 py-3 font-medium">Tür</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-50">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-cream-50/50">
                <td className="px-4 py-3 font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-rose-400 shrink-0" />
                  {role.name}
                </td>
                <td className="px-4 py-3 text-ink-500">
                  {(role.permissions as string[]).length} izin
                </td>
                <td className="px-4 py-3 text-ink-500">{role._count.users} kişi</td>
                <td className="px-4 py-3">
                  {role.isSystem ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-50 text-amber-700">
                      <Lock className="h-3 w-3" /> Sistem
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-cream-100 text-ink-500">
                      Özel
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {role.isSystem ? (
                      <span className="text-ink-200" title="Sistem rolleri düzenlenemez">
                        <Pencil className="h-4 w-4" />
                      </span>
                    ) : (
                      <Link href={`/admin/roller/${role.id}`} className="text-ink-300 hover:text-ink-700">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    )}
                    {!role.isSystem && (
                      <form action={deleteRole}>
                        <input type="hidden" name="id" value={role.id} />
                        <button
                          type="submit"
                          className="text-ink-300 hover:text-rose-600"
                          title={role._count.users > 0 ? `${role._count.users} kullanıcı bu rolde` : "Sil"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    )}
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
