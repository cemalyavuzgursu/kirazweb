import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-session";
import { AccountNav } from "@/components/public/account/account-nav";

// These pages must NOT trigger the auth guard — they are the auth pages themselves.
// Without this check, the layout would redirect /hesabim/giris → /hesabim/giris → infinite loop.
const AUTH_PATHS = ["/hesabim/giris", "/hesabim/kayit", "/hesabim/sifremi-unuttum", "/hesabim/sifremi-sifirla"];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "";
  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isAuthPage) {
    return <>{children}</>;
  }

  const session = await getCustomerSession();
  if (!session) redirect("/hesabim/giris");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
        <AccountNav name={session.name} />
        <main>{children}</main>
      </div>
    </div>
  );
}
