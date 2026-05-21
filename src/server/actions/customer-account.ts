"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { setCustomerSession, getCustomerSession, clearCustomerSession, requireCustomer } from "@/lib/customer-session";
import { AddressType } from "@prisma/client";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import { env } from "@/lib/env";

// ─── Auth ───────────────────────────────────────────────────────────────────

export async function loginCustomer(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  const customer = await prisma.customer.findFirst({ where: { email } });
  if (!customer?.passwordHash) throw new Error("E-posta veya şifre hatalı");

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) throw new Error("E-posta veya şifre hatalı");

  await setCustomerSession({ customerId: customer.id, email: customer.email ?? email, name: customer.name });
  redirect("/hesabim/siparisler");
}

export async function registerCustomer(formData: FormData) {
  const schema = z.object({
    name: z.string().min(2, "Ad soyad zorunlu"),
    email: z.string().email("Geçerli bir e-posta girin"),
    phone: z.string().min(7, "Telefon zorunlu"),
    password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  });

  const parsed = schema.parse({
    name: formData.get("name"),
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  const existing = await prisma.customer.findFirst({ where: { email: parsed.email } });
  if (existing?.passwordHash) throw new Error("Bu e-posta ile zaten bir hesap mevcut. Giriş yapın.");

  const passwordHash = await bcrypt.hash(parsed.password, 12);

  const customer = existing
    ? await prisma.customer.update({ where: { id: existing.id }, data: { name: parsed.name, phone: parsed.phone, passwordHash } })
    : await prisma.customer.create({ data: { email: parsed.email, phone: parsed.phone, name: parsed.name, passwordHash } });

  await setCustomerSession({ customerId: customer.id, email: customer.email ?? parsed.email, name: customer.name });
  redirect("/hesabim/siparisler");
}

export async function logoutCustomer() {
  await clearCustomerSession();
  redirect("/hesabim/giris");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  if (!email) throw new Error("E-posta adresi gerekli");

  const customer = await prisma.customer.findFirst({ where: { email } });
  // Always redirect to prevent email enumeration
  if (customer?.passwordHash) {
    const token = randomBytes(16).toString("hex");
    const exp = Date.now() + 60 * 60 * 1000; // 1 hour
    await prisma.setting.upsert({
      where: { key: `pwd_reset:${token}` },
      update: { value: { email, exp } },
      create: { key: `pwd_reset:${token}`, value: { email, exp } },
    });
    const resetLink = `${env.NEXT_PUBLIC_SITE_URL}/hesabim/sifremi-sifirla?token=${token}`;
    await sendPasswordResetEmail(email, resetLink, customer.name ?? undefined);
  }

  redirect("/hesabim/sifremi-unuttum?sent=1");
}

export async function resetPassword(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!token) throw new Error("Geçersiz bağlantı");
  if (password.length < 8) throw new Error("Şifre en az 8 karakter olmalı");

  const record = await prisma.setting.findUnique({ where: { key: `pwd_reset:${token}` } });
  if (!record) throw new Error("Bu bağlantı geçersiz veya süresi dolmuş");

  const data = record.value as { email: string; exp: number };
  if (!data.email || !data.exp || Date.now() > data.exp) {
    throw new Error("Bu bağlantının süresi dolmuş. Lütfen yeni bir sıfırlama isteği gönderin.");
  }

  const customer = await prisma.customer.findFirst({ where: { email: data.email } });
  if (!customer) throw new Error("Hesap bulunamadı");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.customer.update({ where: { id: customer.id }, data: { passwordHash } });
  await prisma.setting.delete({ where: { key: `pwd_reset:${token}` } });

  await setCustomerSession({ customerId: customer.id, email: customer.email ?? data.email, name: customer.name });
  redirect("/hesabim/siparisler");
}

// ─── Profile ────────────────────────────────────────────────────────────────

export async function updateCustomerProfile(formData: FormData) {
  const session = await requireCustomer();

  const schema = z.object({
    name: z.string().min(2, "Ad soyad zorunlu"),
    email: z.string().email("Geçerli bir e-posta girin"),
    phone: z.string().min(7, "Telefon zorunlu"),
    password: z.string().optional(),
  });

  const parsed = schema.parse({
    name: formData.get("name"),
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    phone: formData.get("phone"),
    password: formData.get("password") || undefined,
  });

  const data: Record<string, unknown> = { name: parsed.name, email: parsed.email, phone: parsed.phone };
  if (parsed.password && parsed.password.length >= 8) {
    data.passwordHash = await bcrypt.hash(parsed.password, 12);
  }

  await prisma.customer.update({ where: { id: session.customerId }, data: data as never });
  await setCustomerSession({ customerId: session.customerId, email: parsed.email, name: parsed.name });

  revalidatePath("/hesabim/profil");
  redirect("/hesabim/profil");
}

// ─── Addresses ──────────────────────────────────────────────────────────────

const addressSchema = z.object({
  id: z.string().optional(),
  type: z.nativeEnum(AddressType).default(AddressType.SHIPPING),
  fullName: z.string().min(2, "Ad soyad zorunlu"),
  phone: z.string().min(7, "Telefon zorunlu"),
  line1: z.string().min(3, "Adres zorunlu"),
  line2: z.string().optional(),
  district: z.string().optional(),
  city: z.string().min(2, "Şehir zorunlu"),
  postalCode: z.string().optional(),
  isDefault: z.coerce.boolean().default(false),
});

export async function saveAddress(formData: FormData) {
  const session = await requireCustomer();
  const raw = Object.fromEntries(formData.entries());
  const parsed = addressSchema.parse({ ...raw, isDefault: raw.isDefault === "on" || raw.isDefault === "true" });

  const data = {
    customerId: session.customerId,
    type: parsed.type,
    fullName: parsed.fullName,
    phone: parsed.phone,
    line1: parsed.line1,
    line2: parsed.line2 || null,
    district: parsed.district || null,
    city: parsed.city,
    postalCode: parsed.postalCode || null,
    country: "TR",
    isDefault: parsed.isDefault,
  };

  if (parsed.id) {
    await prisma.address.update({ where: { id: parsed.id, customerId: session.customerId }, data });
  } else {
    await prisma.address.create({ data });
  }

  revalidatePath("/hesabim/adresler");
  redirect("/hesabim/adresler");
}

export async function deleteAddress(formData: FormData) {
  const session = await requireCustomer();
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.address.delete({ where: { id, customerId: session.customerId } });
  revalidatePath("/hesabim/adresler");
}

export async function setDefaultAddress(formData: FormData) {
  const session = await requireCustomer();
  const id = formData.get("id") as string;
  const type = formData.get("type") as AddressType;
  if (!id) return;

  // Clear existing default for this type, then set new
  await prisma.$transaction([
    prisma.address.updateMany({
      where: { customerId: session.customerId, type, isDefault: true },
      data: { isDefault: false },
    }),
    prisma.address.update({ where: { id, customerId: session.customerId }, data: { isDefault: true } }),
  ]);

  revalidatePath("/hesabim/adresler");
}
