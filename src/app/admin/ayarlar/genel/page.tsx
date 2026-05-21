import { getSettings } from "@/lib/settings";
import { saveSettingsForm } from "@/server/actions/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SettingsForm } from "@/components/admin/settings-form";
import { MediaInput } from "@/components/admin/media-input";

export const dynamic = "force-dynamic";

const KEYS = [
  "site.name",
  "site.tagline",
  "site.description",
  "site.logo",
  "site.favicon",
  "site.contact.phone",
  "site.contact.email",
  "site.contact.address",
  "site.social.instagram",
  "site.social.facebook",
  "site.social.tiktok",
  "site.workingHours",
];

export default async function GeneralSettingsPage() {
  const s = await getSettings(KEYS);

  return (
    <SettingsForm action={saveSettingsForm}>
      <Card>
        <CardContent className="space-y-4">
          <h3 className="font-display text-lg text-ink-700">Site</h3>
          <div>
            <Label htmlFor="site.name">Site Adı</Label>
            <Input id="site.name" name="site.name" defaultValue={String(s["site.name"] ?? "")} />
          </div>
          <div>
            <Label htmlFor="site.tagline">Slogan</Label>
            <Input id="site.tagline" name="site.tagline" defaultValue={String(s["site.tagline"] ?? "")} />
          </div>
          <div>
            <Label htmlFor="site.description">Site Açıklaması</Label>
            <Textarea
              id="site.description"
              name="site.description"
              rows={2}
              defaultValue={String(s["site.description"] ?? "")}
            />
          </div>
          <div>
            <Label>Logo</Label>
            <MediaInput name="site.logo" defaultValue={String(s["site.logo"] ?? "")} folder="logo" />
          </div>
          <div>
            <Label>Favicon</Label>
            <MediaInput name="site.favicon" defaultValue={String(s["site.favicon"] ?? "")} folder="logo" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h3 className="font-display text-lg text-ink-700">İletişim</h3>
          <div>
            <Label htmlFor="site.contact.phone">Telefon</Label>
            <Input id="site.contact.phone" name="site.contact.phone" defaultValue={String(s["site.contact.phone"] ?? "")} />
          </div>
          <div>
            <Label htmlFor="site.contact.email">E-posta</Label>
            <Input id="site.contact.email" name="site.contact.email" type="email" defaultValue={String(s["site.contact.email"] ?? "")} />
          </div>
          <div>
            <Label htmlFor="site.contact.address">Adres</Label>
            <Textarea id="site.contact.address" name="site.contact.address" rows={2} defaultValue={String(s["site.contact.address"] ?? "")} />
          </div>
          <div>
            <Label htmlFor="site.workingHours">Çalışma Saatleri</Label>
            <Input id="site.workingHours" name="site.workingHours" defaultValue={String(s["site.workingHours"] ?? "")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h3 className="font-display text-lg text-ink-700">Sosyal Medya</h3>
          <div>
            <Label htmlFor="site.social.instagram">Instagram URL</Label>
            <Input id="site.social.instagram" name="site.social.instagram" defaultValue={String(s["site.social.instagram"] ?? "")} />
          </div>
          <div>
            <Label htmlFor="site.social.facebook">Facebook URL</Label>
            <Input id="site.social.facebook" name="site.social.facebook" defaultValue={String(s["site.social.facebook"] ?? "")} />
          </div>
          <div>
            <Label htmlFor="site.social.tiktok">TikTok URL</Label>
            <Input id="site.social.tiktok" name="site.social.tiktok" defaultValue={String(s["site.social.tiktok"] ?? "")} />
          </div>
        </CardContent>
      </Card>
    </SettingsForm>
  );
}
