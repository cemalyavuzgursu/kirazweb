"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { updateCustomerProfile } from "@/server/actions/customer-account";

type Props = {
  name: string;
  email: string;
  phone: string | null;
};

export function ProfileFormClient({ name, email, phone }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await updateCustomerProfile(new FormData(e.currentTarget));
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Güncelleme başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg p-6 space-y-4 max-w-lg" style={{ border: "1px solid var(--kt-border)" }}>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="name" style={{ color: "var(--kt-heading)" }}>Ad Soyad *</label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          defaultValue={name}
          className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="email" style={{ color: "var(--kt-heading)" }}>E-posta *</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={email}
          className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="phone" style={{ color: "var(--kt-heading)" }}>Telefon *</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          defaultValue={phone ?? ""}
          className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
        />
      </div>

      <hr style={{ borderColor: "var(--kt-border)" }} />

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="password" style={{ color: "var(--kt-heading)" }}>
          Yeni Şifre <span className="font-normal" style={{ color: "var(--kt-muted)", opacity: 0.6 }}>(değiştirmek istemiyorsanız boş bırakın)</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          autoComplete="new-password"
          className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
        />
      </div>

      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-sm text-rose-700">{error}</div>
      )}
      {success && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">Bilgileriniz güncellendi.</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 disabled:opacity-50 text-white rounded-md font-medium transition flex items-center justify-center gap-2"
        style={{ backgroundColor: "var(--kt-primary)" }}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Kaydet
      </button>
    </form>
  );
}
