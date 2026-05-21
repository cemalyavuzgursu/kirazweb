import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { retrieveCheckoutForm } from "@/lib/iyzico/checkout-form";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // iyzico posts back with token in form data
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order");

  let token: string | undefined;
  try {
    const form = await req.formData();
    token = form.get("token")?.toString();
  } catch {
    /* ignore */
  }

  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  if (!orderId || !token) {
    return NextResponse.redirect(`${base}/odeme?error=callback_missing`, { status: 303 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.redirect(`${base}/odeme?error=order_not_found`, { status: 303 });
  }

  // Ensure the token belongs to this order to prevent cross-order payment attacks
  if (order.iyzicoToken && order.iyzicoToken !== token) {
    return NextResponse.redirect(`${base}/odeme?error=invalid_token`, { status: 303 });
  }

  const result = await retrieveCheckoutForm(token);

  const success = result.status === "success" && result.paymentStatus === "SUCCESS";

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "IYZICO",
      amount: order.grandTotal,
      currency: "TRY",
      status: success ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
      externalId: result.paymentId,
      rawResponse: result as never,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: success
      ? {
          status: OrderStatus.PAID,
          paidAt: new Date(),
          iyzicoPaymentId: result.paymentId,
        }
      : { status: OrderStatus.CANCELLED, cancelReason: result.errorMessage ?? "ödeme başarısız" },
  });

  return NextResponse.redirect(
    success
      ? `${base}/siparis/${order.publicToken}?success=1`
      : `${base}/odeme?error=payment_failed`,
    { status: 303 },
  );
}

// also accept GET in case iyzico uses redirect
export const GET = POST;
