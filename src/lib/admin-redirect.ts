import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * Use this instead of redirect() in all admin server actions.
 * Constructs an absolute URL using the original request host so that
 * the browser always lands on admin.localhost (not localhost).
 */
export async function adminRedirect(path: string): Promise<never> {
  const h = await headers();
  // Middleware sets x-host to the original incoming host
  const host = h.get("x-host") ?? h.get("host") ?? "admin.localhost:3000";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  return redirect(`${proto}://${host}${path}`);
}
