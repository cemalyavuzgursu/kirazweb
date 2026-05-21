import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { encrypt, decrypt } from "./crypto";

export interface CustomerSession {
  customerId: string;
  email: string;
  name: string;
}

const COOKIE = "cs";
const TTL = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

export async function setCustomerSession(data: CustomerSession): Promise<void> {
  const payload = encrypt(JSON.stringify({ ...data, exp: Date.now() + TTL }));
  const jar = await cookies();
  jar.set(COOKIE, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TTL / 1000,
    path: "/",
  });
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decrypt(raw)) as CustomerSession & { exp: number };
    if (parsed.exp < Date.now()) return null;
    return { customerId: parsed.customerId, email: parsed.email, name: parsed.name };
  } catch {
    return null;
  }
}

export async function clearCustomerSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function requireCustomer(): Promise<CustomerSession> {
  const session = await getCustomerSession();
  if (!session) redirect("/hesabim/giris");
  return session;
}
