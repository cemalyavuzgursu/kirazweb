import { Heart } from "lucide-react";
import Link from "next/link";
import { requireCustomer } from "@/lib/customer-session";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/public/product-card";
import { RemoveFromWishlistButton } from "./remove-button";

export const dynamic = "force-dynamic";

export default async function FavorilerPage() {
  const session = await requireCustomer();

  const wishlistItems = await prisma.wishlist.findMany({
    where: { customerId: session.customerId },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const products = wishlistItems.map((item) => ({
    id: item.product.id,
    slug: item.product.slug,
    name: item.product.name,
    shortDescription: item.product.shortDescription,
    price: item.product.price.toString(),
    compareAtPrice: item.product.compareAtPrice?.toString() ?? null,
    image: item.product.images[0]?.url ?? null,
    category: item.product.category?.name ?? null,
  }));

  if (products.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl mb-6" style={{ color: "var(--kt-heading)" }}>Favorilerim</h1>
        <div className="text-center py-16 rounded-lg" style={{ border: "1px solid var(--kt-border)" }}>
          <Heart className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--kt-muted)", opacity: 0.4 }} />
          <p className="mb-4" style={{ color: "var(--kt-muted)" }}>Favoriniz bulunmuyor.</p>
          <Link href="/urunler" className="text-sm" style={{ color: "var(--kt-primary)" }}>
            Ürünleri Keşfet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl mb-6" style={{ color: "var(--kt-heading)" }}>
        Favorilerim
        <span className="ml-2 text-sm font-normal" style={{ color: "var(--kt-muted)" }}>({products.length})</span>
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="relative group/fav">
            <ProductCard product={product} isFav={true} />
            <RemoveFromWishlistButton productId={product.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
