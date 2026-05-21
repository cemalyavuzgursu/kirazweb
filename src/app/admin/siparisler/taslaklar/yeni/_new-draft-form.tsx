"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Plus, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createDraftOrder,
  searchCustomerByPhone,
  searchProductsForOrder,
} from "@/server/actions/orders";
import type {
  CustomerSearchResult,
  ProductSearchResult,
} from "@/server/actions/orders";

// ─── Types ────────────────────────────────────────────────────────────────────

type LineItem = {
  productId?: string;
  variantId?: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  imageSnapshot?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function NewDraftOrderForm() {
  // Customer
  const [phoneQuery, setPhoneQuery] = useState("");
  const [foundCustomer, setFoundCustomer] = useState<CustomerSearchResult | null>(null);
  const [customerLookupDone, setCustomerLookupDone] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Address
  const [addrFullName, setAddrFullName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrDistrict, setAddrDistrict] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrCountry, setAddrCountry] = useState("TR");

  // Products
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState<ProductSearchResult[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);

  // Totals / notes
  const [shippingTotal, setShippingTotal] = useState(0);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [channel, setChannel] = useState<"WHATSAPP" | "MANUAL" | "IYZICO">("MANUAL");
  const [customerNote, setCustomerNote] = useState("");
  const [adminNote, setAdminNote] = useState("");

  // UI state
  const [customerSearching, startCustomerSearch] = useTransition();
  const [productSearching, startProductSearch] = useTransition();
  const [submitting, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // ─── Calculated totals ──────────────────────────────────────────────────────

  const subtotal = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const grandTotal = Math.max(0, subtotal + shippingTotal - discountTotal);

  function fmt(n: number) {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
  }

  // ─── Customer lookup ────────────────────────────────────────────────────────

  function handleCustomerSearch() {
    if (!phoneQuery.trim()) return;
    startCustomerSearch(async () => {
      setCustomerLookupDone(false);
      const result = await searchCustomerByPhone(phoneQuery.trim());
      setFoundCustomer(result);
      setCustomerLookupDone(true);
      if (result) {
        setCustomerName(result.name);
        setCustomerPhone(result.phone);
        setCustomerEmail(result.email ?? "");
        const addr = result.addresses[0];
        if (addr) {
          setAddrFullName(addr.fullName);
          setAddrPhone(addr.phone);
          setAddrLine1(addr.line1);
          setAddrLine2(addr.line2 ?? "");
          setAddrDistrict(addr.district ?? "");
          setAddrCity(addr.city);
          setAddrCountry(addr.country);
        }
      } else {
        setCustomerPhone(phoneQuery.trim());
      }
    });
  }

  function applyAddress(addr: CustomerSearchResult["addresses"][0]) {
    setAddrFullName(addr.fullName);
    setAddrPhone(addr.phone);
    setAddrLine1(addr.line1);
    setAddrLine2(addr.line2 ?? "");
    setAddrDistrict(addr.district ?? "");
    setAddrCity(addr.city);
    setAddrCountry(addr.country);
  }

  // ─── Product search ─────────────────────────────────────────────────────────

  function handleProductSearch() {
    if (!productQuery.trim()) return;
    startProductSearch(async () => {
      const results = await searchProductsForOrder(productQuery.trim());
      setProductResults(results);
    });
  }

  function addItem(p: ProductSearchResult) {
    setItems((prev) => {
      const existing = prev.find((it) => it.productId === p.id);
      if (existing) {
        return prev.map((it) =>
          it.productId === p.id ? { ...it, quantity: it.quantity + 1 } : it,
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          sku: p.sku ?? "",
          quantity: 1,
          unitPrice: p.price,
          imageSnapshot: p.imageUrl ?? undefined,
        },
      ];
    });
  }

  function updateItem(idx: number, changes: Partial<LineItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...changes } : it)));
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────

  function handleSubmit() {
    setError(null);
    if (items.length === 0) {
      setError("En az bir ürün eklemelisiniz.");
      return;
    }
    if (!customerName.trim()) {
      setError("Müşteri adı zorunlu.");
      return;
    }
    if (!customerPhone.trim()) {
      setError("Telefon numarası zorunlu.");
      return;
    }
    if (!addrLine1.trim() || !addrCity.trim() || !addrFullName.trim() || !addrPhone.trim()) {
      setError("Teslimat adresi eksik (Ad Soyad, Telefon, Adres, Şehir zorunlu).");
      return;
    }

    startSubmit(async () => {
      const fd = new FormData();
      if (foundCustomer) fd.set("customerId", foundCustomer.id);
      fd.set("customerName", customerName);
      fd.set("customerPhone", customerPhone);
      fd.set("customerEmail", customerEmail);
      fd.set("customerNote", customerNote);
      fd.set("adminNote", adminNote);
      fd.set("channel", channel);
      fd.set("shippingTotal", String(shippingTotal));
      fd.set("discountTotal", String(discountTotal));
      fd.set("addrFullName", addrFullName);
      fd.set("addrPhone", addrPhone);
      fd.set("addrLine1", addrLine1);
      fd.set("addrLine2", addrLine2);
      fd.set("addrDistrict", addrDistrict);
      fd.set("addrCity", addrCity);
      fd.set("addrCountry", addrCountry);
      fd.set("itemsJson", JSON.stringify(items));

      try {
        await createDraftOrder(fd);
      } catch (err: unknown) {
        // Re-throw Next.js redirect errors so the router handles navigation
        if (
          err &&
          typeof err === "object" &&
          "digest" in err &&
          typeof (err as { digest?: string }).digest === "string" &&
          (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
        ) {
          throw err;
        }
        setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      }
    });
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Customer ── */}
      <Card>
        <CardContent>
          <h2 className="font-display text-lg text-ink-700 mb-4">Müşteri</h2>

          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Telefon ile ara (örn. 05xx...)"
              value={phoneQuery}
              onChange={(e) => setPhoneQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomerSearch()}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleCustomerSearch}
              disabled={customerSearching}
            >
              <Search className="h-4 w-4 mr-1" />
              {customerSearching ? "Aranıyor…" : "Müşteri Ara"}
            </Button>
          </div>

          {customerLookupDone && !foundCustomer && (
            <p className="text-sm text-amber-600 mb-4">
              Kayıtlı müşteri bulunamadı. Manuel bilgi girin.
            </p>
          )}

          {foundCustomer && (
            <div className="mb-4 p-3 bg-emerald-50 rounded text-sm">
              <p className="font-medium text-emerald-700">
                Müşteri bulundu: {foundCustomer.name}
              </p>
              {foundCustomer.addresses.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-ink-400 uppercase tracking-wide mb-1">
                    Kayıtlı Adresler
                  </p>
                  {foundCustomer.addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => applyAddress(addr)}
                      className="block text-left text-xs text-emerald-700 hover:underline"
                    >
                      {addr.fullName} — {addr.line1}, {addr.city} (Seç)
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Ad Soyad *</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ad Soyad"
              />
            </div>
            <div>
              <Label>Telefon *</Label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0555 000 00 00"
              />
            </div>
            <div>
              <Label>E-posta</Label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="ornek@mail.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Products ── */}
      <Card>
        <CardContent>
          <h2 className="font-display text-lg text-ink-700 mb-4">Ürünler</h2>

          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Ürün adı veya SKU ile ara…"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleProductSearch()}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleProductSearch}
              disabled={productSearching}
            >
              <Search className="h-4 w-4 mr-1" />
              {productSearching ? "Aranıyor…" : "Ara"}
            </Button>
          </div>

          {productResults.length > 0 && (
            <ul className="mb-4 divide-y divide-cream-100 border border-cream-100 rounded-md overflow-hidden">
              {productResults.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 text-sm hover:bg-cream-50"
                >
                  <span className="text-ink-700">
                    {p.name}
                    {p.sku ? (
                      <span className="ml-2 text-xs text-ink-300">SKU: {p.sku}</span>
                    ) : null}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-ink-500 font-medium">{fmt(p.price)}</span>
                    <button
                      type="button"
                      onClick={() => addItem(p)}
                      className="text-xs bg-ink-700 text-white px-2 py-1 rounded hover:bg-ink-800"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {items.length === 0 ? (
            <p className="text-sm text-ink-300 text-center py-6">
              Henüz ürün eklenmedi. Yukarıdan arama yapın veya manuel ekleyin.
            </p>
          ) : (
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-300 border-b border-cream-100">
                  <th className="pb-2">Ürün</th>
                  <th className="pb-2 w-24">Adet</th>
                  <th className="pb-2 w-28">Birim Fiyat</th>
                  <th className="pb-2 w-24 text-right">Toplam</th>
                  <th className="pb-2 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-50">
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2">
                      <div className="font-medium text-ink-700">{it.name}</div>
                      {it.sku ? (
                        <div className="text-xs text-ink-300">SKU: {it.sku}</div>
                      ) : null}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateItem(idx, {
                              quantity: Math.max(1, it.quantity - 1),
                            })
                          }
                          className="text-ink-400 hover:text-ink-700"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) =>
                            updateItem(idx, {
                              quantity: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="w-12 h-7 text-center border border-cream-200 rounded text-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateItem(idx, { quantity: it.quantity + 1 })
                          }
                          className="text-ink-400 hover:text-ink-700"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={it.unitPrice}
                        onChange={(e) =>
                          updateItem(idx, {
                            unitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24 h-7 border border-cream-200 rounded text-sm px-2"
                      />
                    </td>
                    <td className="py-2 text-right font-medium">
                      {fmt(it.unitPrice * it.quantity)}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-rose-400 hover:text-rose-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Add custom item */}
          <details className="mt-2">
            <summary className="text-xs text-ink-400 cursor-pointer hover:text-ink-600 select-none">
              Manuel ürün ekle (katalogda olmayan)
            </summary>
            <ManualItemForm onAdd={(item) => setItems((prev) => [...prev, item])} />
          </details>
        </CardContent>
      </Card>

      {/* ── Address ── */}
      <Card>
        <CardContent>
          <h2 className="font-display text-lg text-ink-700 mb-4">Teslimat Adresi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Ad Soyad *</Label>
              <Input value={addrFullName} onChange={(e) => setAddrFullName(e.target.value)} />
            </div>
            <div>
              <Label>Telefon *</Label>
              <Input value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Adres Satırı 1 *</Label>
              <Input value={addrLine1} onChange={(e) => setAddrLine1(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Adres Satırı 2</Label>
              <Input value={addrLine2} onChange={(e) => setAddrLine2(e.target.value)} />
            </div>
            <div>
              <Label>İlçe</Label>
              <Input value={addrDistrict} onChange={(e) => setAddrDistrict(e.target.value)} />
            </div>
            <div>
              <Label>Şehir *</Label>
              <Input value={addrCity} onChange={(e) => setAddrCity(e.target.value)} />
            </div>
            <div>
              <Label>Ülke</Label>
              <Input value={addrCountry} onChange={(e) => setAddrCountry(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Notes ── */}
      <Card>
        <CardContent>
          <h2 className="font-display text-lg text-ink-700 mb-4">Notlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Müşteri Notu</Label>
              <Textarea
                rows={3}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Müşterinin sipariş notu…"
              />
            </div>
            <div>
              <Label>Yönetim Notu</Label>
              <Textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="İç not…"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Totals + Channel ── */}
      <Card>
        <CardContent>
          <h2 className="font-display text-lg text-ink-700 mb-4">Toplam & Kanal</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Kargo Ücreti (₺)</Label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={shippingTotal}
                onChange={(e) => setShippingTotal(parseFloat(e.target.value) || 0)}
                className="flex h-10 w-full rounded-md border border-cream-200 bg-white px-3 text-sm"
              />
            </div>
            <div>
              <Label>İndirim (₺)</Label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={discountTotal}
                onChange={(e) => setDiscountTotal(parseFloat(e.target.value) || 0)}
                className="flex h-10 w-full rounded-md border border-cream-200 bg-white px-3 text-sm"
              />
            </div>
            <div>
              <Label>Kanal</Label>
              <select
                value={channel}
                onChange={(e) =>
                  setChannel(e.target.value as "WHATSAPP" | "MANUAL" | "IYZICO")
                }
                className="flex h-10 w-full rounded-md border border-cream-200 bg-white px-3 text-sm"
              >
                <option value="MANUAL">Manuel</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="IYZICO">Iyzico</option>
              </select>
            </div>
          </div>

          <div className="border-t border-cream-100 pt-4 space-y-1 text-sm max-w-xs ml-auto">
            <div className="flex justify-between text-ink-500">
              <span>Ara Toplam</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-500">
              <span>Kargo</span>
              <span>{fmt(shippingTotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>İndirim</span>
                <span>− {fmt(discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-ink-800 pt-2 border-t border-cream-100">
              <span>Genel Toplam</span>
              <span>{fmt(grandTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/siparisler/taslaklar")}
          disabled={submitting}
        >
          İptal
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Oluşturuluyor…" : "Sipariş Oluştur"}
        </Button>
      </div>
    </div>
  );
}

// ─── Manual item sub-form ─────────────────────────────────────────────────────

function ManualItemForm({ onAdd }: { onAdd: (item: LineItem) => void }) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);

  function handleAdd() {
    if (!name.trim() || price <= 0) return;
    onAdd({ name: name.trim(), sku, quantity: qty, unitPrice: price });
    setName("");
    setSku("");
    setQty(1);
    setPrice(0);
  }

  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
      <div className="sm:col-span-2">
        <Label className="text-xs">Ürün Adı *</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ürün adı"
          className="h-8 text-sm"
        />
      </div>
      <div>
        <Label className="text-xs">SKU</Label>
        <Input
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="SKU"
          className="h-8 text-sm"
        />
      </div>
      <div>
        <Label className="text-xs">Adet</Label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
          className="flex h-8 w-full rounded-md border border-cream-200 bg-white px-3 text-sm"
        />
      </div>
      <div>
        <Label className="text-xs">Birim Fiyat (₺) *</Label>
        <input
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
          className="flex h-8 w-full rounded-md border border-cream-200 bg-white px-3 text-sm"
        />
      </div>
      <div>
        <Button
          type="button"
          onClick={handleAdd}
          className="h-8 text-xs"
          disabled={!name.trim() || price <= 0}
        >
          <Plus className="h-3 w-3 mr-1" />
          Ekle
        </Button>
      </div>
    </div>
  );
}
