import { iyzicoRequest, getIyzicoConfig } from "./client";
import type { Order, OrderItem } from "@prisma/client";

interface CheckoutFormResponse {
  status: "success" | "failure";
  errorMessage?: string;
  errorCode?: string;
  token?: string;
  paymentPageUrl?: string;
  conversationId?: string;
}

export async function initializeCheckoutForm(args: {
  order: Order & { items: OrderItem[] };
  callbackUrl: string;
}): Promise<CheckoutFormResponse> {
  const cfg = await getIyzicoConfig();
  if (!cfg.enabled) {
    return { status: "failure", errorMessage: "iyzico aktif değil" };
  }

  const shipping = args.order.shippingAddressJson as Record<string, string>;
  const fullAddress = [shipping.line1, shipping.line2, shipping.district, shipping.city, shipping.postalCode]
    .filter(Boolean)
    .join(", ");

  const body = {
    locale: "tr",
    conversationId: args.order.id,
    price: args.order.subtotal.toString(),
    paidPrice: args.order.grandTotal.toString(),
    currency: "TRY",
    basketId: args.order.orderNumber,
    paymentGroup: "PRODUCT",
    callbackUrl: args.callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: {
      id: args.order.customerId ?? "GUEST",
      name: args.order.customerName.split(" ")[0] || args.order.customerName,
      surname: args.order.customerName.split(" ").slice(1).join(" ") || args.order.customerName,
      gsmNumber: args.order.customerPhone,
      email: args.order.customerEmail ?? "noreply@kiraztasarim.com",
      identityNumber: "11111111111", // optional placeholder; iyzico requires non-empty
      registrationAddress: fullAddress,
      ip: "85.34.78.112",
      city: shipping.city,
      country: shipping.country ?? "Turkey",
    },
    shippingAddress: {
      contactName: args.order.customerName,
      city: shipping.city,
      country: shipping.country ?? "Turkey",
      address: fullAddress,
      zipCode: shipping.postalCode ?? "",
    },
    billingAddress: {
      contactName: args.order.customerName,
      city: shipping.city,
      country: shipping.country ?? "Turkey",
      address: fullAddress,
      zipCode: shipping.postalCode ?? "",
    },
    basketItems: args.order.items.map((it) => ({
      id: it.productId ?? it.id,
      name: it.name.slice(0, 250),
      category1: "Genel",
      itemType: "PHYSICAL",
      price: (Number(it.unitPrice) * it.quantity).toFixed(2),
    })),
  };

  return iyzicoRequest<CheckoutFormResponse>({
    uriPath: "/payment/iyzipos/checkoutform/initialize/auth/ecom",
    body,
  });
}

export async function retrieveCheckoutForm(token: string): Promise<{
  status: string;
  paymentStatus?: string;
  paymentId?: string;
  conversationId?: string;
  paidPrice?: string;
  errorMessage?: string;
}> {
  return iyzicoRequest({
    uriPath: "/payment/iyzipos/checkoutform/auth/ecom/detail",
    body: { locale: "tr", token },
  });
}
