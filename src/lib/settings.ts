import { prisma } from "./db";
import { decrypt, encrypt } from "./crypto";

type SettingValue = string | number | boolean | object | null;

const cache = new Map<string, { value: SettingValue; ts: number }>();
const CACHE_TTL = 30_000;

export async function getSetting<T extends SettingValue = SettingValue>(
  key: string,
  defaultValue?: T,
): Promise<T | undefined> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.value as T;
  }
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) return defaultValue;

  let value = row.value as SettingValue;
  if (row.isSecret && typeof value === "string" && value.length > 0) {
    try {
      value = decrypt(value);
    } catch {
      value = "";
    }
  }
  cache.set(key, { value, ts: Date.now() });
  return value as T;
}

export async function getSettings(keys: string[]): Promise<Record<string, SettingValue>> {
  const result: Record<string, SettingValue> = {};
  await Promise.all(
    keys.map(async (key) => {
      result[key] = (await getSetting(key)) ?? null;
    }),
  );
  return result;
}

export async function setSetting(key: string, value: SettingValue, isSecret = false): Promise<void> {
  let stored: SettingValue = value;
  if (isSecret && typeof value === "string" && value.length > 0) {
    stored = encrypt(value);
  }
  await prisma.setting.upsert({
    where: { key },
    update: { value: stored as any, isSecret },
    create: { key, value: stored as any, isSecret },
  });
  cache.delete(key);
}

export function clearSettingsCache() {
  cache.clear();
}
