"use server";

import { revalidatePath } from "next/cache";
import { setSetting } from "@/lib/settings";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";

export async function updateSettings(updates: Array<{ key: string; value: unknown; isSecret?: boolean }>) {
  const session = await requireAdmin(["settings:manage"]);
  for (const u of updates) {
    await setSetting(u.key, u.value as never, u.isSecret ?? false);
  }
  await logActivity({
    userId: session.user.id,
    action: "UPDATE",
    entity: "Setting",
    diff: { keys: updates.map((u) => u.key) },
  });
  revalidatePath("/admin/ayarlar", "layout");
  revalidatePath("/", "layout");
}

export async function saveSettingsForm(formData: FormData) {
  "use server";
  const session = await requireAdmin(["settings:manage"]);
  const updates: Array<{ key: string; value: unknown; isSecret?: boolean }> = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("_")) continue;
    const isSecret = formData.has(`_secret.${key}`);
    const isBool = formData.has(`_bool.${key}`);
    const isNumber = formData.has(`_number.${key}`);
    const isJson = formData.has(`_json.${key}`);

    let coerced: unknown = value;
    if (isBool) coerced = value === "on" || value === "true";
    else if (isNumber) coerced = value === "" ? null : Number(value);
    else if (isJson) {
      try {
        coerced = value ? JSON.parse(value as string) : null;
      } catch {
        coerced = value;
      }
    } else if (typeof value === "string") {
      coerced = value;
    }

    updates.push({ key, value: coerced, isSecret });
  }

  const boolKeys = Array.from(formData.keys()).filter((k) => k.startsWith("_bool."));
  for (const bk of boolKeys) {
    const realKey = bk.slice(6);
    if (!formData.has(realKey)) {
      updates.push({ key: realKey, value: false });
    }
  }

  for (const u of updates) {
    await setSetting(u.key, u.value as never, u.isSecret ?? false);
  }
  await logActivity({
    userId: session.user.id,
    action: "UPDATE",
    entity: "Setting",
    diff: { keys: updates.map((u) => u.key) },
  });
  revalidatePath("/admin/ayarlar", "layout");
  revalidatePath("/", "layout");
}
