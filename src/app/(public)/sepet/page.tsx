import { CartView } from "@/components/public/cart-view";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildMetadata({ title: "Sepet", noindex: true, path: "/sepet" });
}

export default function CartPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl mb-8" style={{ color: "var(--kt-heading)" }}>Sepetim</h1>
      <CartView />
    </div>
  );
}
