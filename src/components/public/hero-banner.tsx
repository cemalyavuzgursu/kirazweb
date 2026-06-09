"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  mobileImage?: string | null;
  link?: string | null;
  ctaText?: string | null;
}

export function HeroBanner({ slides }: { slides: BannerSlide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden">
      {/* Height is driven directly (not via aspect-ratio) so that capping it with
          max-height never shrinks the width — keeps the banner full-bleed and the
          image object-cover always fills it. 56.25vw = 16/9, 41.6667vw = 2.4/1. */}
      <div className="relative w-full h-[56.25vw] sm:h-[41.6667vw] max-h-[640px]">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover hidden sm:block"
            />
            {slide.mobileImage ? (
              <Image
                src={slide.mobileImage}
                alt={slide.title}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover sm:hidden"
              />
            ) : (
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover sm:hidden"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/40 via-ink-900/10 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl text-white">
                  <h1 className="font-display text-3xl sm:text-5xl mb-3 text-balance drop-shadow-md">
                    {slide.title}
                  </h1>
                  {slide.subtitle ? (
                    <p className="text-lg mb-6 text-pretty drop-shadow" style={{ color: "var(--kt-muted)" }}>
                      {slide.subtitle}
                    </p>
                  ) : null}
                  {slide.link && slide.ctaText ? (
                    <Link
                      href={slide.link}
                      className="inline-block px-6 py-3 rounded-md font-medium transition"
                      style={{ backgroundColor: "var(--kt-surface)", color: "var(--kt-heading)" }}
                    >
                      {slide.ctaText}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 ? (
        <>
          <button
            onClick={() => setActive((a) => (a - 1 + slides.length) % slides.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full shadow"
            style={{ backgroundColor: "var(--kt-surface)", color: "var(--kt-heading)" }}
            aria-label="Önceki"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActive((a) => (a + 1) % slides.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full shadow"
            style={{ backgroundColor: "var(--kt-surface)", color: "var(--kt-heading)" }}
            aria-label="Sonraki"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${i === active ? "w-8 bg-white" : "w-2 bg-white/60"}`}
                aria-label={`${i + 1}. slayt`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
