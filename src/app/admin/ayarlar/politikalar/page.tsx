import { getSettings } from "@/lib/settings";
import { saveSettingsForm } from "@/server/actions/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

const POLICIES = [
  { key: "policy.return", label: "İade ve Para İadesi Politikası" },
  { key: "policy.privacy", label: "Gizlilik Politikası" },
  { key: "policy.terms", label: "Hizmet Şartları" },
  { key: "policy.shipping", label: "Kargo Politikası" },
  { key: "policy.contact", label: "İletişim Bilgileri" },
] as const;

const KEYS = POLICIES.map((p) => p.key);

export default async function PolitikalarPage() {
  const s = await getSettings(KEYS);

  return (
    <SettingsForm action={saveSettingsForm}>
      <p className="text-sm text-ink-500">
        Politikalar ödeme sayfasının alt kısmında ve footer&apos;da bağlantı olarak gösterilir.
      </p>
      {POLICIES.map((policy) => (
        <Card key={policy.key}>
          <CardContent className="space-y-2">
            <Label htmlFor={policy.key}>{policy.label}</Label>
            <textarea
              id={policy.key}
              name={policy.key}
              rows={8}
              defaultValue={String(s[policy.key] ?? "")}
              className="w-full rounded-md border border-cream-200 bg-white px-3 py-2 text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent resize-y"
            />
          </CardContent>
        </Card>
      ))}
    </SettingsForm>
  );
}
