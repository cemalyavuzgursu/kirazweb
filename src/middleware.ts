import { NextResponse, type NextRequest } from "next/server";

const ADMIN_HOST = process.env.NEXT_PUBLIC_ADMIN_HOST ?? "admin.localhost";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  const url = request.nextUrl.clone();
  const isAdminHost = host.split(":")[0] === ADMIN_HOST;
  const path = url.pathname;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", path);
  requestHeaders.set("x-host", host);

  // Admin subdomain → rewrite to /admin/*
  if (isAdminHost) {
    // Allow next-auth API and static assets to pass through normally
    if (path.startsWith("/api/") || path.startsWith("/_next/") || path === "/favicon.ico") {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Preview requests bypass admin rewrite so public pages render on the admin domain.
    // This keeps the theme editor iframe same-origin, avoiding all CSP/X-Frame-Options issues.
    if (request.nextUrl.searchParams.get("preview") === "1") {
      requestHeaders.set("x-preview-mode", "1");
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Redirect bare admin host root to login
    if (path === "/" || path === "") {
      url.pathname = "/admin";
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    // Rewrite all paths under admin host to /admin/*
    if (!path.startsWith("/admin")) {
      url.pathname = `/admin${path}`;
      requestHeaders.set("x-pathname", url.pathname);
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Public host: block direct /admin/* access (must use admin subdomain)
  if (path.startsWith("/admin")) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|uploads/).*)"],
};
