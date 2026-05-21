"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { saveAddress } from "@/server/actions/customer-account";

type AddressData = {
  id: string;
  type: "SHIPPING" | "BILLING";
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  district: string | null;
  city: string;
  postalCode: string | null;
  isDefault: boolean;
} | null;

export function AddressFormClient({ address }: { address: AddressData }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await saveAddress(new FormData(e.currentTarget));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg p-6 space-y-4 max-w-lg" style={{ border: "1px solid var(--kt-border)" }}>
      {address && <input type="hidden" name="id" value={address.id} />}

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="type" style={{ color: "var(--kt-heading)" }}>Adres Tipi *</label>
        <select
          id="type"
          name="type"
          defaultValue={address?.type ?? "SHIPPING"}
          className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
        >
          <option value="SHIPPING">Teslimat Adresi</option>
          <option value="BILLING">Fatura Adresi</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="fullName" style={{ color: "var(--kt-heading)" }}>Ad Soyad *</label>
        <input
          id="fullName"
          name="fullName"
          required
          defaultValue={address?.fullName ?? ""}
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
          defaultValue={address?.phone ?? ""}
          className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="line1" style={{ color: "var(--kt-heading)" }}>Adres Satırı 1 *</label>
        <input
          id="line1"
          name="line1"
          required
          defaultValue={address?.line1 ?? ""}
          placeholder="Mahalle, sokak, bina no"
          className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="line2" style={{ color: "var(--kt-heading)" }}>Adres Satırı 2</label>
        <input
          id="line2"
          name="line2"
          defaultValue={address?.line2 ?? ""}
          placeholder="Daire, kat (isteğe bağlı)"
          className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="district" style={{ color: "var(--kt-heading)" }}>İlçe</label>
          <input
            id="district"
            name="district"
            defaultValue={address?.district ?? ""}
            className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="city" style={{ color: "var(--kt-heading)" }}>Şehir *</label>
          <input
            id="city"
            name="city"
            required
            defaultValue={address?.city ?? ""}
            className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="postalCode" style={{ color: "var(--kt-heading)" }}>Posta Kodu</label>
        <input
          id="postalCode"
          name="postalCode"
          defaultValue={address?.postalCode ?? ""}
          className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)" }}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={address?.isDefault ?? false}
          className="rounded text-rose-500 focus:ring-rose-300"
          style={{ borderColor: "var(--kt-border)" }}
        />
        <span className="text-sm" style={{ color: "var(--kt-muted)" }}>Varsayılan adres olarak ayarla</span>
      </label>

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
        {address ? "Güncelle" : "Kaydet"}
      </button>
    </form>
  );
}
