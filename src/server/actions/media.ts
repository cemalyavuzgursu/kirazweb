"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";
import { deleteImage } from "@/lib/upload";

export async function deleteMediaFile(url: string): Promise<{ ok: boolean; error?: string }> {
  const session = await requireAdmin();
  if (!url || !url.startsWith("/uploads/")) {
    return { ok: false, error: "Geçersiz dosya." };
  }
  await deleteImage(url);
  await logActivity({ userId: session.user.id, action: "DELETE", entity: "Media", entityId: url });
  revalidatePath("/admin/medya");
  return { ok: true };
}
