import Link from "next/link";
import { headers } from "next/headers";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteUser } from "@/server/actions/users";

export const dynamic = "force-dynamic";

export default async function UsersListPage() {
  const session = await requireAdmin(["users:manage"]);
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/kullanicilar";

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, role: { select: { name: true } }, isActive: true, lastLoginAt: true },
  });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Kullanıcılar"
        description={`${users.length} yönetici/editör`}
        action={
          <Link href="/admin/kullanicilar/yeni">
            <Button><Plus className="h-4 w-4" /> Yeni Kullanıcı</Button>
          </Link>
        }
      />

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-cream-100">
            <tr className="text-left text-xs uppercase tracking-wider text-ink-300">
              <th className="px-4 py-3 font-medium">İsim</th>
              <th className="px-4 py-3 font-medium">E-posta</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Son Giriş</th>
              <th className="px-4 py-3 font-medium text-center">Durum</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-cream-50/50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-ink-500">{u.email}</td>
                <td className="px-4 py-3 text-ink-500 text-xs">{u.role.name}</td>
                <td className="px-4 py-3 text-xs text-ink-500">
                  {u.lastLoginAt ? formatDate(u.lastLoginAt, true) : "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-1 rounded ${u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-cream-100 text-ink-300"}`}>
                    {u.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/kullanicilar/${u.id}`} className="text-ink-300 hover:text-ink-700">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {u.id !== session.user.id ? (
                      <form action={deleteUser}>
                        <input type="hidden" name="id" value={u.id} />
                        <button type="submit" className="text-ink-300 hover:text-rose-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    ) : null}
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
