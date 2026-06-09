"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Loader2, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/admin/image-uploader";
import { saveProduct } from "@/server/actions/products";
import { createCategoryQuick } from "@/server/actions/categories";

type ProductData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  sku: string | null;
  price: string;
  compareAtPrice: string;
  stock: number;
  lowStockThreshold: number;
  weight: string;
  vatRate: string;
  kdvExempt: boolean;
  brand: string | null;
  categoryId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  images: string[];
  variants: VariantRow[];
};

type VariantRow = {
  id?: string;
  name: string;
  sku: string;
  price: string; // boş = ürün fiyatı kullanılır
  stock: number;
  isActive: boolean;
};

type Category = { id: string; name: string };

export function ProductForm({
  product,
  categories: initialCategories,
  brands,
}: {
  product?: ProductData;
  categories: Category[];
  brands: string[];
}) {
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [variants, setVariants] = useState<VariantRow[]>(product?.variants ?? []);
  const [submitting, setSubmitting] = useState(false);

  function addVariant() {
    setVariants((prev) => [...prev, { name: "", sku: "", price: "", stock: 0, isActive: true }]);
  }
  function updateVariant(index: number, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }
  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState(product?.categoryId ?? "");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const newCatInputRef = useRef<HTMLInputElement>(null);

  async function handleCreateCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    setCreatingCategory(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      const created = await createCategoryQuick(fd);
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedCategoryId(created.id);
      setNewCategoryName("");
      setShowNewCategory(false);
    } finally {
      setCreatingCategory(false);
    }
  }

  return (
    <form
      action={async (fd) => {
        setSubmitting(true);
        try {
          await saveProduct(fd);
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-6"
    >
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Ürün Adı *</Label>
                <Input id="name" name="name" defaultValue={product?.name} required />
              </div>
              <div>
                <Label htmlFor="slug">URL (slug)</Label>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={product?.slug}
                  placeholder="otomatik oluşturulur"
                />
                <p className="text-xs text-ink-300 mt-1">Boş bırakılırsa ürün adından üretilir.</p>
              </div>
              <div>
                <Label htmlFor="shortDescription">Kısa Açıklama</Label>
                <Input
                  id="shortDescription"
                  name="shortDescription"
                  defaultValue={product?.shortDescription ?? ""}
                  placeholder="Liste görünümlerinde gözükecek tek satırlık açıklama"
                />
              </div>
              <div>
                <Label htmlFor="description">Açıklama (HTML destekli)</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={product?.description ?? ""}
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="font-display text-lg text-ink-700 mb-4">Görseller</h3>
              <ImageUploader value={images} onChange={setImages} multiple max={10} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-ink-700">Varyantlar</h3>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1 h-8 px-3 rounded-md border border-cream-200 text-sm text-ink-500 hover:border-rose-300 hover:text-rose-600 transition"
                >
                  <Plus className="h-4 w-4" /> Varyant Ekle
                </button>
              </div>
              <p className="text-xs text-ink-300">
                Örn. renk/beden seçenekleri. Boş bırakırsanız ürün varyantsız satılır.
                Fiyat boşsa ürün fiyatı kullanılır.
              </p>

              {variants.length === 0 ? (
                <p className="text-sm text-ink-300 py-2">Henüz varyant eklenmedi.</p>
              ) : (
                <div className="space-y-3">
                  {/* Başlık satırı (geniş ekran) */}
                  <div className="hidden sm:grid grid-cols-[1fr_120px_90px_90px_auto] gap-2 text-xs text-ink-300 px-1">
                    <span>Ad (ör. Beyaz / S) *</span>
                    <span>SKU</span>
                    <span>Fiyat (₺)</span>
                    <span>Stok</span>
                    <span></span>
                  </div>
                  {variants.map((v, i) => (
                    <div
                      key={v.id ?? `new-${i}`}
                      className="grid grid-cols-2 sm:grid-cols-[1fr_120px_90px_90px_auto] gap-2 items-center p-2 sm:p-0 rounded-md border sm:border-0 border-cream-200"
                    >
                      <Input
                        value={v.name}
                        onChange={(e) => updateVariant(i, { name: e.target.value })}
                        placeholder="Beyaz / S"
                        className="col-span-2 sm:col-span-1 h-9"
                      />
                      <Input
                        value={v.sku}
                        onChange={(e) => updateVariant(i, { sku: e.target.value })}
                        placeholder="SKU"
                        className="h-9"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={v.price}
                        onChange={(e) => updateVariant(i, { price: e.target.value })}
                        placeholder="—"
                        className="h-9"
                      />
                      <Input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                        className="h-9"
                      />
                      <div className="flex items-center justify-end gap-2 col-span-2 sm:col-span-1">
                        <label className="flex items-center gap-1 text-xs text-ink-400" title="Aktif">
                          <input
                            type="checkbox"
                            checked={v.isActive}
                            onChange={(e) => updateVariant(i, { isActive: e.target.checked })}
                            className="h-4 w-4 rounded border-cream-300 text-rose-500 focus:ring-rose-300"
                          />
                          Aktif
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          title="Varyantı sil"
                          className="h-8 w-8 rounded-md border border-cream-200 flex items-center justify-center text-ink-400 hover:border-rose-300 hover:text-rose-600 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <h3 className="font-display text-lg text-ink-700">SEO</h3>
              <div>
                <Label htmlFor="seoTitle">SEO Başlığı</Label>
                <Input
                  id="seoTitle"
                  name="seoTitle"
                  defaultValue={product?.seoTitle ?? ""}
                  placeholder="Boş bırakılırsa ürün adı kullanılır"
                />
              </div>
              <div>
                <Label htmlFor="seoDescription">Meta Açıklama</Label>
                <Textarea
                  id="seoDescription"
                  name="seoDescription"
                  defaultValue={product?.seoDescription ?? ""}
                  rows={2}
                  maxLength={160}
                />
                <p className="text-xs text-ink-300 mt-1">İdeal uzunluk: 120–160 karakter.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <h3 className="font-display text-lg text-ink-700">Fiyat & Stok</h3>
              <div>
                <Label htmlFor="price">Fiyat (₺) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={product?.price}
                />
              </div>
              <div>
                <Label htmlFor="compareAtPrice">Liste Fiyatı (₺)</Label>
                <Input
                  id="compareAtPrice"
                  name="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product?.compareAtPrice}
                  placeholder="indirim göstermek için"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stok *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  required
                  defaultValue={product?.stock ?? 0}
                />
              </div>
              <div>
                <Label htmlFor="lowStockThreshold">Düşük Stok Uyarısı</Label>
                <Input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  min="0"
                  defaultValue={product?.lowStockThreshold ?? 3}
                />
              </div>
              <div>
                <Label htmlFor="vatRate">KDV (%)</Label>
                <Input
                  id="vatRate"
                  name="vatRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={product?.vatRate ?? "20"}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="kdvExempt"
                  defaultChecked={product?.kdvExempt ?? false}
                  className="h-4 w-4 rounded border-cream-300 text-rose-500 focus:ring-rose-300"
                />
                KDV&apos;den Muaf
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <h3 className="font-display text-lg text-ink-700">Detaylar</h3>

              {/* Category with inline create */}
              <div>
                <Label htmlFor="categoryId">Kategori</Label>
                <div className="flex gap-2">
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="flex h-10 flex-1 rounded-md border border-cream-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                  >
                    <option value="">— Seçilmedi —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    title="Yeni kategori oluştur"
                    onClick={() => {
                      setShowNewCategory((v) => !v);
                      setTimeout(() => newCatInputRef.current?.focus(), 50);
                    }}
                    className="h-10 w-10 rounded-md border border-cream-200 flex items-center justify-center text-ink-400 hover:border-rose-300 hover:text-rose-600 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {showNewCategory && (
                  <div className="mt-2 flex gap-2 p-3 rounded-md bg-cream-50 border border-cream-200">
                    <Input
                      ref={newCatInputRef}
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateCategory())}
                      placeholder="Kategori adı"
                      className="flex-1 h-8 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory || !newCategoryName.trim()}
                      className="h-8 px-3 rounded-md bg-rose-500 text-white text-sm hover:bg-rose-600 transition disabled:opacity-50 flex items-center gap-1"
                    >
                      {creatingCategory ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Oluştur
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNewCategory(false); setNewCategoryName(""); }}
                      className="h-8 w-8 rounded-md border border-cream-200 flex items-center justify-center text-ink-400 hover:text-rose-600 transition"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Brand with combobox */}
              <div>
                <Label htmlFor="brand">Marka</Label>
                <Input
                  id="brand"
                  name="brand"
                  list="brand-suggestions"
                  defaultValue={product?.brand ?? ""}
                  placeholder="Marka adı yazın veya listeden seçin"
                  autoComplete="off"
                />
                <datalist id="brand-suggestions">
                  {brands.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
                {brands.length > 0 && (
                  <p className="text-xs text-ink-300 mt-1">
                    Mevcut markalar: {brands.slice(0, 5).join(", ")}{brands.length > 5 ? ` +${brands.length - 5}` : ""}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} />
              </div>
              <div>
                <Label htmlFor="weight">Ağırlık (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.001"
                  min="0"
                  defaultValue={product?.weight}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <h3 className="font-display text-lg text-ink-700">Durum</h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={product?.isActive ?? true}
                  className="h-4 w-4 rounded border-cream-300 text-rose-500 focus:ring-rose-300"
                />
                Aktif (sitede görünsün)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isFeatured"
                  defaultChecked={product?.isFeatured ?? false}
                  className="h-4 w-4 rounded border-cream-300 text-rose-500 focus:ring-rose-300"
                />
                Öne çıkan (ana sayfada gösterilsin)
              </label>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {product?.id ? "Güncelle" : "Oluştur"}
            </Button>
            <Link href="/admin/urunler">
              <Button type="button" variant="outline" className="w-full">
                İptal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
