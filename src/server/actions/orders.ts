"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AddressType, OrderChannel, OrderStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";
import { sendEmail, orderConfirmationEmail, shippedEmail } from "@/lib/email/resend";
import { env } from "@/lib/env";
import { adminRedirect } from "@/lib/admin-redirect";

const updateOrderSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(OrderStatus).optional(),
  trackingNumber: z.string().optional(),
  trackingCarrier: z.string().optional(),
  adminNote: z.string().optional(),
});

export async function updateOrder(formData: FormData) {
  const session = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = updateOrderSchema.parse({
    id: raw.id,
    status: raw.status || undefined,
    trackingNumber: raw.trackingNumber || undefined,
    trackingCarrier: raw.trackingCarrier || undefined,
    adminNote: raw.adminNote || undefined,
  });

  const before = await prisma.order.findUnique({ where: { id: parsed.id } });
  if (!before) throw new Error("Sipariş bulunamadı");

  const updates: Record<string, unknown> = {};
  if (parsed.status) updates.status = parsed.status;
  if (parsed.trackingNumber !== undefined) updates.trackingNumber = parsed.trackingNumber;
  if (parsed.trackingCarrier !== undefined) updates.trackingCarrier = parsed.trackingCarrier;
  if (parsed.adminNote !== undefined) updates.adminNote = parsed.adminNote;

  if (parsed.status === OrderStatus.SHIPPED && !before.shippedAt) {
    updates.shippedAt = new Date();
  }
  if (parsed.status === OrderStatus.DELIVERED && !before.deliveredAt) {
    updates.deliveredAt = new Date();
  }
  if (parsed.status === OrderStatus.PAID && !before.paidAt) {
    updates.paidAt = new Date();
  }
  if (parsed.status === OrderStatus.CANCELLED && !before.cancelledAt) {
    updates.cancelledAt = new Date();
  }

  const updated = await prisma.order.update({
    where: { id: parsed.id },
    data: updates,
    include: { items: true },
  });

  await logActivity({
    userId: session.user.id,
    action: "UPDATE",
    entity: "Order",
    entityId: updated.id,
    diff: updates,
  });

  // Send email notification on shipping if email available
  if (
    updated.customerEmail &&
    parsed.status === OrderStatus.SHIPPED &&
    updated.trackingNumber &&
    updated.trackingCarrier
  ) {
    const trackUrl = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/siparis/${updated.publicToken}`;
    const tpl = shippedEmail({
      customerName: updated.customerName,
      orderNumber: updated.orderNumber,
      carrier: updated.trackingCarrier,
      trackingNumber: updated.trackingNumber,
      trackUrl,
    });
    await sendEmail({ to: updated.customerEmail, ...tpl });
  }

  revalidatePath(`/admin/siparisler/${updated.id}`);
  revalidatePath("/admin/siparisler");
}

// ────────────────────────────────────────────────────────────
// Draft order helpers
// ────────────────────────────────────────────────────────────

export type CustomerSearchResult = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  addresses: {
    id: string;
    fullName: string;
    phone: string;
    line1: string;
    line2: string | null;
    district: string | null;
    city: string;
    country: string;
  }[];
};

export async function searchCustomerByPhone(
  phone: string,
): Promise<CustomerSearchResult | null> {
  await requireAdmin();
  const normalized = phone.replace(/\s/g, "");
  const customer = await prisma.customer.findFirst({
    where: { phone: { contains: normalized } },
    include: {
      addresses: {
        where: { type: AddressType.SHIPPING },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        take: 5,
      },
    },
  });
  if (!customer) return null;
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    addresses: customer.addresses.map((a) => ({
      id: a.id,
      fullName: a.fullName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2,
      district: a.district,
      city: a.city,
      country: a.country,
    })),
  };
}

export type ProductSearchResult = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  imageUrl: string | null;
};

export async function searchProductsForOrder(
  q: string,
): Promise<ProductSearchResult[]> {
  await requireAdmin();
  if (!q.trim()) return [];
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q.trim(), mode: "insensitive" } },
        { sku: { contains: q.trim(), mode: "insensitive" } },
      ],
    },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    take: 10,
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: Number(p.price),
    imageUrl: p.images[0]?.url ?? null,
  }));
}

const draftOrderItemSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().optional(),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
  imageSnapshot: z.string().optional(),
});

const draftOrderSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1, "Müşteri adı zorunlu"),
  customerPhone: z.string().min(7, "Telefon zorunlu"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerNote: z.string().optional(),
  adminNote: z.string().optional(),
  channel: z.nativeEnum(OrderChannel),
  shippingTotal: z.coerce.number().min(0).default(0),
  discountTotal: z.coerce.number().min(0).default(0),
  // address fields
  addrFullName: z.string().min(1, "Ad soyad zorunlu"),
  addrPhone: z.string().min(7, "Adres telefonu zorunlu"),
  addrLine1: z.string().min(1, "Adres satırı zorunlu"),
  addrLine2: z.string().optional(),
  addrDistrict: z.string().optional(),
  addrCity: z.string().min(1, "Şehir zorunlu"),
  addrCountry: z.string().default("TR"),
  // items as JSON string
  itemsJson: z.string(),
});

export async function createDraftOrder(formData: FormData) {
  const session = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());

  const parsed = draftOrderSchema.safeParse({
    ...raw,
    customerEmail: raw.customerEmail || undefined,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Geçersiz veri");
  }

  const d = parsed.data;

  const rawItems = JSON.parse(d.itemsJson) as unknown[];
  const items = rawItems.map((item) => draftOrderItemSchema.parse(item));

  if (items.length === 0) throw new Error("En az bir ürün ekleyin");

  const subtotal = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const grandTotal = Math.max(0, subtotal + d.shippingTotal - d.discountTotal);

  const orderNumber = `ORD-${Date.now()}`;
  const publicToken = crypto.randomUUID();

  const shippingAddressJson = {
    fullName: d.addrFullName,
    phone: d.addrPhone,
    line1: d.addrLine1,
    line2: d.addrLine2 || null,
    district: d.addrDistrict || null,
    city: d.addrCity,
    country: d.addrCountry,
  };

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        publicToken,
        customerId: d.customerId || null,
        channel: d.channel,
        status: OrderStatus.PENDING,
        subtotal,
        discountTotal: d.discountTotal,
        shippingTotal: d.shippingTotal,
        taxTotal: 0,
        grandTotal,
        currency: "TRY",
        customerName: d.customerName,
        customerEmail: d.customerEmail || null,
        customerPhone: d.customerPhone,
        shippingAddressJson,
        customerNote: d.customerNote || null,
        adminNote: d.adminNote || null,
        items: {
          create: items.map((it) => ({
            productId: it.productId || null,
            variantId: it.variantId || null,
            name: it.name,
            sku: it.sku || null,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            lineTotal: it.unitPrice * it.quantity,
            imageSnapshot: it.imageSnapshot || null,
          })),
        },
      },
    });
    return newOrder;
  });

  await logActivity({
    userId: session.user.id,
    action: "CREATE",
    entity: "Order",
    entityId: order.id,
    diff: { orderNumber, channel: d.channel, status: "PENDING" },
  });

  revalidatePath("/admin/siparisler");
  revalidatePath("/admin/siparisler/taslaklar");
  await adminRedirect(`/admin/siparisler/${order.id}`);
}

export async function sendOrderConfirmationEmail(orderId: string) {
  await requireAdmin();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || !order.customerEmail) {
    return { ok: false, error: "Müşteri e-posta adresi yok" };
  }
  const trackUrl = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/siparis/${order.publicToken}`;
  const tpl = orderConfirmationEmail({
    customerName: order.customerName,
    orderNumber: order.orderNumber,
    items: order.items.map((it) => ({
      name: it.name,
      quantity: it.quantity,
      lineTotal: Number(it.lineTotal),
    })),
    total: Number(order.grandTotal),
    trackUrl,
    channel: order.channel,
  });
  return sendEmail({ to: order.customerEmail, ...tpl });
}
