import { getSettings } from "@/lib/settings";
import { saveSettingsForm } from "@/server/actions/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

const KEYS = ["email.fromName", "email.fromAddress", "email.replyTo"];

export default async function EmailSettingsPage() {
  const s = await getSettings(KEYS);

  return (
    <SettingsForm action={saveSettingsForm}>
      <Card>
        <CardContent className="space-y-4">
          <h3 className="font-display text-lg text-ink-700">E-posta (Resend)</h3>
          <p className="text-sm text-ink-500">
            Sipariş bildirimleri Resend HTTPS API üzerinden gönderilir. API key
            <code className="bg-cream-100 px-1 mx-1">RESEND_API_KEY</code>
            ortam değişkeninden alınır (sunucu yönetimi).
          </p>

          <div>
            <Label htmlFor="email.fromName">Gönderen Adı</Label>
            <Input id="email.fromName" name="email.fromName" defaultValue={String(s["email.fromName"] ?? "")} />
          </div>
          <div>
            <Label htmlFor="email.fromAddress">Gönderen Adresi</Label>
            <Input
              id="email.fromAddress"
              name="email.fromAddress"
              type="email"
              defaultValue={String(s["email.fromAddress"] ?? "")}
              placeholder="siparis@kiraztasarim.com"
            />
            <p className="text-xs text-ink-300 mt-1">
              Bu adresin domain'inin Resend'de doğrulanmış olması gerekir.
            </p>
          </div>
          <div>
            <Label htmlFor="email.replyTo">Reply-To</Label>
            <Input
              id="email.replyTo"
              name="email.replyTo"
              type="email"
              defaultValue={String(s["email.replyTo"] ?? "")}
              placeholder="info@kiraztasarim.com"
            />
          </div>
        </CardContent>
      </Card>
    </SettingsForm>
  );
}
