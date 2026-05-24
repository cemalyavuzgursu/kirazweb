import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const host = request.headers.get("host")?.toLowerCase() ?? "";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", path);
  requestHeaders.set("x-host", host);

  // Theme editor iframe: mark preview requests so layouts skip analytics/banners
  if (request.nextUrl.searchParams.get("preview") === "1") {
    requestHeaders.set("x-preview-mode", "1");
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|uploads/).*)"],
};
