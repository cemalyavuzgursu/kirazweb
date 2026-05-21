import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { MenuLocation } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { MenuForm } from "./_menu-form";

export const dynamic = "force-dynamic";

export default async function MenuItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ location?: string }>;
}) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "yeni";

  const locationParam = sp.location === "FOOTER" ? MenuLocation.FOOTER : MenuLocation.HEADER;

  const item = isNew
    ? null
    : await prisma.navMenu.findUnique({ where: { id } });

  if (!isNew && !item) notFound();

  const location = isNew ? locationParam : item!.location;

  const topLevelItems = await prisma.navMenu.findMany({
    where: {
      location,
      parentId: null,
      ...(isNew ? {} : { id: { not: id } }),
    },
    orderBy: { sortOrder: "asc" },
    select: { id: true, label: true, url: true },
  });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title={isNew ? "Yeni Menü Linki" : `Düzenle: ${item!.label}`}
        description={`${location === MenuLocation.HEADER ? "Header" : "Footer"} menüsü`}
      />
      <MenuForm
        id={item?.id}
        location={location}
        label={item?.label}
        url={item?.url}
        parentId={item?.parentId}
        sortOrder={item?.sortOrder}
        isActive={item?.isActive ?? true}
        topLevelItems={topLevelItems}
        isNew={isNew}
      />
    </AdminShell>
  );
}
