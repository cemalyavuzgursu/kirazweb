"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

interface SearchProduct {
  id: string;
  slug: string;
  name: string;
  price: string;
  compareAtPrice: string | null;
  image: string | null;
  category: string | null;
}

const POPULAR = ["Mum", "Çerçeve", "Vazo", "Halı", "Yastık", "Biblo"];

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const cartAdd = useCart((s) => s.add);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Debounced live search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.products ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/arama?q=${encodeURIComponent(q)}`);
      close();
    }
  }

  function handleAddToCart(p: SearchProduct) {
    cartAdd({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      unitPrice: parseFloat(p.price),
      quantity: 1,
    });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  }

  function handlePopularSearch(term: string) {
    router.push(`/arama?q=${encodeURIComponent(term)}`);
    close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2 rounded-md transition"
        style={{ color: "var(--kt-text, #161108)", opacity: 0.6 }}
        aria-label="Ara"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex flex-col" style={{ backdropFilter: "blur(2px)" }}>
          {/* Dimmed backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "color-mix(in srgb, var(--kt-bg, #000) 85%, transparent)" }}
            onClick={close}
          />

          {/* Search panel */}
          <div
            className="relative z-10 w-full shadow-2xl"
            style={{
              backgroundColor: "var(--kt-bg, #fdfaf6)",
              borderBottom: "1px solid var(--kt-border, #e2ddd6)",
            }}
          >
            {/* Input bar */}
            <div className="max-w-3xl mx-auto px-4 py-4">
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                {loading
                  ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" style={{ color: "var(--kt-muted, #6b6459)" }} />
                  : <Search className="h-5 w-5 shrink-0" style={{ color: "var(--kt-muted, #6b6459)" }} />
                }
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ne aramak istersiniz?"
                  className="flex-1 bg-transparent text-lg focus:outline-none"
                  style={{ color: "var(--kt-text, #161108)" }}
                  autoComplete="off"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} className="p-1 opacity-50 hover:opacity-100 transition" style={{ color: "var(--kt-muted)" }}>
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition"
                  style={{
                    backgroundColor: "var(--kt-primary, #c95265)",
                    color: "var(--kt-btn-text, #fff)",
                    borderRadius: "var(--kt-radius, 6px)",
                  }}
                >
                  Ara <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="p-2 rounded-md transition"
                  style={{ color: "var(--kt-muted, #6b6459)" }}
                  aria-label="Kapat"
                >
                  <X className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Live results */}
            {results.length > 0 && (
              <div className="max-w-3xl mx-auto px-4 pb-4">
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--kt-muted)" }}>
                  Sonuçlar ({results.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-2 rounded-lg transition"
                      style={{ border: "1px solid var(--kt-border, #e2ddd6)" }}
                    >
                      <Link href={`/urunler/${p.slug}`} onClick={close} className="shrink-0">
                        <div
                          className="w-14 h-14 rounded-md overflow-hidden kt-img-placeholder"
                          style={{ backgroundColor: "var(--kt-card-img-bg, #f3f0eb)" }}
                        >
                          {p.image && (
                            <Image src={p.image} alt={p.name} width={56} height={56} className="object-cover w-full h-full" />
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/urunler/${p.slug}`} onClick={close}>
                          <p className="text-sm font-medium truncate" style={{ color: "var(--kt-heading)" }}>{p.name}</p>
                        </Link>
                        <p className="text-xs mt-0.5" style={{ color: "var(--kt-muted)" }}>{formatPrice(p.price)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(p)}
                        className="shrink-0 p-2 rounded-md transition"
                        style={{
                          backgroundColor: added === p.id ? "var(--kt-accent, #b8924f)" : "var(--kt-primary, #c95265)",
                          color: "var(--kt-btn-text, #fff)",
                          borderRadius: "var(--kt-radius, 6px)",
                        }}
                        aria-label="Sepete ekle"
                        title="Sepete ekle"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {results.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSubmit as unknown as React.MouseEventHandler}
                    className="mt-3 text-xs flex items-center gap-1 transition"
                    style={{ color: "var(--kt-primary)" }}
                  >
                    Tüm sonuçları gör <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* No results */}
            {query.length >= 2 && !loading && results.length === 0 && (
              <div className="max-w-3xl mx-auto px-4 pb-4">
                <p className="text-sm" style={{ color: "var(--kt-muted)" }}>
                  "<strong style={{ color: "var(--kt-text)" }}>{query}</strong>" için sonuç bulunamadı.
                </p>
              </div>
            )}

            {/* Popular searches (shown when no query or loading) */}
            {query.length < 2 && (
              <div className="max-w-3xl mx-auto px-4 pb-5">
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--kt-muted)" }}>
                  Popüler Aramalar
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handlePopularSearch(term)}
                      className="px-3 py-1.5 text-sm rounded-full border transition hover:opacity-80"
                      style={{
                        borderColor: "var(--kt-border, #e2ddd6)",
                        color: "var(--kt-text, #161108)",
                      }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
