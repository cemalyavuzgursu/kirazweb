import { getSettings } from "@/lib/settings";
import { saveSettingsForm } from "@/server/actions/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

const KEYS = [
  "payment.iyzico.enabled",
  "payment.iyzico.sandbox",
  "payment.iyzico.force3ds",
  "payment.iyzico.apiKey",
  "payment.iyzico.secret",
  "payment.bankTransfer.enabled",
  "payment.bankTransfer.details",
];

export default async function PaymentSettingsPage() {
  const s = await getSettings(KEYS);

  return (
    <SettingsForm action={saveSettingsForm}>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-lg text-ink-700">iyzico Sanal POS</h3>
              <p className="text-xs text-ink-300 mt-1">
                Henüz sanal POS almadıysanız bu bölümü pasif bırakın. WhatsApp ile sipariş çalışmaya devam eder.
              </p>
            </div>
          </div>

          <input type="hidden" name="_bool.payment.iyzico.enabled" value="1" />
          <label className="flex items-center gap-3 p-4 rounded-md border border-cream-200 bg-cream-50 cursor-pointer">
            <input
              type="checkbox"
              name="payment.iyzico.enabled"
              defaultChecked={Boolean(s["payment.iyzico.enabled"])}
              className="h-5 w-5 rounded border-cream-300 text-rose-500"
            />
            <div>
              <div className="font-medium text-ink-700">iyzico ile ödemeyi aktif et</div>
              <div className="text-xs text-ink-300">Aktif ettiğinizde checkout sayfasında "Kredi Kartı" seçeneği görünür.</div>
            </div>
          </label>

          <input type="hidden" name="_bool.payment.iyzico.sandbox" value="1" />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="payment.iyzico.sandbox"
              defaultChecked={Boolean(s["payment.iyzico.sandbox"] ?? true)}
              className="h-4 w-4 rounded border-cream-300 text-rose-500"
            />
            Sandbox (test) modu
          </label>

          <input type="hidden" name="_bool.payment.iyzico.force3ds" value="1" />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="payment.iyzico.force3ds"
              defaultChecked={Boolean(s["payment.iyzico.force3ds"] ?? true)}
              className="h-4 w-4 rounded border-cream-300 text-rose-500"
            />
            3D Secure zorunlu
          </label>

          <div>
            <Label htmlFor="payment.iyzico.apiKey">API Key</Label>
            <input type="hidden" name="_secret.payment.iyzico.apiKey" value="1" />
            <Input
              id="payment.iyzico.apiKey"
              name="payment.iyzico.apiKey"
              type="password"
              autoComplete="new-password"
              defaultValue={String(s["payment.iyzico.apiKey"] ?? "")}
              placeholder="sandbox-... veya boş"
            />
          </div>
          <div>
            <Label htmlFor="payment.iyzico.secret">Secret Key</Label>
            <input type="hidden" name="_secret.payment.iyzico.secret" value="1" />
            <Input
              id="payment.iyzico.secret"
              name="payment.iyzico.secret"
              type="password"
              autoComplete="new-password"
              defaultValue={String(s["payment.iyzico.secret"] ?? "")}
            />
          </div>
          <p className="text-xs text-ink-300">
            API Key ve Secret veritabanında AES-256-GCM ile şifrelenerek saklanır.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h3 className="font-display text-lg text-ink-700">Banka Havalesi</h3>
          <input type="hidden" name="_bool.payment.bankTransfer.enabled" value="1" />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="payment.bankTransfer.enabled"
              defaultChecked={Boolean(s["payment.bankTransfer.enabled"])}
              className="h-4 w-4 rounded border-cream-300 text-rose-500"
            />
            Banka havalesi seçeneğini göster
          </label>
          <div>
            <Label htmlFor="payment.bankTransfer.details">Hesap Bilgileri (müşteriye gösterilecek)</Label>
            <Textarea
              id="payment.bankTransfer.details"
              name="payment.bankTransfer.details"
              rows={5}
              defaultValue={String(s["payment.bankTransfer.details"] ?? "")}
              placeholder="Banka adı, IBAN, hesap sahibi..."
            />
          </div>
        </CardContent>
      </Card>
    </SettingsForm>
  );
}
