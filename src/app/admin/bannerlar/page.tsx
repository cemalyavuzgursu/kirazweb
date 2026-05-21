import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteBanner } from "@/server/actions/banners";

export const dynamic = "force-dynamic";

export default async function BannersListPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/bannerlar";

  const banners = await prisma.banner.findMany({
    orderBy: [{ position: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Bannerlar"
        description={`${banners.length} banner`}
        action={
          <Link href="/admin/bannerlar/yeni">
            <Button><Plus className="h-4 w-4" /> Yeni Banner</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <Card key={b.id}>
            <div className="relative aspect-[2/1] bg-cream-100">
              {b.image ? <Image src={b.image} alt={b.title} fill sizes="600px" className="object-cover" /> : null}
              <div className="absolute top-2 left-2 flex gap-2">
                <span className="bg-white/90 px-2 py-0.5 rounded text-xs">{b.position}</span>
                {!b.isActive ? <span className="bg-cream-100 px-2 py-0.5 rounded text-xs">Pasif</span> : null}
              </div>
            </div>
            <div className="p-4 flex items-start justify-between">
              <div>
                <h3 className="font-medium text-ink-700">{b.title}</h3>
                {b.subtitle ? <p className="text-xs text-ink-300 mt-1">{b.subtitle}</p> : null}
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={`/admin/bannerlar/${b.id}`} className="text-ink-300 hover:text-ink-700">
                  <Pencil className="h-4 w-4" />
                </Link>
                <form action={deleteBanner}>
                  <input type="hidden" name="id" value={b.id} />
                  <button type="submit" className="text-ink-300 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </Card>
        ))}
        {banners.length === 0 ? (
          <Card><div className="p-12 text-center text-ink-300">Henüz banner yok.</div></Card>
        ) : null}
      </div>
    </AdminShell>
  );
}
