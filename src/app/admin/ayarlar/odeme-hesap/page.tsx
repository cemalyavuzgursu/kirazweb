import { getSettings } from "@/lib/settings";
import { saveSettingsForm } from "@/server/actions/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

const KEYS = [
  "checkout_contact_method",
  "checkout_require_login",
  "checkout_name_required",
  "checkout_show_company",
  "checkout_show_address2",
  "checkout_show_shipping_phone",
  "checkout_show_tc_no",
  "checkout_tc_no_required",
  "order_prefix",
  "order_suffix",
];

const DEFAULTS: Record<string, unknown> = {
  checkout_contact_method: "email",
  checkout_require_login: false,
  checkout_name_required: true,
  checkout_show_company: false,
  checkout_show_address2: true,
  checkout_show_shipping_phone: true,
  checkout_show_tc_no: false,
  checkout_tc_no_required: false,
  order_prefix: "#",
  order_suffix: "",
};

function getBool(s: Record<string, unknown>, key: string): boolean {
  return s[key] !== null && s[key] !== undefined ? Boolean(s[key]) : Boolean(DEFAULTS[key]);
}

function getString(s: Record<string, unknown>, key: string): string {
  return s[key] !== null && s[key] !== undefined ? String(s[key]) : String(DEFAULTS[key] ?? "");
}

export default async function OdemeHesapSettingsPage() {
  const s = await getSettings(KEYS);

  const contactMethod = getString(s, "checkout_contact_method") || "email";
  const orderPrefix = getString(s, "order_prefix");
  const orderSuffix = getString(s, "order_suffix");

  return (
    <SettingsForm action={saveSettingsForm}>
      <section>
        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-display text-lg text-ink-700">Müşteri İletişim Yöntemi</h3>
              <p className="text-xs text-ink-300 mt-1">
                Ödeme sırasında müşteriden hangi iletişim bilgisi istensin?
              </p>
            </div>

            <div className="space-y-2">
              {(
                [
                  { value: "email", label: "Yalnızca e-posta" },
                  { value: "phone_or_email", label: "Telefon numarası veya e-posta" },
                  { value: "phone", label: "Yalnızca telefon" },
                ] as const
              ).map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 p-3 rounded-md border border-cream-200 cursor-pointer hover:bg-cream-50 transition">
                  <input
                    type="radio"
                    name="checkout_contact_method"
                    value={opt.value}
                    defaultChecked={contactMethod === opt.value}
                    className="h-4 w-4 border-cream-300 text-rose-500"
                  />
                  <span className="text-sm text-ink-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-display text-lg text-ink-700">Giriş Zorunluluğu</h3>
              <p className="text-xs text-ink-300 mt-1">
                Müşterilerin ödeme öncesinde hesap oluşturması veya giriş yapması zorunlu tutulsun mu?
              </p>
            </div>

            <input type="hidden" name="_bool.checkout_require_login" value="1" />
            <label className="flex items-center gap-3 p-4 rounded-md border border-cream-200 bg-cream-50 cursor-pointer">
              <input
                type="checkbox"
                name="checkout_require_login"
                defaultChecked={getBool(s, "checkout_require_login")}
                className="h-5 w-5 rounded border-cream-300 text-rose-500"
              />
              <div>
                <div className="font-medium text-ink-700">Giriş yapmayı zorunlu kıl</div>
                <div className="text-xs text-ink-300">
                  Müşterilerin ödeme yapmadan önce hesaplarına giriş yapmalarını zorunlu kılın.
                </div>
              </div>
            </label>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-display text-lg text-ink-700">Müşteri Bilgileri</h3>
              <p className="text-xs text-ink-300 mt-1">
                Ödeme adımında hangi alanlar gösterilsin veya zorunlu olsun?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  { key: "checkout_name_required", label: "Ad Soyad zorunlu" },
                  { key: "checkout_show_company", label: "Şirket Adı göster" },
                  { key: "checkout_show_address2", label: "Adres Satırı 2 göster" },
                  { key: "checkout_show_shipping_phone", label: "Kargo Adresi Telefon" },
                  { key: "checkout_show_tc_no", label: "TC Kimlik No göster" },
                  { key: "checkout_tc_no_required", label: "TC Kimlik No zorunlu" },
                ] as const
              ).map((field) => (
                <label key={field.key} className="flex items-center gap-2 text-sm p-3 rounded-md border border-cream-200 cursor-pointer hover:bg-cream-50 transition">
                  <input type="hidden" name={`_bool.${field.key}`} value="1" />
                  <input
                    type="checkbox"
                    name={field.key}
                    defaultChecked={getBool(s, field.key)}
                    className="h-4 w-4 rounded border-cream-300 text-rose-500"
                  />
                  <span className="text-ink-700">{field.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-display text-lg text-ink-700">Sipariş Numarası Formatı</h3>
              <p className="text-xs text-ink-300 mt-1">
                Sipariş numaralarının başına ve sonuna eklenecek sabit metinler.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order_prefix">Ön Ek</Label>
                <Input
                  id="order_prefix"
                  name="order_prefix"
                  defaultValue={orderPrefix}
                  placeholder="#"
                />
              </div>
              <div>
                <Label htmlFor="order_suffix">Son Ek</Label>
                <Input
                  id="order_suffix"
                  name="order_suffix"
                  defaultValue={orderSuffix}
                  placeholder="boş bırakabilirsiniz"
                />
              </div>
            </div>

            <div className="p-3 rounded-md bg-cream-50 border border-cream-200 text-sm text-ink-500">
              Sipariş numaranız{" "}
              <span className="font-medium text-ink-700">
                {orderPrefix}20251001{orderSuffix}
              </span>
              ,{" "}
              <span className="font-medium text-ink-700">
                {orderPrefix}20251002{orderSuffix}
              </span>
              ,{" "}
              <span className="font-medium text-ink-700">
                {orderPrefix}20251003{orderSuffix}
              </span>
              {" "}... şeklinde görünecek.
            </div>
          </CardContent>
        </Card>
      </section>
    </SettingsForm>
  );
}
