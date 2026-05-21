import { getSettings } from "@/lib/settings";
import { saveSettingsForm } from "@/server/actions/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

const KEYS = ["shipping.flatRate", "shipping.freeThreshold", "shipping.carriers"];

export default async function ShippingSettingsPage() {
  const s = await getSettings(KEYS);

  return (
    <SettingsForm action={saveSettingsForm}>
      <Card>
        <CardContent className="space-y-4">
          <h3 className="font-display text-lg text-ink-700">Kargo Ayarları</h3>

          <div>
            <Label htmlFor="shipping.flatRate">Sabit Kargo Ücreti (₺)</Label>
            <input type="hidden" name="_number.shipping.flatRate" value="1" />
            <Input
              id="shipping.flatRate"
              name="shipping.flatRate"
              type="number"
              step="0.01"
              defaultValue={String(s["shipping.flatRate"] ?? "")}
            />
          </div>

          <div>
            <Label htmlFor="shipping.freeThreshold">Ücretsiz Kargo Eşiği (₺)</Label>
            <input type="hidden" name="_number.shipping.freeThreshold" value="1" />
            <Input
              id="shipping.freeThreshold"
              name="shipping.freeThreshold"
              type="number"
              step="0.01"
              defaultValue={String(s["shipping.freeThreshold"] ?? "")}
            />
            <p className="text-xs text-ink-300 mt-1">Bu tutar üzerindeki siparişlerde kargo ücretsizdir.</p>
          </div>

          <div>
            <Label htmlFor="shipping.carriers">Kargo Firmaları (virgülle)</Label>
            <input type="hidden" name="_json.shipping.carriers" value="1" />
            <Input
              id="shipping.carriers"
              name="shipping.carriers"
              defaultValue={JSON.stringify(s["shipping.carriers"] ?? [])}
              placeholder='["Yurtiçi Kargo", "Aras Kargo"]'
            />
            <p className="text-xs text-ink-300 mt-1">JSON dizi formatında girin.</p>
          </div>
        </CardContent>
      </Card>
    </SettingsForm>
  );
}
