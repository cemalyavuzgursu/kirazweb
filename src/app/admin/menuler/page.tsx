import Link from "next/link";
import { headers } from "next/headers";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { deleteMenuItem } from "@/server/actions/menus";

export const dynamic = "force-dynamic";

export default async function MenuListPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/menuler";

  const [headerItems, footerItems] = await Promise.all([
    prisma.navMenu.findMany({
      where: { location: "HEADER", parentId: null },
      include: { children: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.navMenu.findMany({
      where: { location: "FOOTER", parentId: null },
      include: { children: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Menüler"
        description="Header ve footer navigasyon linkleri"
        action={
          <div className="flex gap-2">
            <Link href="/admin/menuler/yeni?location=HEADER">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Header'a Ekle
              </Button>
            </Link>
            <Link href="/admin/menuler/yeni?location=FOOTER">
              <Button size="sm" variant="secondary">
                <Plus className="h-4 w-4" />
                Footer'a Ekle
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MenuSection
          title="Header Menüsü"
          location="HEADER"
          items={headerItems}
        />
        <MenuSection
          title="Footer Menüsü"
          location="FOOTER"
          items={footerItems}
        />
      </div>
    </AdminShell>
  );
}

type NavMenuItem = {
  id: string;
  label: string;
  url: string;
  isActive: boolean;
  sortOrder: number;
  children: Array<{
    id: string;
    label: string;
    url: string;
    isActive: boolean;
    sortOrder: number;
  }>;
};

function MenuSection({
  title,
  location,
  items,
}: {
  title: string;
  location: "HEADER" | "FOOTER";
  items: NavMenuItem[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Link href={`/admin/menuler/yeni?location=${location}`}>
          <Button size="sm" variant="outline">
            <Plus className="h-3.5 w-3.5" />
            Ekle
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <p className="text-sm text-ink-300 text-center py-8">Henüz link yok.</p>
        ) : (
          <ul className="divide-y divide-cream-50">
            {items.map((item) => (
              <li key={item.id}>
                <MenuRow item={item} />
                {item.children.map((child) => (
                  <MenuRow key={child.id} item={child} isChild />
                ))}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function MenuRow({
  item,
  isChild = false,
}: {
  item: { id: string; label: string; url: string; isActive: boolean };
  isChild?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 hover:bg-cream-50/50 ${isChild ? "pl-8" : ""}`}>
      <div className="flex items-center gap-2 min-w-0">
        {isChild && <span className="text-ink-300 select-none shrink-0">└</span>}
        <div className="min-w-0">
          <span className="text-sm font-medium text-ink-700 truncate block">{item.label}</span>
          <span className="text-xs text-ink-400 truncate block">{item.url}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            item.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-cream-100 text-ink-300"
          }`}
        >
          {item.isActive ? "Aktif" : "Pasif"}
        </span>
        <Link href={`/admin/menuler/${item.id}`} className="text-ink-300 hover:text-ink-700">
          <Pencil className="h-4 w-4" />
        </Link>
        <form action={deleteMenuItem.bind(null, item.id)}>
          <button type="submit" className="text-ink-300 hover:text-rose-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
