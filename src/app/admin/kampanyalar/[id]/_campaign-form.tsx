"use client";

import { useState } from "react";
import { CampaignType } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TYPE_OPTIONS: { value: CampaignType; label: string; description: string }[] = [
  {
    value: "PERCENT_DISCOUNT",
    label: "Yüzde İndirim",
    description: "Sepet tutarına veya seçili kategoriye % indirim uygular",
  },
  {
    value: "FIXED_DISCOUNT",
    label: "Sabit İndirim (₺)",
    description: "Sepetten belirli bir tutar indirir",
  },
  {
    value: "BUY_X_GET_Y_FREE",
    label: "X Al Y Bedava",
    description: "Örn: 3 ürün alana 1 ürün bedava (en ucuz ürün)",
  },
  {
    value: "SPEND_X_GET_FREE",
    label: "X₺ Üzeri İndirim",
    description: "Belirli tutarın üzerinde alışverişe ₺ veya % indirim",
  },
  {
    value: "FREE_SHIPPING",
    label: "Ücretsiz Kargo",
    description: "Belirli tutarın üzerindeki siparişlere ücretsiz kargo",
  },
];

interface Props {
  defaultType: CampaignType;
  campaign?: {
    discountValue: string;
    minQuantity?: number;
    freeQuantity?: number;
    minSubtotal: string;
    categoryId: string;
  };
  categories: { id: string; name: string }[];
}

export function CampaignFormFields({ defaultType, campaign, categories }: Props) {
  const [type, setType] = useState<CampaignType>(defaultType);

  return (
    <Card>
      <CardContent className="space-y-5">
        <h3 className="font-display text-lg text-ink-700">Kampanya Türü</h3>

        {/* Type selector */}
        <div className="grid grid-cols-1 gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                type === opt.value
                  ? "border-rose-400 bg-rose-50"
                  : "border-cream-200 hover:border-rose-200 hover:bg-cream-50"
              }`}
            >
              <input
                type="radio"
                name="type"
                value={opt.value}
                checked={type === opt.value}
                onChange={() => setType(opt.value)}
                className="mt-0.5 h-4 w-4 accent-rose-500"
              />
              <div>
                <span className="text-sm font-medium text-ink-700">{opt.label}</span>
                <p className="text-xs text-ink-400 mt-0.5">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Dynamic fields */}
        <div className="space-y-4 pt-2 border-t border-cream-100">

          {/* Discount value — shown for PERCENT, FIXED, SPEND_X */}
          {(type === "PERCENT_DISCOUNT" || type === "FIXED_DISCOUNT" || type === "SPEND_X_GET_FREE") && (
            <div>
              <Label htmlFor="discountValue">
                {type === "PERCENT_DISCOUNT" ? "İndirim Oranı (%)" : "İndirim Tutarı (₺)"}
              </Label>
              <Input
                id="discountValue"
                name="discountValue"
                type="number"
                step={type === "PERCENT_DISCOUNT" ? "0.1" : "0.01"}
                min="0"
                max={type === "PERCENT_DISCOUNT" ? "100" : undefined}
                defaultValue={campaign?.discountValue ?? ""}
                placeholder={type === "PERCENT_DISCOUNT" ? "örn: 20" : "örn: 50.00"}
              />
            </div>
          )}

          {/* Buy X Get Y fields */}
          {type === "BUY_X_GET_Y_FREE" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minQuantity">Kaç Adet Alınmalı (X)</Label>
                <Input
                  id="minQuantity"
                  name="minQuantity"
                  type="number"
                  min="2"
                  defaultValue={campaign?.minQuantity ?? 3}
                  placeholder="3"
                />
                <p className="text-xs text-ink-300 mt-1">Tetikleyici adet</p>
              </div>
              <div>
                <Label htmlFor="freeQuantity">Kaç Adet Bedava (Y)</Label>
                <Input
                  id="freeQuantity"
                  name="freeQuantity"
                  type="number"
                  min="1"
                  defaultValue={campaign?.freeQuantity ?? 1}
                  placeholder="1"
                />
                <p className="text-xs text-ink-300 mt-1">En ucuz ürün(ler) bedava</p>
              </div>
            </div>
          )}

          {/* Minimum subtotal — shown for SPEND_X and FREE_SHIPPING */}
          {(type === "SPEND_X_GET_FREE" || type === "FREE_SHIPPING") && (
            <div>
              <Label htmlFor="minSubtotal">Minimum Sepet Tutarı (₺)</Label>
              <Input
                id="minSubtotal"
                name="minSubtotal"
                type="number"
                step="0.01"
                min="0"
                defaultValue={campaign?.minSubtotal ?? ""}
                placeholder="örn: 500.00"
              />
              {type === "FREE_SHIPPING" && (
                <p className="text-xs text-ink-300 mt-1">Boş bırakılırsa her zaman ücretsiz kargo.</p>
              )}
            </div>
          )}

          {/* Category scope */}
          {type !== "FREE_SHIPPING" && (
            <div>
              <Label htmlFor="categoryId">Kategori Kapsamı</Label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={campaign?.categoryId ?? ""}
                className="flex h-10 w-full rounded-md border border-cream-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                <option value="">Tüm sepet / Tüm ürünler</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="text-xs text-ink-300 mt-1">
                Seçilirse indirim yalnızca bu kategorideki ürünlere uygulanır.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
