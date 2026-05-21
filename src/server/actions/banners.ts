"use server";

import { revalidatePath } from "next/cache";
import { adminRedirect } from "@/lib/admin-redirect";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";
import { deleteImage } from "@/lib/upload";
import { BannerPosition } from "@prisma/client";

const bannerSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  image: z.string().min(1, "Görsel zorunlu"),
  mobileImage: z.string().optional(),
  link: z.string().optional(),
  ctaText: z.string().optional(),
  position: z.nativeEnum(BannerPosition).default(BannerPosition.HERO),
  sortOrder: z.coerce.number().int().default(0),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
});

export async function saveBanner(formData: FormData) {
  const session = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const result = bannerSchema.safeParse({
    ...raw,
    isActive: raw.isActive === "on" || raw.isActive === "true",
  });
  if (!result.success) {
    const id = raw.id as string | undefined;
    const base = id ? `/admin/bannerlar/${id}` : "/admin/bannerlar/yeni";
    const msg = result.error.errors.map((e) => e.message).join(", ");
    await adminRedirect(`${base}?error=${encodeURIComponent(msg)}`);
  }
  const parsed = result.data!;

  const data = {
    title: parsed.title,
    subtitle: parsed.subtitle || null,
    image: parsed.image,
    mobileImage: parsed.mobileImage || null,
    link: parsed.link || null,
    ctaText: parsed.ctaText || null,
    position: parsed.position,
    sortOrder: parsed.sortOrder,
    startsAt: parsed.startsAt ? new Date(parsed.startsAt) : null,
    endsAt: parsed.endsAt ? new Date(parsed.endsAt) : null,
    isActive: parsed.isActive,
  };

  let id = parsed.id;
  if (id) {
    await prisma.banner.update({ where: { id }, data });
    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "Banner", entityId: id });
  } else {
    const created = await prisma.banner.create({ data });
    id = created.id;
    await logActivity({ userId: session.user.id, action: "CREATE", entity: "Banner", entityId: id });
  }

  revalidatePath("/");
  revalidatePath("/admin/bannerlar");
  await adminRedirect("/admin/bannerlar");
}

export async function deleteBanner(formData: FormData) {
  const session = await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (banner?.image) await deleteImage(banner.image);
  if (banner?.mobileImage) await deleteImage(banner.mobileImage);
  await prisma.banner.delete({ where: { id } });
  await logActivity({ userId: session.user.id, action: "DELETE", entity: "Banner", entityId: id });
  revalidatePath("/admin/bannerlar");
  revalidatePath("/");
}
