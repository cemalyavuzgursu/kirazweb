import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { getSettings } from "@/lib/settings";
import { saveSettingsForm } from "@/server/actions/settings";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SettingsForm } from "@/components/admin/settings-form";
import { MediaInput } from "@/components/admin/media-input";

export const dynamic = "force-dynamic";

const KEYS = [
  "store.name",
  "store.description",
  "store.logo",
  "store.favicon",
  "store.instagram",
  "store.facebook",
  "store.twitter",
];

export default async function OnlineMagazaTercihlerPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/online-magaza/tercihler";
  const s = await getSettings(KEYS);

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title="Online Mağaza Tercihleri" description="Mağaza kimliği ve sosyal medya bağlantıları" />

      <SettingsForm action={saveSettingsForm}>
        <Card>
          <CardContent className="space-y-4">
            <h3 className="font-display text-lg text-ink-700">Mağaza Kimliği</h3>
            <div>
              <Label htmlFor="store.name">Mağaza Adı</Label>
              <Input
                id="store.name"
                name="store.name"
                defaultValue={String(s["store.name"] ?? "Kiraz Tasarım")}
              />
            </div>
            <div>
              <Label htmlFor="store.description">Mağaza Açıklaması</Label>
              <Textarea
                id="store.description"
                name="store.description"
                rows={3}
                defaultValue={String(s["store.description"] ?? "")}
              />
            </div>
            <div>
              <Label>Logo</Label>
              <MediaInput
                name="store.logo"
                defaultValue={String(s["store.logo"] ?? "")}
                folder="logo"
              />
            </div>
            <div>
              <Label>Favicon</Label>
              <MediaInput
                name="store.favicon"
                defaultValue={String(s["store.favicon"] ?? "")}
                folder="logo"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <h3 className="font-display text-lg text-ink-700">Sosyal Medya Bağlantıları</h3>
            <div>
              <Label htmlFor="store.instagram">Instagram URL</Label>
              <Input
                id="store.instagram"
                name="store.instagram"
                defaultValue={String(s["store.instagram"] ?? "")}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <Label htmlFor="store.facebook">Facebook URL</Label>
              <Input
                id="store.facebook"
                name="store.facebook"
                defaultValue={String(s["store.facebook"] ?? "")}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <Label htmlFor="store.twitter">Twitter/X URL</Label>
              <Input
                id="store.twitter"
                name="store.twitter"
                defaultValue={String(s["store.twitter"] ?? "")}
                placeholder="https://x.com/..."
              />
            </div>
          </CardContent>
        </Card>
      </SettingsForm>
    </AdminShell>
  );
}
