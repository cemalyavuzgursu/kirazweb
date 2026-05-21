import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { setCustomerSession } from "@/lib/customer-session";

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = req.cookies.get("_gstate")?.value;

  const errorRedirect = NextResponse.redirect(new URL("/hesabim/giris?error=google", req.url));

  if (!code || !state || !storedState || state !== storedState) {
    return errorRedirect;
  }

  try {
    const [clientId, clientSecret] = await Promise.all([
      getSetting<string>("google_oauth_client_id"),
      getSetting<string>("google_oauth_client_secret"),
    ]);

    if (!clientId || !clientSecret) return errorRedirect;

    const origin = url.origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) return errorRedirect;

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) return errorRedirect;

    const googleUser = (await userRes.json()) as GoogleUserInfo;
    const googleId = googleUser.id;
    const email = googleUser.email?.toLowerCase() ?? null;
    const name = googleUser.name ?? email ?? "Müşteri";

    let customer = await prisma.customer.findUnique({ where: { googleId } });

    if (!customer && email) {
      const byEmail = await prisma.customer.findFirst({ where: { email } });
      if (byEmail) {
        customer = await prisma.customer.update({
          where: { id: byEmail.id },
          data: { googleId },
        });
      }
    }

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          googleId,
          email,
          name,
          phone: "",
        },
      });
    }

    await setCustomerSession({
      customerId: customer.id,
      email: customer.email ?? email ?? "",
      name: customer.name,
    });

    const response = NextResponse.redirect(new URL("/hesabim/siparisler", req.url));
    response.cookies.delete("_gstate");
    return response;
  } catch {
    return errorRedirect;
  }
}
