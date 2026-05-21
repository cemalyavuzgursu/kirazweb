import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSetting } from "@/lib/settings";

export async function GET(req: NextRequest) {
  const clientId = await getSetting<string>("google_oauth_client_id");
  if (!clientId) {
    return NextResponse.redirect(new URL("/hesabim/giris?error=google", req.url));
  }

  const state = randomBytes(16).toString("hex");
  const origin = new URL(req.url).origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );

  response.cookies.set("_gstate", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
