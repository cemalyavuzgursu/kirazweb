"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { resetPassword } from "@/server/actions/customer-account";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  if (!token) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl mb-4" style={{ color: "var(--kt-heading)" }}>Geçersiz Bağlantı</h1>
          <div className="rounded-lg p-6" style={{ backgroundColor: "var(--kt-surface)", border: "1px solid var(--kt-border)" }}>
            <p className="text-sm mb-4" style={{ color: "var(--kt-muted)" }}>
              Bu şifre sıfırlama bağlantısı geçersiz veya eksik.
            </p>
            <Link href="/hesabim/sifremi-unuttum" className="hover:underline text-sm" style={{ color: "var(--kt-primary)" }}>
              Yeni bağlantı talep et
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("token", token);
    try {
      await resetPassword(formData);
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl mb-2" style={{ color: "var(--kt-heading)" }}>Yeni Şifre Belirle</h1>
        <p className="text-sm mb-8" style={{ color: "var(--kt-muted)" }}>
          Hesabınız için yeni bir şifre oluşturun.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg p-6" style={{ backgroundColor: "var(--kt-surface)", border: "1px solid var(--kt-border)" }}>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password" style={{ color: "var(--kt-heading)" }}>
              Yeni Şifre <span className="font-normal" style={{ color: "var(--kt-muted)" }}>(en az 8 karakter)</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
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
            Şifremi Güncelle
          </button>

          <p className="text-sm text-center" style={{ color: "var(--kt-muted)" }}>
            <Link href="/hesabim/giris" className="hover:underline" style={{ color: "var(--kt-primary)" }}>Giriş sayfasına dön</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
