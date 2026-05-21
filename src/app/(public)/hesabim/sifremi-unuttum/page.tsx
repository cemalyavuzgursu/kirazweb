"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requestPasswordReset } from "@/server/actions/customer-account";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const sent = searchParams.get("sent") === "1";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(new FormData(e.currentTarget));
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl mb-4" style={{ color: "var(--kt-heading)" }}>E-posta Gönderildi</h1>
          <div className="rounded-lg p-6" style={{ backgroundColor: "var(--kt-surface)", border: "1px solid var(--kt-border)" }}>
            <p className="text-sm mb-4" style={{ color: "var(--kt-muted)" }}>
              Eğer bu e-posta ile kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderildi.
              Lütfen gelen kutunuzu kontrol edin.
            </p>
            <Link href="/hesabim/giris" className="hover:underline text-sm" style={{ color: "var(--kt-primary)" }}>
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl mb-2" style={{ color: "var(--kt-heading)" }}>Şifremi Unuttum</h1>
        <p className="text-sm mb-8" style={{ color: "var(--kt-muted)" }}>
          E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg p-6" style={{ backgroundColor: "var(--kt-surface)", border: "1px solid var(--kt-border)" }}>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email" style={{ color: "var(--kt-heading)" }}>E-posta</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-bg)" }}
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-sm text-rose-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 disabled:opacity-50 text-white rounded-md font-medium transition flex items-center justify-center gap-2"
            style={{ backgroundColor: "var(--kt-primary)" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sıfırlama Bağlantısı Gönder
          </button>

          <p className="text-sm text-center" style={{ color: "var(--kt-muted)" }}>
            <Link href="/hesabim/giris" className="hover:underline" style={{ color: "var(--kt-primary)" }}>Giriş sayfasına dön</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
