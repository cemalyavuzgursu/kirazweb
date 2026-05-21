import { getSetting } from "./settings";

export interface OrderForWhatsapp {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  total: number;
  trackUrl: string;
}

export async function buildWhatsappUrl(order: OrderForWhatsapp): Promise<string | null> {
  const number = await getSetting<string>("whatsapp.number");
  const template = await getSetting<string>(
    "whatsapp.messageTemplate",
    "Sipariş No: {ORDER_NUMBER}\nÜrünler:\n{ITEMS}\nToplam: {TOTAL} ₺",
  );
  if (!number) return null;

  const itemsLines = order.items
    .map((it) => `• ${it.name} × ${it.quantity} — ${(it.unitPrice * it.quantity).toFixed(2)} ₺`)
    .join("\n");

  const message = (template ?? "")
    .replaceAll("{ORDER_NUMBER}", order.orderNumber)
    .replaceAll("{NAME}", order.customerName)
    .replaceAll("{PHONE}", order.customerPhone)
    .replaceAll("{ADDRESS}", order.shippingAddress)
    .replaceAll("{ITEMS}", itemsLines)
    .replaceAll("{TOTAL}", order.total.toFixed(2))
    .replaceAll("{TRACK_URL}", order.trackUrl);

  const cleanNumber = number.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
