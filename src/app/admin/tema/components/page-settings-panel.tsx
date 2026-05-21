"use client";

import type { ProductPageSettings, CategoryPageSettings, GlobalSettings } from "@/lib/theme-settings";

interface PageSettingsPanelProps {
  currentPage: "product" | "category";
  productPageSettings: ProductPageSettings;
  categoryPageSettings: CategoryPageSettings;
  globalSettings?: GlobalSettings;
  dispatch: (action: any) => void;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2.5 bg-cream-50 border-b border-cream-100">
      <p className="text-xs font-medium text-ink-400 uppercase tracking-wider">{children}</p>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink-700">{label}</p>
        {description && <p className="text-xs text-ink-300">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${value ? "bg-rose-500" : "bg-cream-300"}`}
        role="switch"
        aria-checked={value}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}

function RadioRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-ink-500 font-medium">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-2.5 py-1 text-xs rounded-md border transition ${
              value === opt.value
                ? "bg-rose-500 text-white border-rose-500"
                : "border-cream-200 text-ink-600 hover:border-rose-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-2.5 py-1.5 text-sm border border-cream-200 rounded-md bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-rose-200";

export function PageSettingsPanel({
  currentPage,
  productPageSettings: ps,
  categoryPageSettings: cs,
  globalSettings: gs,
  dispatch,
}: PageSettingsPanelProps) {
  const updProduct = (settings: Partial<ProductPageSettings>) =>
    dispatch({ type: "UPDATE_PRODUCT_PAGE", settings });
  const updCategory = (settings: Partial<CategoryPageSettings>) =>
    dispatch({ type: "UPDATE_CATEGORY_PAGE", settings });
  const updBar = (settings: Partial<GlobalSettings["announcementBar"]>) =>
    dispatch({ type: "UPDATE_GLOBAL_BAR", settings });

  if (currentPage === "product") {
    return (
      <div className="flex flex-col">
        <SectionHeader>Navigasyon</SectionHeader>
        <div className="px-4 py-3 border-b border-cream-100 space-y-3">
          <Toggle label="Ekmek Kırıntısı" value={ps.showBreadcrumb} onChange={(v) => updProduct({ showBreadcrumb: v })} />
          <RadioRow
            label="Ayraç"
            options={[{ value: "/", label: "/" }, { value: ">", label: ">" }, { value: "·", label: "·" }]}
            value={ps.breadcrumbSeparator}
            onChange={(v) => updProduct({ breadcrumbSeparator: v as "/" | ">" | "·" })}
          />
        </div>

        <SectionHeader>Galeri</SectionHeader>
        <div className="px-4 py-3 border-b border-cream-100 space-y-3">
          <RadioRow
            label="Düzen"
            options={[{ value: "thumbnails", label: "Küçük Resimli" }, { value: "stacked", label: "Yığılmış" }]}
            value={ps.galleryLayout}
            onChange={(v) => updProduct({ galleryLayout: v as "thumbnails" | "stacked" })}
          />
          <Toggle label="Zoom Aktif" value={ps.enableZoom} onChange={(v) => updProduct({ enableZoom: v })} />
        </div>

        <SectionHeader>Ürün Bilgisi</SectionHeader>
        <div className="px-4 py-3 border-b border-cream-100 space-y-3">
          <Toggle label="Stok Durumu" value={ps.showStockBadge} onChange={(v) => updProduct({ showStockBadge: v })} />
          <Toggle label="SKU Göster" value={ps.showSku} onChange={(v) => updProduct({ showSku: v })} />
          <Toggle label="Marka Göster" value={ps.showBrand} onChange={(v) => updProduct({ showBrand: v })} />
          <RadioRow
            label="Açıklama Stili"
            options={[{ value: "text", label: "Düz Metin" }, { value: "tabs", label: "Sekmeli" }]}
            value={ps.descriptionStyle}
            onChange={(v) => updProduct({ descriptionStyle: v as "text" | "tabs" })}
          />
        </div>

        <SectionHeader>İlgili Ürünler</SectionHeader>
        <div className="px-4 py-3 border-b border-cream-100 space-y-3">
          <Toggle label="Göster" value={ps.showRelatedProducts} onChange={(v) => updProduct({ showRelatedProducts: v })} />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-500">Bölüm Başlığı</label>
            <input
              className={inputCls}
              value={ps.relatedProductsHeading}
              onChange={(e) => updProduct({ relatedProductsHeading: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-500">Ürün Sayısı: {ps.relatedProductsCount}</label>
            <input
              type="range"
              min={2}
              max={8}
              step={2}
              value={ps.relatedProductsCount}
              onChange={(e) => updProduct({ relatedProductsCount: Number(e.target.value) })}
              className="w-full accent-rose-500"
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === "category") {
    return (
      <div className="flex flex-col">
        <SectionHeader>Kategori Başlığı</SectionHeader>
        <div className="px-4 py-3 border-b border-cream-100 space-y-3">
          <Toggle label="Banner Göster" value={cs.showBanner} onChange={(v) => updCategory({ showBanner: v })} />
          <Toggle label="Açıklama Göster" value={cs.showDescription} onChange={(v) => updCategory({ showDescription: v })} />
        </div>

        <SectionHeader>Filtreler</SectionHeader>
        <div className="px-4 py-3 border-b border-cream-100 space-y-3">
          <RadioRow
            label="Filtre Konumu"
            options={[{ value: "sidebar", label: "Kenar Çubuğu" }, { value: "topbar", label: "Üst Bar" }]}
            value={cs.filterPosition}
            onChange={(v) => updCategory({ filterPosition: v as "sidebar" | "topbar" })}
          />
          <RadioRow
            label="Mobil Filtre"
            options={[{ value: "drawer", label: "Çekmece" }, { value: "collapse", label: "Akordiyon" }]}
            value={cs.mobileFilterStyle}
            onChange={(v) => updCategory({ mobileFilterStyle: v as "drawer" | "collapse" })}
          />
        </div>

        <SectionHeader>Ürün Izgarası</SectionHeader>
        <div className="px-4 py-3 border-b border-cream-100 space-y-3">
          <RadioRow
            label="Varsayılan Sütun"
            options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]}
            value={String(cs.defaultColumns)}
            onChange={(v) => updCategory({ defaultColumns: Number(v) as 2 | 3 | 4 })}
          />
          <RadioRow
            label="Kart Stili"
            options={[{ value: "default", label: "Varsayılan" }, { value: "minimal", label: "Minimal" }]}
            value={cs.cardStyle}
            onChange={(v) => updCategory({ cardStyle: v as "default" | "minimal" })}
          />
          <Toggle label="Ürün Sayısı Göster" value={cs.showProductCount} onChange={(v) => updCategory({ showProductCount: v })} />
        </div>

        <SectionHeader>Sıralama ve Sayfalama</SectionHeader>
        <div className="px-4 py-3 border-b border-cream-100 space-y-3">
          <Toggle label="Sıralama Çubuğu" value={cs.showSortBar} onChange={(v) => updCategory({ showSortBar: v })} />
          <RadioRow
            label="Varsayılan Sıralama"
            options={[
              { value: "newest", label: "Yeni" },
              { value: "price_asc", label: "Ucuz" },
              { value: "price_desc", label: "Pahalı" },
              { value: "name_asc", label: "A-Z" },
            ]}
            value={cs.defaultSort}
            onChange={(v) => updCategory({ defaultSort: v as CategoryPageSettings["defaultSort"] })}
          />
          <RadioRow
            label="Sayfalama Stili"
            options={[
              { value: "pagination", label: "Sayfa No" },
              { value: "load_more", label: "Daha Fazla" },
              { value: "infinite", label: "Sonsuz" },
            ]}
            value={cs.paginationStyle}
            onChange={(v) => updCategory({ paginationStyle: v as CategoryPageSettings["paginationStyle"] })}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-500">Sayfa Başı Ürün: {cs.perPage}</label>
            <input
              type="range"
              min={12}
              max={60}
              step={12}
              value={cs.perPage}
              onChange={(e) => updCategory({ perPage: Number(e.target.value) })}
              className="w-full accent-rose-500"
            />
          </div>
        </div>
      </div>
    );
  }

  // Global
  const bar = gs?.announcementBar ?? { enabled: false, text: "", link: "", bgColor: "#c95265", textColor: "#ffffff", dismissible: true };
  return (
    <div className="flex flex-col">
      <SectionHeader>Duyuru Çubuğu</SectionHeader>
      <div className="px-4 py-3 border-b border-cream-100 space-y-3">
        <Toggle label="Aktif" value={bar.enabled} onChange={(v) => updBar({ enabled: v })} />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-500">Metin</label>
          <input
            className={inputCls}
            value={bar.text}
            onChange={(e) => updBar({ text: e.target.value })}
            placeholder="Yeni koleksiyon geldi!"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-500">Bağlantı (opsiyonel)</label>
          <input
            className={inputCls}
            value={bar.link}
            onChange={(e) => updBar({ link: e.target.value })}
            placeholder="/urunler"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-ink-500">Arkaplan</label>
            <input type="color" value={bar.bgColor} onChange={(e) => updBar({ bgColor: e.target.value })} className="h-8 w-full rounded cursor-pointer" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-ink-500">Metin Rengi</label>
            <input type="color" value={bar.textColor} onChange={(e) => updBar({ textColor: e.target.value })} className="h-8 w-full rounded cursor-pointer" />
          </div>
        </div>
        <Toggle label="Kapatılabilir" value={bar.dismissible} onChange={(v) => updBar({ dismissible: v })} />
      </div>
    </div>
  );
}
