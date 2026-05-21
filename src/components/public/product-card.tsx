import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { WishlistButton } from "@/components/public/wishlist-button";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  price: string;
  compareAtPrice?: string | null;
  image?: string | null;
  category?: string | null;
}

export function ProductCard({
  product,
  isFav = false,
}: {
  product: ProductCardData;
  isFav?: boolean;
}) {
  const onSale =
    product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);
  return (
    <Link
      href={`/urunler/${product.slug}`}
      className="group block product-card"
    >
      <div
        className="relative aspect-square card-img-placeholder rounded-[var(--kt-card-radius,8px)] overflow-hidden mb-3"
        style={{ borderRadius: "var(--kt-card-radius, 8px)" }}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="kt-img-placeholder w-full h-full" />
        )}
        {onSale ? (
          <span
            className="sale-badge absolute top-3 left-3 bg-rose-500 text-xs px-2 py-1 kt-btn"
            style={{ color: "var(--kt-btn-text, #fff)" }}
          >
            İndirim
          </span>
        ) : null}
        {/* In-stock dot - small colored indicator */}
        <span
          className="absolute bottom-2 right-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--kt-accent, #6b9080)", opacity: 0.8 }}
          title="Stokta"
        />
        <WishlistButton
          productId={product.id}
          initialIsFav={isFav}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
        />
      </div>
      <div className="space-y-1">
        {product.category ? (
          <p
            className="product-card-label text-xs uppercase tracking-wider"
            style={{ color: "var(--kt-muted, #6b6459)" }}
          >
            {product.category}
          </p>
        ) : null}
        <h3
          className="product-card-name text-sm transition leading-snug"
          style={{
            color: "var(--kt-heading, #2b2419)",
          }}
        >
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span
            className="text-base font-medium"
            style={{ color: "var(--kt-heading, #2b2419)" }}
          >
            {formatPrice(product.price)}
          </span>
          {onSale ? (
            <span
              className="text-xs line-through"
              style={{ color: "var(--kt-muted, #6b6459)" }}
            >
              {formatPrice(product.compareAtPrice!)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
