import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { getIyzicoConfig, verifyWebhookSignature } from "@/lib/iyzico/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const cfg = await getIyzicoConfig();
  if (!cfg.enabled) {
    return NextResponse.json({ ok: true });
  }

  const rawBody = await req.text();
  let body: Record<string, string>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const signature = req.headers.get("x-iyz-signature-v3") ?? "";
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 401 });
  }
  const valid = verifyWebhookSignature(cfg.secret, body, signature);
  if (!valid) {
    console.warn("iyzico webhook signature mismatch", { body });
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const { paymentId, paymentConversationId, status, iyziEventType } = body;

  if (paymentConversationId) {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: paymentConversationId }, { iyzicoConversationId: paymentConversationId }] },
    });
    if (order) {
      await prisma.paymentEvent.create({
        data: {
          paymentId:
            (
              await prisma.payment.findFirst({
                where: { orderId: order.id },
                orderBy: { createdAt: "desc" },
                select: { id: true },
              })
            )?.id ??
            (
              await prisma.payment.create({
                data: {
                  orderId: order.id,
                  amount: order.grandTotal,
                  status: PaymentStatus.INITIATED,
                  externalId: paymentId,
                },
              })
            ).id,
          eventType: iyziEventType ?? "WEBHOOK",
          payload: body as never,
        },
      });

      // Idempotent status update
      if (status === "SUCCESS" && order.status !== OrderStatus.PAID) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.PAID,
            paidAt: new Date(),
            iyzicoPaymentId: paymentId,
          },
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
