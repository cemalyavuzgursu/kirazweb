import { getSettings } from "@/lib/settings";
import { saveSettingsForm } from "@/server/actions/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

const KEYS = ["kdv_enabled", "kdv_rate"];

export default async function VergiSettingsPage() {
  const s = await getSettings(KEYS);

  return (
    <SettingsForm action={saveSettingsForm}>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-lg text-ink-700">KDV Ayarları</h3>
              <p className="text-xs text-ink-300 mt-1">
                Ürünlere girilen fiyatlar KDV dahil fiyatlardır. KDV tutarı bu oran üzerinden hesaplanır.
              </p>
            </div>
          </div>

          <input type="hidden" name="_bool.kdv_enabled" value="1" />
          <label className="flex items-center gap-3 p-4 rounded-md border border-cream-200 bg-cream-50 cursor-pointer">
            <input
              type="checkbox"
              name="kdv_enabled"
              defaultChecked={Boolean(s["kdv_enabled"])}
              className="h-5 w-5 rounded border-cream-300 text-rose-500"
            />
            <div>
              <div className="font-medium text-ink-700">KDV gösterimini etkinleştir</div>
              <div className="text-xs text-ink-300">
                Aktif edildiğinde ürün sayfalarında KDV bilgisi gösterilir.
              </div>
            </div>
          </label>

          <div>
            <Label htmlFor="kdv_rate">KDV Oranı (%)</Label>
            <input type="hidden" name="_number.kdv_rate" value="1" />
            <Input
              id="kdv_rate"
              name="kdv_rate"
              type="number"
              step="1"
              min="0"
              max="100"
              defaultValue={String(s["kdv_rate"] ?? "20")}
              className="max-w-xs"
            />
            <p className="text-xs text-ink-300 mt-1">
              Türkiye&apos;de standart KDV oranı %20&apos;dir. İndirimli oranlar için ürün bazında muafiyet ayarlayabilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </SettingsForm>
  );
}
