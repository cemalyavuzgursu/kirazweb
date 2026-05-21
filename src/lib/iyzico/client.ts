import crypto from "node:crypto";
import { getSetting } from "../settings";
import { env } from "../env";

export async function getIyzicoConfig() {
  const [enabled, sandbox, force3ds, apiKeyDb, secretDb] = await Promise.all([
    getSetting<boolean>("payment.iyzico.enabled", false),
    getSetting<boolean>("payment.iyzico.sandbox", true),
    getSetting<boolean>("payment.iyzico.force3ds", true),
    getSetting<string>("payment.iyzico.apiKey", ""),
    getSetting<string>("payment.iyzico.secret", ""),
  ]);

  const apiKey = apiKeyDb || env.IYZICO_API_KEY;
  const secret = secretDb || env.IYZICO_SECRET;
  const baseUrl = sandbox
    ? "https://sandbox-api.iyzipay.com"
    : "https://api.iyzipay.com";

  return { enabled: !!enabled, force3ds: !!force3ds, apiKey, secret, baseUrl };
}

interface IyzicoRequestOpts {
  uriPath: string;
  body: Record<string, unknown>;
}

export async function iyzicoRequest<T = unknown>(opts: IyzicoRequestOpts): Promise<T> {
  const cfg = await getIyzicoConfig();
  if (!cfg.apiKey || !cfg.secret) {
    throw new Error("iyzico credentials not configured");
  }

  const randomKey = crypto.randomBytes(8).toString("hex");
  const bodyJson = JSON.stringify(opts.body);

  const signaturePayload = randomKey + opts.uriPath + bodyJson;
  const signature = crypto
    .createHmac("sha256", cfg.secret)
    .update(signaturePayload)
    .digest("hex");

  const authString = `apiKey:${cfg.apiKey}&randomKey:${randomKey}&signature:${signature}`;
  const auth = "IYZWSv2 " + Buffer.from(authString).toString("base64");

  const res = await fetch(cfg.baseUrl + opts.uriPath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
      "x-iyzi-rnd": randomKey,
    },
    body: bodyJson,
  });

  const json = (await res.json()) as T;
  return json;
}

export function verifyWebhookSignature(
  secret: string,
  body: { iyziEventType?: string; paymentId?: string; paymentConversationId?: string; status?: string },
  signature: string,
): boolean {
  const payload =
    secret +
    (body.iyziEventType ?? "") +
    (body.paymentId ?? "") +
    (body.paymentConversationId ?? "") +
    (body.status ?? "");
  const computed = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  // timing-safe compare
  const a = Buffer.from(computed);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
