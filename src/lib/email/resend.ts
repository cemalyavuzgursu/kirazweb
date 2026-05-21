import { Resend } from "resend";
import { env } from "../env";
import { getSetting } from "../settings";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(env.RESEND_API_KEY);
  return client;
}

export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const c = getClient();
  if (!c) return { ok: false, error: "Resend yapılandırılmamış" };

  const fromName = (await getSetting<string>("email.fromName", "Kiraz Tasarım")) ?? "Kiraz Tasarım";
  const fromAddr = (await getSetting<string>("email.fromAddress", "")) ?? "";
  const replyTo = (await getSetting<string>("email.replyTo", "")) ?? "";

  const from = fromAddr
    ? `${fromName} <${fromAddr}>`
    : env.EMAIL_FROM;

  try {
    await c.emails.send({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      replyTo: replyTo || env.EMAIL_REPLY_TO || undefined,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gönderim hatası" };
  }
}

export function orderConfirmationEmail(args: {
  customerName: string;
  orderNumber: string;
  items: { name: string; quantity: number; lineTotal: number }[];
  total: number;
  trackUrl: string;
  channel: "WHATSAPP" | "IYZICO" | "MANUAL";
}): { subject: string; html: string; text: string } {
  const subject = `Siparişiniz alındı — ${args.orderNumber}`;

  const itemsHtml = args.items
    .map(
      (it) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #f4e7d4">${it.name} × ${it.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #f4e7d4;text-align:right">${it.lineTotal.toFixed(2)} ₺</td></tr>`,
    )
    .join("");

  const channelMessage =
    args.channel === "WHATSAPP"
      ? "Siparişiniz WhatsApp üzerinden tarafımıza ulaştı. En kısa sürede size dönüş yapacağız."
      : "Ödemeniz başarıyla alındı. Siparişiniz kısa sürede hazırlanmaya başlayacak.";

  const html = `<!doctype html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,'Segoe UI',sans-serif;background:#fdfaf6;color:#2b2419;margin:0;padding:24px">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:8px;padding:32px;border:1px solid #f4e7d4">
    <h1 style="font-family:Georgia,serif;color:#2b2419;margin:0 0 8px">Kiraz Tasarım</h1>
    <p style="color:#7a5c3d;font-size:13px;margin:0 0 24px;text-transform:uppercase;letter-spacing:.1em">Sipariş Onayı</p>
    <p>Merhaba ${args.customerName},</p>
    <p>${channelMessage}</p>
    <p><strong>Sipariş No:</strong> ${args.orderNumber}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">${itemsHtml}
      <tr><td style="padding-top:12px;font-weight:600">Toplam</td><td style="padding-top:12px;text-align:right;font-weight:600">${args.total.toFixed(2)} ₺</td></tr>
    </table>
    <p style="margin-top:24px"><a href="${args.trackUrl}" style="display:inline-block;background:#c95265;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none">Siparişi Takip Et</a></p>
    <p style="font-size:12px;color:#948775;margin-top:32px">Bu e-posta otomatik gönderilmiştir. Sorularınız için bize <a href="mailto:info@kiraztasarim.com">info@kiraztasarim.com</a> üzerinden ulaşabilirsiniz.</p>
  </div>
</body></html>`;

  const text = `Merhaba ${args.customerName},\n\n${channelMessage}\n\nSipariş No: ${args.orderNumber}\nToplam: ${args.total.toFixed(2)} ₺\n\nTakip linki: ${args.trackUrl}\n\nKiraz Tasarım`;

  return { subject, html, text };
}

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string,
  name?: string,
): Promise<{ ok: boolean; error?: string }> {
  const displayName = name ?? "Müşterimiz";

  const subject = "Şifrenizi Sıfırlayın - Kiraz Tasarım";

  const html = `<!doctype html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,'Segoe UI',sans-serif;background:#fdfaf6;color:#2b2419;margin:0;padding:24px">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:8px;padding:32px;border:1px solid #f4e7d4">
    <h1 style="font-family:Georgia,serif;color:#2b2419;margin:0 0 8px">Kiraz Tasarım</h1>
    <p style="color:#7a5c3d;font-size:13px;margin:0 0 24px;text-transform:uppercase;letter-spacing:.1em">Şifre Sıfırlama</p>
    <p>Merhaba ${displayName},</p>
    <p>Hesabınız için bir şifre sıfırlama isteği aldık. Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın.</p>
    <p style="background:#fff8f3;border:1px solid #f4e7d4;border-radius:6px;padding:12px;font-size:13px;color:#7a5c3d">
      Bu bağlantı <strong>1 saat</strong> geçerlidir.
    </p>
    <p style="margin-top:24px">
      <a href="${resetLink}" style="display:inline-block;background:#c95265;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">
        Şifremi Sıfırla
      </a>
    </p>
    <p style="font-size:12px;color:#948775;margin-top:16px">
      Butona tıklayamıyorsanız şu bağlantıyı tarayıcınıza kopyalayın:<br>
      <a href="${resetLink}" style="color:#c95265;word-break:break-all">${resetLink}</a>
    </p>
    <p style="font-size:12px;color:#948775;margin-top:24px">
      Bu isteği siz yapmadıysanız bu e-postayı güvenle silebilirsiniz. Hesabınıza herhangi bir değişiklik yapılmamıştır.
    </p>
    <hr style="border:none;border-top:1px solid #f4e7d4;margin:24px 0">
    <p style="font-size:12px;color:#948775;margin:0">Kiraz Tasarım · Bu e-posta otomatik gönderilmiştir.</p>
  </div>
</body></html>`;

  const text = `Merhaba ${displayName},\n\nHesabınız için bir şifre sıfırlama isteği aldık.\n\nŞifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanın (1 saat geçerlidir):\n${resetLink}\n\nBu isteği siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.\n\nKiraz Tasarım`;

  if (!env.RESEND_API_KEY) {
    console.log("[email] RESEND_API_KEY yapılandırılmamış. Şifre sıfırlama linki:", resetLink);
    return { ok: false, error: "Resend yapılandırılmamış" };
  }

  return sendEmail({ to, subject, html, text });
}

export function shippedEmail(args: {
  customerName: string;
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  trackUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Siparişiniz kargoya verildi — ${args.orderNumber}`;
  const html = `<!doctype html><html><body style="font-family:-apple-system,sans-serif;background:#fdfaf6;color:#2b2419;padding:24px">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:8px;padding:32px;border:1px solid #f4e7d4">
    <h2 style="font-family:Georgia,serif">Siparişiniz yola çıktı! 📦</h2>
    <p>Merhaba ${args.customerName},</p>
    <p>${args.orderNumber} numaralı siparişiniz <strong>${args.carrier}</strong> ile kargoya verildi.</p>
    <p><strong>Takip Numarası:</strong> ${args.trackingNumber}</p>
    <p><a href="${args.trackUrl}" style="display:inline-block;background:#c95265;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none">Sipariş Detayı</a></p>
  </div>
</body></html>`;
  const text = `${args.orderNumber} siparişiniz ${args.carrier} ile kargoda. Takip no: ${args.trackingNumber}\n${args.trackUrl}`;
  return { subject, html, text };
}
