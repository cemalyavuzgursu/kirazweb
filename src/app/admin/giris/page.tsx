import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth, signIn, signOut } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string; clear?: string }>;
}) {
  const { error, clear } = await searchParams;

  // Stale token with no roleId — sign out server-side then show login form
  if (clear === "1") {
    await signOut({ redirect: false });
  } else {
    const session = await auth();
    // Only redirect if session has a valid roleId; otherwise fall through to login
    if (session?.user?.roleId) {
      redirect("/admin");
    }
  }

  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Build redirect URL using the actual request host (admin.localhost:3000)
    // so Next Auth doesn't fall back to NEXTAUTH_URL (localhost:3000)
    const h = await headers();
    const host = h.get("host") ?? "admin.localhost:3000";
    const proto = process.env.NODE_ENV === "production" ? "https" : "http";
    const redirectTo = `${proto}://${host}/admin`;

    try {
      await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirectTo,
      });
    } catch (err) {
      // next-auth throws redirect — re-throw
      if ((err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw err;
      throw err;
    }
  }

  return (
    <main className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-ink-700 mb-2">Kiraz Tasarım</h1>
          <p className="text-sm text-ink-300 uppercase tracking-[0.2em]">Yönetim Paneli</p>
        </div>

        <form
          action={login}
          className="bg-white rounded-lg border border-cream-200 p-8 space-y-5 shadow-sm"
        >
          <div>
            <label htmlFor="email" className="block text-sm text-ink-500 mb-2">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full px-4 py-2.5 rounded-md border border-cream-200 bg-cream-50 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-ink-500 mb-2">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-md border border-cream-200 bg-cream-50 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition"
            />
          </div>

          {error ? (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
              E-posta veya şifre hatalı.
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full py-2.5 rounded-md bg-rose-500 hover:bg-rose-600 text-white font-medium transition"
          >
            Giriş Yap
          </button>
        </form>

        <p className="text-center text-xs text-ink-300 mt-6">
          © {new Date().getFullYear()} Kiraz Tasarım
        </p>
      </div>
    </main>
  );
}
