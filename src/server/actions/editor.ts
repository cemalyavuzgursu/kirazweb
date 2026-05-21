"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { type PageSection, parseSections, DEFAULT_SECTIONS } from "@/lib/page-sections";

export async function saveSections(sections: PageSection[]): Promise<void> {
  await requireAdmin();
  await prisma.setting.upsert({
    where: { key: "homepage.sections" },
    update: { value: sections as never },
    create: { key: "homepage.sections", value: sections as never },
  });
  revalidatePath("/");
}

export async function getSections(): Promise<PageSection[]> {
  const row = await prisma.setting.findUnique({ where: { key: "homepage.sections" } });
  return parseSections(row?.value ?? DEFAULT_SECTIONS);
}
