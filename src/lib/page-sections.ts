function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export type SectionType =
  | "hero"
  | "categories"
  | "featured_products"
  | "new_products"
  | "rich_text"
  | "image_text"
  | "banner_cta"
  | "spacer"
  | "features"
  | "testimonials"
  | "newsletter"
  | "marquee";

export interface SectionBlock {
  id: string;
  type: "feature" | "testimonial";
  settings: BlockSettings;
}

export interface BlockSettings {
  icon?: string;
  title?: string;
  description?: string;
  content?: string;
  author?: string;
  role?: string;
  rating?: number;
}

export interface SectionSettings {
  // Common
  title?: string;
  subtitle?: string;
  background?: "white" | "cream" | "primary";
  // Product/category grids
  count?: number;
  // Rich text
  content?: string;
  textAlign?: "left" | "center";
  // Image sections
  image?: string;
  imagePosition?: "left" | "right";
  ctaText?: string;
  ctaUrl?: string;
  overlayOpacity?: number;
  // Hero layout variants
  heroLayout?: "full-bleed" | "split" | "editorial";
  heroAccentLabel?: string;
  // Spacer
  height?: number;
  // Features
  columns?: 2 | 3 | 4;
  // Newsletter
  placeholder?: string;
  buttonText?: string;
  // Marquee
  animated?: boolean;
  marqueeSpeed?: number;
  marqueeSeparator?: string;
  textColor?: "dark" | "light";
  textSize?: "sm" | "md";
  position?: "content" | "top";
}

export interface PageSection {
  id: string;
  type: SectionType;
  visible: boolean;
  settings: SectionSettings;
  blocks?: SectionBlock[];
}

export const SECTION_META: Record<
  SectionType,
  { label: string; description: string; icon: string; canHaveBlocks?: boolean }
> = {
  hero: { label: "Ana Banner", icon: "🖼", description: "Slider banner (Banner yönetiminden düzenlenir)" },
  categories: { label: "Kategoriler", icon: "🗂", description: "Kategori kartları ızgarası" },
  featured_products: { label: "Öne Çıkan Ürünler", icon: "⭐", description: "Öne çıkan ürünler ızgarası" },
  new_products: { label: "Yeni Ürünler", icon: "🆕", description: "En son eklenen ürünler" },
  rich_text: { label: "Metin Bloğu", icon: "📝", description: "Başlık ve paragraf metni" },
  image_text: { label: "Görsel + Metin", icon: "📸", description: "Görsel ve metin yan yana" },
  banner_cta: { label: "Banner CTA", icon: "📢", description: "Tam genişlik görsel ve buton" },
  spacer: { label: "Boşluk", icon: "↕", description: "Bölümler arası boşluk" },
  features: { label: "Özellikler", icon: "✨", description: "İkon, başlık ve açıklama kartları", canHaveBlocks: true },
  testimonials: { label: "Yorumlar", icon: "💬", description: "Müşteri yorumları", canHaveBlocks: true },
  newsletter: { label: "Bülten", icon: "📧", description: "E-posta bülten kaydı formu" },
  marquee: { label: "Duyuru Akışı", icon: "📣", description: "Sağdan sola kayan duyuru metni" },
};

export const DEFAULT_SECTIONS: PageSection[] = [
  { id: "s_hero", type: "hero", visible: true, settings: {} },
  {
    id: "s_cats",
    type: "categories",
    visible: true,
    settings: { title: "Kategoriler", subtitle: "Sıcak yuvanız için özenle seçilmiş koleksiyonlar", count: 6 },
  },
  {
    id: "s_featured",
    type: "featured_products",
    visible: true,
    settings: { title: "Öne Çıkanlar", subtitle: "Sezonun en sevilenleri", count: 8 },
  },
  {
    id: "s_newest",
    type: "new_products",
    visible: true,
    settings: { title: "Yeni Gelenler", subtitle: "Koleksiyona son eklenenler", count: 8 },
  },
];

const DEFAULT_FEATURE_BLOCKS: SectionBlock[] = [
  { id: "b1", type: "feature", settings: { icon: "🏆", title: "Kaliteli Malzeme", description: "El emeği ile seçilmiş, uzun ömürlü malzemeler." } },
  { id: "b2", type: "feature", settings: { icon: "🚚", title: "Hızlı Kargo", description: "Siparişleriniz özenle paketlenerek kapınıza teslim edilir." } },
  { id: "b3", type: "feature", settings: { icon: "💝", title: "Müşteri Memnuniyeti", description: "Her alışverişinizde memnuniyetiniz önceliğimizdir." } },
];

const DEFAULT_TESTIMONIAL_BLOCKS: SectionBlock[] = [
  { id: "t1", type: "testimonial", settings: { content: "Ürünler gerçekten çok güzel, fotoğraflardaki gibi geldi. Kesinlikle tekrar alırım.", author: "Ayşe K.", role: "Müşteri", rating: 5 } },
  { id: "t2", type: "testimonial", settings: { content: "Kargo hızlıydı, ambalaj çok özenli. Herkese tavsiye ederim.", author: "Fatma M.", role: "Müşteri", rating: 5 } },
];

export function newSection(type: SectionType): PageSection {
  const defaults: Record<SectionType, SectionSettings> = {
    hero: {},
    categories: { title: "Kategoriler", subtitle: "", count: 6, background: "white" },
    featured_products: { title: "Öne Çıkan Ürünler", subtitle: "", count: 8, background: "cream" },
    new_products: { title: "Yeni Ürünler", subtitle: "", count: 8, background: "white" },
    rich_text: { title: "", content: "<p>İçerik buraya gelecek.</p>", background: "white", textAlign: "left" },
    image_text: { title: "", image: "", imagePosition: "left", ctaText: "", ctaUrl: "", background: "white" },
    banner_cta: { image: "", title: "", subtitle: "", ctaText: "Keşfet", ctaUrl: "/urunler", overlayOpacity: 40 },
    spacer: { height: 48 },
    features: { title: "Neden Biz?", subtitle: "", background: "cream", columns: 3 },
    testimonials: { title: "Müşteri Yorumları", subtitle: "", background: "white" },
    newsletter: { title: "Bültene Abone Ol", subtitle: "Yeni ürün ve kampanyalardan haberdar olun.", placeholder: "E-posta adresiniz", buttonText: "Abone Ol", background: "cream" },
    marquee: { title: "Ücretsiz kargo  ✦  İndirim fırsatları  ✦  Yeni koleksiyonlar", background: "primary", textColor: "light", textSize: "sm", animated: true, marqueeSpeed: 20, marqueeSeparator: "✦", position: "content" },
  };

  const blocks: Partial<Record<SectionType, SectionBlock[]>> = {
    features: DEFAULT_FEATURE_BLOCKS.map((b) => ({ ...b, id: randomId() })),
    testimonials: DEFAULT_TESTIMONIAL_BLOCKS.map((b) => ({ ...b, id: randomId() })),
  };

  return {
    id: randomId(),
    type,
    visible: true,
    settings: defaults[type] ?? {},
    ...(blocks[type] ? { blocks: blocks[type] } : {}),
  };
}

export function parseSections(raw: unknown): PageSection[] {
  if (!Array.isArray(raw)) return DEFAULT_SECTIONS;
  return raw as PageSection[];
}
