"use server";
import { prisma } from "@/lib/db";

export async function subscribeNewsletter(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  if (!email || !email.includes("@")) {
    return { success: false, error: "Geçerli bir e-posta girin" };
  }
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Bir hata oluştu, lütfen tekrar deneyin." };
  }
}
