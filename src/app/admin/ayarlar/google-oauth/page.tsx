import { getSettings } from "@/lib/settings";
import { saveSettingsForm } from "@/server/actions/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

const KEYS = ["google_oauth_client_id", "google_oauth_client_secret"];

export default async function GoogleOAuthSettingsPage() {
  const s = await getSettings(KEYS);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "https://yourdomain.com";

  return (
    <SettingsForm action={saveSettingsForm}>
      <Card>
        <CardContent className="space-y-4">
          <h3 className="font-display text-lg text-ink-700">Google OAuth</h3>
          <p className="text-sm text-ink-500">
            Google Cloud Console&apos;dan OAuth 2.0 istemci kimlik bilgilerini girin. Yetkilendirilmiş yönlendirme
            URI&apos;si:{" "}
            <code className="bg-cream-100 px-1 rounded text-xs">
              {siteUrl}/api/auth/google/callback
            </code>
          </p>

          <div>
            <Label htmlFor="google_oauth_client_id">Client ID</Label>
            <Input
              id="google_oauth_client_id"
              name="google_oauth_client_id"
              defaultValue={String(s["google_oauth_client_id"] ?? "")}
              placeholder="xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
            />
          </div>

          <div>
            <Label htmlFor="google_oauth_client_secret">Client Secret</Label>
            <input type="hidden" name="_secret.google_oauth_client_secret" value="1" />
            <Input
              id="google_oauth_client_secret"
              name="google_oauth_client_secret"
              type="password"
              autoComplete="new-password"
              defaultValue={String(s["google_oauth_client_secret"] ?? "")}
              placeholder="GOCSPX-..."
            />
          </div>

          <p className="text-xs text-ink-300">
            Client Secret veritabanında AES-256-GCM ile şifrelenerek saklanır.
          </p>
        </CardContent>
      </Card>
    </SettingsForm>
  );
}
