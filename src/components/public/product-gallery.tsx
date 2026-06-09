"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  url: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
  galleryLayout: "thumbnails" | "stacked" | string;
}

export function ProductGallery({ images, productName, galleryLayout }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) {
    return (
      <div
        className="relative aspect-square rounded-lg overflow-hidden kt-img-placeholder"
        style={{ borderRadius: "var(--kt-card-radius, 8px)" }}
      />
    );
  }

  const goTo = (index: number) => {
    const count = images.length;
    setActive(((index % count) + count) % count);
  };

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      goTo(deltaX < 0 ? active + 1 : active - 1);
    }
    touchStartX.current = null;
  }

  const activeImage = images[active] ?? images[0];

  // "stacked" layout: show every image stacked vertically (no thumbnails)
  if (galleryLayout === "stacked") {
    return (
      <div>
        <div
          className="relative aspect-square rounded-lg overflow-hidden mb-3 kt-img-placeholder"
          style={{ borderRadius: "var(--kt-card-radius, 8px)" }}
        >
          <Image
            src={images[0].url}
            alt={productName}
            fill
            priority
            sizes="(min-width:768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        {images.length > 1 ? (
          <div className="flex flex-col gap-3">
            {images.slice(1).map((img) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-lg overflow-hidden"
                style={{ backgroundColor: "var(--kt-card-img-bg)" }}
              >
                <Image src={img.url} alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  // default / "thumbnails": one large image + clickable thumbnails, swipeable on touch
  return (
    <div>
      <div
        className="relative aspect-square rounded-lg overflow-hidden mb-3 kt-img-placeholder select-none"
        style={{ borderRadius: "var(--kt-card-radius, 8px)" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={activeImage.url}
          alt={productName}
          fill
          priority
          sizes="(min-width:768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Görsel ${i + 1}`}
              aria-current={i === active}
              className="relative aspect-square rounded overflow-hidden transition"
              style={{
                backgroundColor: "var(--kt-card-img-bg)",
                outline: i === active ? "2px solid var(--kt-primary)" : "none",
                outlineOffset: "-2px",
                opacity: i === active ? 1 : 0.7,
              }}
            >
              <Image src={img.url} alt="" fill sizes="100px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
