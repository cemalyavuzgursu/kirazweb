import { CheckoutForm } from "@/components/public/checkout-form";
import { getSettings } from "@/lib/settings";
import { getCustomerSession } from "@/lib/customer-session";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({ title: "Ödeme", noindex: true, path: "/odeme" });
}

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [s, session] = await Promise.all([
    getSettings([
      "payment.iyzico.enabled",
      "whatsapp.enabled",
      "whatsapp.number",
      "shipping.flatRate",
      "shipping.freeThreshold",
      "checkout_contact_method",
      "checkout_require_login",
      "checkout_show_company",
      "checkout_show_address2",
      "checkout_show_shipping_phone",
      "checkout_show_tc_no",
      "checkout_tc_no_required",
    ]),
    getCustomerSession(),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl mb-8" style={{ color: "var(--kt-heading)" }}>Sipariş Bilgileri</h1>
      <CheckoutForm
        iyzicoEnabled={Boolean(s["payment.iyzico.enabled"])}
        whatsappEnabled={Boolean(s["whatsapp.enabled"]) && Boolean(s["whatsapp.number"])}
        flatRate={Number(s["shipping.flatRate"] ?? 0)}
        freeThreshold={Number(s["shipping.freeThreshold"] ?? 0)}
        contactMethod={(s["checkout_contact_method"] as string) || "email"}
        requireLogin={Boolean(s["checkout_require_login"] ?? false)}
        isLoggedIn={Boolean(session)}
        showCompany={Boolean(s["checkout_show_company"] ?? false)}
        showAddress2={Boolean(s["checkout_show_address2"] ?? true)}
        showShippingPhone={Boolean(s["checkout_show_shipping_phone"] ?? true)}
        showTcNo={Boolean(s["checkout_show_tc_no"] ?? false)}
        tcNoRequired={Boolean(s["checkout_tc_no_required"] ?? false)}
      />
    </div>
  );
}
