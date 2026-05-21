"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { OrderChannel, OrderStatus } from "@prisma/client";
import { getSetting } from "@/lib/settings";
import { env } from "@/lib/env";
import { buildWhatsappUrl } from "@/lib/whatsapp";

const itemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1),
});

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Ad soyad zorunlu"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().min(7, "Telefon zorunlu").optional().or(z.literal("")),
  shippingLine1: z.string().min(3),
  shippingLine2: z.string().optional(),
  shippingPhone: z.string().optional().or(z.literal("")),
  shippingDistrict: z.string().optional(),
  shippingCity: z.string().min(2),
  shippingPostalCode: z.string().optional(),
  customerNote: z.string().optional(),
  channel: z.enum(["WHATSAPP", "IYZICO"]),
  items: z.array(itemSchema).min(1, "Sepet boş"),
});

function generateOrderNumber(): string {
  const today = new Date();
  const ymd =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `KT-${ymd}-${rand}`;
}

export async function createOrder(input: z.infer<typeof checkoutSchema>) {
  const parsed = checkoutSchema.parse(input);

  // Fetch shipping settings outside the transaction (read-only, non-critical)
  const flatRate = (await getSetting<number>("shipping.flatRate", 0)) ?? 0;
  const freeThreshold = (await getSetting<number>("shipping.freeThreshold", 0)) ?? 0;

  const orderNumber = generateOrderNumber();
  const publicToken = crypto.randomBytes(16).toString("hex");
  const productIds = parsed.items.map((i) => i.productId);

  const order = await prisma.$transaction(async (tx) => {
    // Reload products inside transaction to get fresh prices and images
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
    });

    const itemsResolved = parsed.items.map((cartItem) => {
      const p = products.find((pp) => pp.id === cartItem.productId);
      if (!p) throw new Error(`Ürün bulunamadı: ${cartItem.productId}`);
      return {
        product: p,
        quantity: cartItem.quantity,
        unitPrice: Number(p.price),
        lineTotal: Number(p.price) * cartItem.quantity,
      };
    });

    const subtotal = itemsResolved.reduce((s, it) => s + it.lineTotal, 0);
    const shipping = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : flatRate;
    const grandTotal = subtotal + shipping;

    // Decrement stock atomically; the WHERE condition prevents going below zero
    for (const it of itemsResolved) {
      const result = await tx.product.updateMany({
        where: { id: it.product.id, stock: { gte: it.quantity } },
        data: { stock: { decrement: it.quantity } },
      });
      if (result.count === 0) throw new Error(`Yetersiz stok: ${it.product.name}`);
    }

    return tx.order.create({
      data: {
        orderNumber,
        publicToken,
        channel: parsed.channel as OrderChannel,
        status:
          parsed.channel === "WHATSAPP"
            ? OrderStatus.AWAITING_WHATSAPP
            : OrderStatus.AWAITING_PAYMENT,
        subtotal,
        shippingTotal: shipping,
        grandTotal,
        currency: "TRY",
        customerName: parsed.customerName,
        customerEmail: parsed.customerEmail || null,
        customerPhone: parsed.customerPhone || "",
        shippingAddressJson: {
          fullName: parsed.customerName,
          phone: parsed.shippingPhone || parsed.customerPhone || "",
          line1: parsed.shippingLine1,
          line2: parsed.shippingLine2 ?? "",
          district: parsed.shippingDistrict ?? "",
          city: parsed.shippingCity,
          postalCode: parsed.shippingPostalCode ?? "",
          country: "TR",
        },
        customerNote: parsed.customerNote || null,
        items: {
          create: itemsResolved.map((it) => ({
            productId: it.product.id,
            name: it.product.name,
            sku: it.product.sku,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            lineTotal: it.lineTotal,
            imageSnapshot: it.product.images[0]?.url ?? null,
          })),
        },
      },
    });
  });

  revalidatePath("/admin/siparisler");

  return { id: order.id, orderNumber, publicToken, channel: order.channel };
}

export async function getWhatsappCheckoutUrl(publicToken: string): Promise<string | null> {
  const order = await prisma.order.findUnique({
    where: { publicToken },
    include: { items: true },
  });
  if (!order) return null;

  const shipping = order.shippingAddressJson as Record<string, string>;
  const trackUrl = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/siparis/${order.publicToken}`;

  return buildWhatsappUrl({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    shippingAddress: [shipping.line1, shipping.district, shipping.city, shipping.postalCode]
      .filter(Boolean)
      .join(", "),
    items: order.items.map((it) => ({
      name: it.name,
      quantity: it.quantity,
      unitPrice: Number(it.unitPrice),
    })),
    total: Number(order.grandTotal),
    trackUrl,
  });
}

export async function markWhatsappSent(publicToken: string) {
  await prisma.order.update({
    where: { publicToken },
    data: { whatsappSentAt: new Date() },
  });
}
