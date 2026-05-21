import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveUser } from "@/server/actions/users";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(["users:manage"]);
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const { id } = await params;
  const isNew = id === "yeni";

  const [user, roles] = await Promise.all([
    isNew
      ? null
      : prisma.user.findUnique({
          where: { id },
          select: { id: true, email: true, name: true, roleId: true, isActive: true },
        }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!isNew && !user) notFound();

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title={isNew ? "Yeni Kullanıcı" : (user!.name)} />
      <form action={saveUser} className="space-y-6 max-w-xl">
        {user?.id ? <input type="hidden" name="id" value={user.id} /> : null}
        <Card>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Ad Soyad *</Label>
              <Input id="name" name="name" defaultValue={user?.name} required />
            </div>
            <div>
              <Label htmlFor="email">E-posta *</Label>
              <Input id="email" name="email" type="email" defaultValue={user?.email} required />
            </div>
            <div>
              <Label htmlFor="roleId">Rol *</Label>
              <select
                id="roleId"
                name="roleId"
                defaultValue={user?.roleId ?? ""}
                className="flex h-10 w-full rounded-md border border-cream-200 bg-white px-3 text-sm"
                required
              >
                <option value="" disabled>Rol seçin…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}{r.isSystem ? " (sistem)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="password">{isNew ? "Şifre *" : "Yeni Şifre (boş bırakılırsa değişmez)"}</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required={isNew} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={user?.isActive ?? true} className="h-4 w-4 rounded border-cream-300 text-rose-500" />
              Aktif
            </label>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit">{isNew ? "Oluştur" : "Güncelle"}</Button>
          <Link href="/admin/kullanicilar"><Button type="button" variant="outline">İptal</Button></Link>
        </div>
      </form>
    </AdminShell>
  );
}
