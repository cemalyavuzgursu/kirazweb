"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";
import { deleteImage } from "@/lib/upload";

export async function deleteMediaFile(url: string): Promise<{ ok: boolean; error?: string }> {
  const session = await requireAdmin();
  // Allowlist the URL shape: must live under /uploads/ with a safe charset and
  // no traversal sequences. deleteImage applies a second resolved-path check.
  if (
    !url ||
    !/^\/uploads\/[A-Za-z0-9._\-/]+$/.test(url) ||
    url.includes("..")
  ) {
    return { ok: false, error: "Geçersiz dosya." };
  }
  await deleteImage(url);
  await logActivity({ userId: session.user.id, action: "DELETE", entity: "Media", entityId: url });
  revalidatePath("/admin/medya");
  return { ok: true };
}
