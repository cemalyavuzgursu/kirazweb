import { getSettings } from "@/lib/settings";
import { saveSettingsForm } from "@/server/actions/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

const SENDER_KEYS = [
  "notification.sender_name",
  "notification.sender_email",
  "notification.reply_to",
] as const;

const CUSTOMER_TOGGLES = [
  { key: "notif.order_confirm", label: "Sipariş Onayı", description: "Sipariş alındığında müşteriye gönderilir", defaultVal: true },
  { key: "notif.payment_confirm", label: "Ödeme Onayı", description: "Ödeme başarıyla tamamlandığında", defaultVal: true },
  { key: "notif.shipment", label: "Kargo Bildirimi", description: "Sipariş kargoya verildiğinde", defaultVal: true },
  { key: "notif.delivery", label: "Teslimat Bildirimi", description: "Sipariş teslim edildiğinde", defaultVal: false },
  { key: "notif.cancel", label: "Sipariş İptali", description: "Sipariş iptal edildiğinde", defaultVal: true },
  {
    key: "notif.password_reset",
    label: "Şifre Sıfırlama",
    description: "Müşteri şifre sıfırladığında (zorunlu, devre dışı bırakılamaz)",
    defaultVal: true,
    disabled: true,
  },
  { key: "notif.welcome", label: "Hoş Geldiniz", description: "Yeni hesap oluşturulduğunda", defaultVal: false },
] as const;

const STAFF_TOGGLES = [
  { key: "notif.staff_new_order", label: "Yeni Sipariş bildirimi", defaultVal: true },
  { key: "notif.staff_out_of_stock", label: "Stok tükendi bildirimi", defaultVal: true },
  { key: "notif.staff_new_customer", label: "Yeni müşteri kaydı", defaultVal: false },
] as const;

const ALL_BOOL_KEYS = [
  ...CUSTOMER_TOGGLES.map((t) => t.key),
  ...STAFF_TOGGLES.map((t) => t.key),
];

const ALL_KEYS = [...SENDER_KEYS, ...ALL_BOOL_KEYS, "notif.staff_email"] as string[];

export default async function BildirimlerPage() {
  const s = await getSettings(ALL_KEYS);

  function boolVal(key: string, defaultVal: boolean): boolean {
    const v = s[key];
    if (v === null || v === undefined) return defaultVal;
    if (typeof v === "boolean") return v;
    if (typeof v === "string") return v === "true" || v === "1";
    return Boolean(v);
  }

  return (
    <SettingsForm action={saveSettingsForm}>
      {ALL_BOOL_KEYS.map((k) => (
        <input key={k} type="hidden" name={`_bool.${k}`} value="1" />
      ))}

      <Card>
        <CardContent className="space-y-4">
          <h3 className="font-display text-lg text-ink-700">Gönderen E-posta Ayarları</h3>
          <p className="text-sm text-ink-500">
            E-posta gönderimi için SMTP ayarlarını E-posta sekmesinden yapılandırın.
          </p>
          <div>
            <Label htmlFor="notification.sender_name">Gönderen Adı</Label>
            <Input
              id="notification.sender_name"
              name="notification.sender_name"
              defaultValue={String(s["notification.sender_name"] ?? "")}
            />
          </div>
          <div>
            <Label htmlFor="notification.sender_email">Gönderen E-posta</Label>
            <Input
              id="notification.sender_email"
              name="notification.sender_email"
              type="email"
              defaultValue={String(s["notification.sender_email"] ?? "")}
            />
          </div>
          <div>
            <Label htmlFor="notification.reply_to">Yanıt E-posta</Label>
            <Input
              id="notification.reply_to"
              name="notification.reply_to"
              type="email"
              defaultValue={String(s["notification.reply_to"] ?? "")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-0">
          <h3 className="font-display text-lg text-ink-700 pb-3">Müşteri Bildirimleri</h3>
          {CUSTOMER_TOGGLES.map((toggle) => (
            <label
              key={toggle.key}
              className="flex items-center justify-between py-3 border-b border-cream-100 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-ink-700">{toggle.label}</p>
                <p className="text-xs text-ink-500">{toggle.description}</p>
              </div>
              <input
                type="checkbox"
                name={toggle.key}
                defaultChecked={boolVal(toggle.key, toggle.defaultVal)}
                disabled={"disabled" in toggle ? toggle.disabled : false}
                className="h-4 w-4 rounded border-cream-300 text-rose-500 focus:ring-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-0">
          <h3 className="font-display text-lg text-ink-700 pb-3">Personel Bildirimleri</h3>
          <div className="pb-4 border-b border-cream-100">
            <Label htmlFor="notif.staff_email">Personel Bildirim E-postası</Label>
            <Input
              id="notif.staff_email"
              name="notif.staff_email"
              type="email"
              defaultValue={String(s["notif.staff_email"] ?? "")}
              placeholder="admin@magazaadi.com"
            />
          </div>
          {STAFF_TOGGLES.map((toggle) => (
            <label
              key={toggle.key}
              className="flex items-center justify-between py-3 border-b border-cream-100 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-ink-700">{toggle.label}</p>
              </div>
              <input
                type="checkbox"
                name={toggle.key}
                defaultChecked={boolVal(toggle.key, toggle.defaultVal)}
                className="h-4 w-4 rounded border-cream-300 text-rose-500 focus:ring-rose-400"
              />
            </label>
          ))}
        </CardContent>
      </Card>
    </SettingsForm>
  );
}
