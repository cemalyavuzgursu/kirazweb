"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { registerCustomer } from "@/server/actions/customer-account";

export default function CustomerRegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerCustomer(new FormData(e.currentTarget));
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError(err instanceof Error ? err.message : "Kayıt başarısız");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl mb-2" style={{ color: "var(--kt-heading)" }}>Hesap Oluştur</h1>
        <p className="text-sm mb-8" style={{ color: "var(--kt-muted)" }}>
          Zaten hesabın var mı?{" "}
          <Link href="/hesabim/giris" className="hover:underline" style={{ color: "var(--kt-primary)" }}>Giriş Yap</Link>
        </p>

        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/auth/google"
          className="flex items-center justify-center gap-3 w-full h-11 rounded-md text-sm font-medium transition"
          style={{ border: "1px solid var(--kt-border)", color: "var(--kt-heading)" }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Google ile Kayıt Ol
        </a>

        <div className="flex items-center gap-3 text-sm" style={{ color: "var(--kt-muted)", opacity: 0.6 }}>
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--kt-border)" }} />
          veya
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--kt-border)" }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg p-6" style={{ border: "1px solid var(--kt-border)" }}>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name" style={{ color: "var(--kt-heading)" }}>Ad Soyad *</label>
            <input id="name" name="name" required autoComplete="name"
              className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email" style={{ color: "var(--kt-heading)" }}>E-posta *</label>
            <input id="email" name="email" type="email" required autoComplete="email"
              className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="phone" style={{ color: "var(--kt-heading)" }}>Telefon *</label>
            <input id="phone" name="phone" type="tel" required autoComplete="tel"
              className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password" style={{ color: "var(--kt-heading)" }}>Şifre * (en az 8 karakter)</label>
            <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password"
              className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }} />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-sm text-rose-700">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full h-11 disabled:opacity-50 text-white rounded-md font-medium transition flex items-center justify-center gap-2"
            style={{ backgroundColor: "var(--kt-primary)" }}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Kayıt Ol
          </button>

          <p className="text-xs text-center" style={{ color: "var(--kt-muted)", opacity: 0.6 }}>
            Kayıt olarak <Link href="/kvkk" className="underline">KVKK</Link> metnini kabul etmiş sayılırsınız.
          </p>
        </form>
      </div>
    </div>
  );
}
