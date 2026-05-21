"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(3, "Soru zorunlu"),
  answer: z.string().min(3, "Cevap zorunlu"),
  sortOrder: z.coerce.number().default(0),
  isActive: z.coerce.boolean().default(true),
});

export async function saveFaqItem(formData: FormData) {
  await requireAdmin(["content:write"]);
  const raw = Object.fromEntries(formData.entries());
  const parsed = faqSchema.parse({
    ...raw,
    isActive: raw.isActive === "on" || raw.isActive === "true",
  });

  if (parsed.id) {
    await prisma.faqItem.update({
      where: { id: parsed.id },
      data: { question: parsed.question, answer: parsed.answer, sortOrder: parsed.sortOrder, isActive: parsed.isActive },
    });
  } else {
    await prisma.faqItem.create({
      data: { question: parsed.question, answer: parsed.answer, sortOrder: parsed.sortOrder, isActive: parsed.isActive },
    });
  }

  revalidatePath("/admin/sss");
  revalidatePath("/sss");
}

export async function deleteFaqItem(formData: FormData) {
  await requireAdmin(["content:write"]);
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.faqItem.delete({ where: { id } });
  revalidatePath("/admin/sss");
  revalidatePath("/sss");
}

export async function reorderFaqItem(formData: FormData) {
  await requireAdmin(["content:write"]);
  const id = formData.get("id") as string;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  if (!id) return;
  await prisma.faqItem.update({ where: { id }, data: { sortOrder } });
  revalidatePath("/admin/sss");
  revalidatePath("/sss");
}
