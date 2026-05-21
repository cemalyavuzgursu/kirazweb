import { getSettings } from "@/lib/settings";
import { saveSettingsForm } from "@/server/actions/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

const KEYS = ["whatsapp.enabled", "whatsapp.number", "whatsapp.messageTemplate"];

export default async function WhatsAppSettingsPage() {
  const s = await getSettings(KEYS);

  return (
    <SettingsForm action={saveSettingsForm}>
      <Card>
        <CardContent className="space-y-4">
          <h3 className="font-display text-lg text-ink-700">WhatsApp ile Sipariş</h3>

          <input type="hidden" name="_bool.whatsapp.enabled" value="1" />
          <label className="flex items-center gap-3 p-4 rounded-md border border-cream-200 bg-cream-50 cursor-pointer">
            <input
              type="checkbox"
              name="whatsapp.enabled"
              defaultChecked={Boolean(s["whatsapp.enabled"] ?? true)}
              className="h-5 w-5 rounded border-cream-300 text-rose-500"
            />
            <div>
              <div className="font-medium text-ink-700">WhatsApp ile sipariş aktif</div>
              <div className="text-xs text-ink-300">
                Müşteri checkout'ta "WhatsApp ile Tamamla" butonuyla siparişini iletebilir.
              </div>
            </div>
          </label>

          <div>
            <Label htmlFor="whatsapp.number">WhatsApp Numarası</Label>
            <Input
              id="whatsapp.number"
              name="whatsapp.number"
              defaultValue={String(s["whatsapp.number"] ?? "")}
              placeholder="905555555555 (başında + olmadan, ülke kodu dahil)"
            />
            <p className="text-xs text-ink-300 mt-1">
              Örnek: <code>905XXXXXXXXX</code>. Boşluk veya tire kullanmayın.
            </p>
          </div>

          <div>
            <Label htmlFor="whatsapp.messageTemplate">Mesaj Şablonu</Label>
            <Textarea
              id="whatsapp.messageTemplate"
              name="whatsapp.messageTemplate"
              rows={10}
              defaultValue={String(s["whatsapp.messageTemplate"] ?? "")}
            />
            <div className="text-xs text-ink-300 mt-2 space-y-1">
              <p>Kullanılabilecek değişkenler:</p>
              <ul className="grid grid-cols-2 gap-1 mt-1">
                <li><code>{"{ITEMS}"}</code> — ürün listesi</li>
                <li><code>{"{TOTAL}"}</code> — toplam tutar</li>
                <li><code>{"{ORDER_NUMBER}"}</code> — sipariş no</li>
                <li><code>{"{NAME}"}</code> — müşteri adı</li>
                <li><code>{"{PHONE}"}</code> — müşteri telefonu</li>
                <li><code>{"{ADDRESS}"}</code> — teslimat adresi</li>
                <li><code>{"{TRACK_URL}"}</code> — sipariş takip linki</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </SettingsForm>
  );
}
