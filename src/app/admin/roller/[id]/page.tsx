import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { PERMISSION_GROUPS } from "@/lib/permissions";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveRole } from "@/server/actions/roles";

export const dynamic = "force-dynamic";

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(["roles:manage"]);
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const { id } = await params;
  const isNew = id === "yeni";

  const role = isNew
    ? null
    : await prisma.role.findUnique({ where: { id }, select: { id: true, name: true, permissions: true, isSystem: true } });

  if (!isNew && !role) notFound();
  if (role?.isSystem) {
    return (
      <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
        <PageHeader title={role.name} description="Sistem rolleri düzenlenemez." />
        <Link href="/admin/roller"><Button variant="outline">Geri Dön</Button></Link>
      </AdminShell>
    );
  }

  const activePermissions = new Set<string>((role?.permissions as string[]) ?? []);

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title={isNew ? "Yeni Rol" : `Rol: ${role!.name}`} />
      <form action={saveRole} className="space-y-6 max-w-2xl">
        {role?.id ? <input type="hidden" name="id" value={role.id} /> : null}

        <Card>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Rol Adı *</Label>
              <Input id="name" name="name" defaultValue={role?.name} required maxLength={50} placeholder="Örn: Muhasebe, Pazarlama…" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-6">
            <h3 className="font-display text-lg text-ink-700">İzinler</h3>
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.group}>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
                  {group.group}
                </p>
                <div className="flex flex-wrap gap-3">
                  {group.permissions.map((perm) => (
                    <label key={perm.key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        name="permissions"
                        value={perm.key}
                        defaultChecked={activePermissions.has(perm.key)}
                        className="h-4 w-4 rounded border-cream-300 text-rose-500"
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit">{isNew ? "Oluştur" : "Güncelle"}</Button>
          <Link href="/admin/roller"><Button type="button" variant="outline">İptal</Button></Link>
        </div>
      </form>
    </AdminShell>
  );
}
