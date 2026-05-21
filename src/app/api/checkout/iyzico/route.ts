import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { initializeCheckoutForm } from "@/lib/iyzico/checkout-form";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { orderId } = (await req.json()) as { orderId: string };
    if (!orderId) return NextResponse.json({ error: "orderId zorunlu" }, { status: 400 });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });

    const callbackUrl = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/api/checkout/iyzico/callback?order=${order.id}`;
    const result = await initializeCheckoutForm({ order, callbackUrl });

    if (result.status !== "success" || !result.paymentPageUrl) {
      return NextResponse.json(
        { error: result.errorMessage ?? "Ödeme başlatılamadı" },
        { status: 400 },
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { iyzicoToken: result.token, iyzicoConversationId: result.conversationId },
    });

    return NextResponse.json({ paymentPageUrl: result.paymentPageUrl, token: result.token });
  } catch (e) {
    console.error("iyzico initialize error", e);
    const message = e instanceof Error ? e.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
