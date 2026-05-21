export interface ThemeSettings {
  colorPrimary: string;
  colorDark: string;
  colorText: string;
  colorHeading: string;
  colorBackground: string;
  colorAccent: string;
  fontBody: string;
  fontDisplay: string;
  buttonRadius: "none" | "sm" | "md" | "lg" | "full";
  headerStyle: "sticky" | "static" | "transparent";
  headerLogoHeight: number;

  // Typography — extended
  fontBodyScale?: number;          // 80–120, default 100
  fontDisplayWeight?: "300" | "400" | "500" | "600" | "700" | "900";
  fontDisplayStyle?: "normal" | "italic";
  fontDisplayTransform?: "none" | "uppercase" | "lowercase";
  fontDisplayLetterSpacing?: number; // em*100, e.g. -3 = -0.03em

  // Cards
  cardStyle?: "borderless" | "bordered" | "elevated";
  cardRadius?: number;             // px
  cardImageBg?: string;
  cardNameFont?: "body" | "display";
  cardNameStyle?: "normal" | "italic";
  cardNameTransform?: "none" | "uppercase";
  cardLabelTransform?: "none" | "uppercase";
  cardLabelFont?: "body" | "mono";
  cardAlignment?: "left" | "center";

  // Buttons — extended
  buttonTextTransform?: "none" | "uppercase";
  buttonLetterSpacing?: number;    // em*100
  buttonFontFamily?: "body" | "display" | "mono";
  buttonFontWeight?: "300" | "400" | "500" | "600" | "700";
  buttonTextColorOverride?: string;
  buttonBorderWidth?: number;      // px
  buttonBorderOpacity?: number;    // 0–100

  // Layout
  pageWidth?: number;              // px
  sectionSpacing?: number;         // px
  gridColumnGap?: number;          // px
  gridRowGap?: number;             // px
  sectionBorderStyle?: "none" | "line" | "thick";

  // Hover animation
  hoverEffect?: "none" | "lift" | "fade" | "scale";

  // Extended palette
  colorSurface?: string;
  colorBorder?: string;
  colorMuted?: string;

  // Badges
  badgePosition?: "top-left" | "top-right" | "bottom-left";
  badgeRadius?: number;            // px

  // Brand info
  brandTagline?: string;
  brandDescription?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialYoutube?: string;
  socialTiktok?: string;
  socialTwitter?: string;
  socialPinterest?: string;

  // Cart
  cartType?: "drawer" | "popup" | "page";

  // Header
  headerBorderStyle?: "none" | "thin" | "medium" | "thick";
  headerLayout?: "default" | "centered" | "minimal" | "split";
}

export interface GlobalSettings {
  announcementBar: {
    enabled: boolean;
    text: string;
    link: string;
    bgColor: string;
    textColor: string;
    dismissible: boolean;
  };
}

export interface ProductPageSettings {
  showBreadcrumb: boolean;
  breadcrumbSeparator: "/" | ">" | "·";
  galleryLayout: "stacked" | "thumbnails";
  enableZoom: boolean;
  showRelatedProducts: boolean;
  relatedProductsCount: number;
  relatedProductsHeading: string;
  showRecentlyViewed: boolean;
  descriptionStyle: "text" | "tabs";
  showStockBadge: boolean;
  showSku: boolean;
  showBrand: boolean;
}

export interface CategoryPageSettings {
  showBanner: boolean;
  showDescription: boolean;
  filterPosition: "sidebar" | "topbar";
  mobileFilterStyle: "drawer" | "collapse";
  defaultColumns: 2 | 3 | 4;
  cardStyle: "default" | "minimal";
  paginationStyle: "pagination" | "load_more" | "infinite";
  perPage: number;
  showProductCount: boolean;
  showSortBar: boolean;
  defaultSort: "newest" | "price_asc" | "price_desc" | "name_asc";
}

export interface ThemeTemplate {
  id: string;
  name: string;
  createdAt: string;
  data: {
    themeSettings: ThemeSettings;
    customCss: string;
    homepageSections?: import("./page-sections").PageSection[];
    productPageSettings?: Partial<ProductPageSettings>;
    categoryPageSettings?: Partial<CategoryPageSettings>;
  };
}

export interface EditorData {
  homepageSections: import("./page-sections").PageSection[];
  productPageSettings: ProductPageSettings;
  categoryPageSettings: CategoryPageSettings;
  themeSettings: ThemeSettings;
  globalSettings: GlobalSettings;
  customCss: string;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  colorPrimary: "#c95265",
  colorDark: "#a93b4d",
  colorText: "#161108",
  colorHeading: "#2b2419",
  colorBackground: "#fdfaf6",
  colorAccent: "#b8924f",
  fontBody: "Inter",
  fontDisplay: "Playfair Display",
  buttonRadius: "md",
  headerStyle: "sticky",
  headerLogoHeight: 32,

  // Typography defaults
  fontBodyScale: 100,
  fontDisplayWeight: "400",
  fontDisplayStyle: "normal",
  fontDisplayTransform: "none",
  fontDisplayLetterSpacing: 0,

  // Cards defaults
  cardStyle: "borderless",
  cardRadius: 8,
  cardImageBg: "#f3f0eb",
  cardNameFont: "body",
  cardNameStyle: "normal",
  cardNameTransform: "none",
  cardLabelTransform: "none",
  cardLabelFont: "body",
  cardAlignment: "left",

  // Buttons defaults
  buttonTextTransform: "none",
  buttonLetterSpacing: 0,
  buttonFontFamily: "body",
  buttonFontWeight: "500",
  buttonTextColorOverride: "",
  buttonBorderWidth: 0,
  buttonBorderOpacity: 100,

  // Layout defaults
  pageWidth: 1280,
  sectionSpacing: 64,
  gridColumnGap: 24,
  gridRowGap: 24,
  sectionBorderStyle: "none",

  // Hover
  hoverEffect: "lift",

  // Extended palette defaults
  colorSurface: "#ffffff",
  colorBorder: "#e2ddd6",
  colorMuted: "#6b6459",

  // Badges defaults
  badgePosition: "top-left",
  badgeRadius: 4,

  // Brand info defaults
  brandTagline: "",
  brandDescription: "",
  socialInstagram: "",
  socialFacebook: "",
  socialYoutube: "",
  socialTiktok: "",
  socialTwitter: "",
  socialPinterest: "",

  // Cart default
  cartType: "drawer",

  // Header default
  headerBorderStyle: "thin",
  headerLayout: "default",
};

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  announcementBar: {
    enabled: false,
    text: "",
    link: "",
    bgColor: "#c95265",
    textColor: "#ffffff",
    dismissible: true,
  },
};

export const DEFAULT_PRODUCT_PAGE_SETTINGS: ProductPageSettings = {
  showBreadcrumb: true,
  breadcrumbSeparator: "/",
  galleryLayout: "thumbnails",
  enableZoom: true,
  showRelatedProducts: true,
  relatedProductsCount: 4,
  relatedProductsHeading: "Benzer Ürünler",
  showRecentlyViewed: false,
  descriptionStyle: "text",
  showStockBadge: true,
  showSku: true,
  showBrand: true,
};

export const DEFAULT_CATEGORY_PAGE_SETTINGS: CategoryPageSettings = {
  showBanner: true,
  showDescription: true,
  filterPosition: "topbar",
  mobileFilterStyle: "drawer",
  defaultColumns: 4,
  cardStyle: "default",
  paginationStyle: "load_more",
  perPage: 24,
  showProductCount: true,
  showSortBar: true,
  defaultSort: "newest",
};

export const BUTTON_RADIUS_MAP: Record<ThemeSettings["buttonRadius"], string> = {
  none: "0px",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  full: "9999px",
};

export const BODY_FONTS = [
  "Inter",
  "Manrope",
  "Plus Jakarta Sans",
  "Outfit",
  "Space Grotesk",
  "Roboto",
  "Open Sans",
  "Lato",
  "Nunito",
  "Source Sans Pro",
] as const;

export const DISPLAY_FONTS = [
  "Playfair Display",
  "Cormorant Garamond",
  "DM Serif Display",
  "Instrument Serif",
  "Bricolage Grotesque",
  "Archivo Black",
  "Raleway",
  "Josefin Sans",
  "Libre Baskerville",
  "Merriweather",
] as const;

export const PRESET_TEMPLATES: ThemeTemplate[] = [
  {
    id: "preset-minimal-editorial",
    name: "Minimal Editorial",
    createdAt: "2025-01-01T00:00:00Z",
    data: {
      themeSettings: {
        colorPrimary: "#1a1a1a",
        colorDark: "#000000",
        colorText: "#1a1a1a",
        colorHeading: "#1a1a1a",
        colorBackground: "#f6f3ee",
        colorAccent: "#7a7268",
        fontBody: "Manrope",
        fontDisplay: "Cormorant Garamond",
        buttonRadius: "none",
        headerStyle: "static",
        headerLogoHeight: 32,
        // Typography
        fontDisplayWeight: "400",
        fontDisplayStyle: "italic",
        fontDisplayTransform: "none",
        fontDisplayLetterSpacing: -3,
        // Cards
        cardStyle: "borderless",
        cardImageBg: "#ece6da",
        cardRadius: 0,
        cardNameFont: "display",
        cardNameStyle: "italic",
        cardNameTransform: "none",
        cardLabelFont: "mono",
        cardLabelTransform: "uppercase",
        cardAlignment: "left",
        // Buttons
        buttonTextTransform: "uppercase",
        buttonLetterSpacing: 12,
        buttonFontFamily: "mono",
        buttonFontWeight: "400",
        buttonTextColorOverride: "#f6f3ee",
        buttonBorderWidth: 0,
        // Layout
        pageWidth: 1280,
        sectionSpacing: 64,
        gridColumnGap: 24,
        gridRowGap: 24,
        sectionBorderStyle: "line",
        // Hover
        hoverEffect: "none",
        // Extended palette
        colorSurface: "#ffffff",
        colorBorder: "#1a1a1a",
        colorMuted: "#7a7268",
        // Badges
        badgePosition: "top-left",
        badgeRadius: 0,
        // Header
        headerBorderStyle: "medium",
        headerLayout: "centered",
        cartType: "drawer",
      },
      customCss: `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');`,
      homepageSections: [
        { id: "s_hero", type: "hero", visible: true, settings: { heroLayout: "split", heroAccentLabel: "YENİ KOLEKSİYON", title: "Özenle seçilmiş ev aksesuarları", subtitle: "Doğal malzemeler, minimal tasarım. Her parça sınırlı sayıda üretilir.", ctaText: "KOLEKSİYONU GÖR", ctaUrl: "/urunler" } },
        { id: "s_featured", type: "featured_products", visible: true, settings: { title: "Seçmeler", subtitle: "Editörün tercihleri", count: 4, background: "white" } },
        { id: "s_newest", type: "new_products", visible: true, settings: { title: "Yeni Gelenler", count: 4, background: "white" } },
      ],
      productPageSettings: { galleryLayout: "stacked", descriptionStyle: "text", showBreadcrumb: true, breadcrumbSeparator: "/", showRelatedProducts: true, relatedProductsCount: 3 },
      categoryPageSettings: { filterPosition: "topbar", defaultColumns: 3, showBanner: false, showDescription: false, paginationStyle: "load_more" },
    },
  },
  {
    id: "preset-bold-brutalist",
    name: "Bold Brutalist",
    createdAt: "2025-01-01T00:00:00Z",
    data: {
      themeSettings: {
        colorPrimary: "#fff200",
        colorDark: "#f0e200",
        colorText: "#000000",
        colorHeading: "#000000",
        colorBackground: "#f1f1ec",
        colorAccent: "#ff3d8a",
        fontBody: "Space Grotesk",
        fontDisplay: "Archivo Black",
        buttonRadius: "none",
        headerStyle: "static",
        headerLogoHeight: 36,
        // Typography
        fontDisplayWeight: "900",
        fontDisplayStyle: "normal",
        fontDisplayTransform: "uppercase",
        fontDisplayLetterSpacing: -3,
        // Cards
        cardStyle: "bordered",
        cardImageBg: "#e8e8e4",
        cardRadius: 0,
        cardNameFont: "display",
        cardNameStyle: "normal",
        cardNameTransform: "uppercase",
        cardLabelFont: "mono",
        cardLabelTransform: "uppercase",
        cardAlignment: "left",
        // Buttons
        buttonTextTransform: "uppercase",
        buttonLetterSpacing: 2,
        buttonFontFamily: "display",
        buttonFontWeight: "700",
        buttonTextColorOverride: "#000000",
        buttonBorderWidth: 3,
        buttonBorderOpacity: 100,
        // Layout
        pageWidth: 1280,
        sectionSpacing: 64,
        gridColumnGap: 24,
        gridRowGap: 24,
        sectionBorderStyle: "none",
        // Hover
        hoverEffect: "lift",
        // Extended palette
        colorSurface: "#f1f1ec",
        colorBorder: "#000000",
        colorMuted: "#444444",
        // Badges
        badgePosition: "top-left",
        badgeRadius: 0,
        // Header
        headerBorderStyle: "thick",
        headerLayout: "split",
        cartType: "drawer",
      },
      customCss: `@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&display=swap');`,
      homepageSections: [
        { id: "s_hero", type: "hero", visible: true, settings: { heroLayout: "editorial", heroAccentLabel: "YENİ SEZON — 2025", title: "Ev için büyük fikirler.", subtitle: "Cesur renkler, sert çizgiler, sıfır uzlaşma.", ctaText: "ALIŞVERIŞE BAŞLA", ctaUrl: "/urunler" } },
        { id: "s_cats", type: "categories", visible: true, settings: { title: "KATEGORİLER", count: 6 } },
        { id: "s_featured", type: "featured_products", visible: true, settings: { title: "ÖNE ÇIKANLAR", count: 8 } },
      ],
      productPageSettings: { galleryLayout: "thumbnails", descriptionStyle: "tabs", showBreadcrumb: false, showRelatedProducts: true, relatedProductsCount: 4 },
      categoryPageSettings: { filterPosition: "sidebar", defaultColumns: 4, showBanner: true, showDescription: true, paginationStyle: "pagination" },
    },
  },
  {
    id: "preset-warm-organic",
    name: "Warm Organic",
    createdAt: "2025-01-01T00:00:00Z",
    data: {
      themeSettings: {
        colorPrimary: "#c96442",
        colorDark: "#a84f30",
        colorText: "#2e2418",
        colorHeading: "#2e2418",
        colorBackground: "#f7efe2",
        colorAccent: "#7a8459",
        fontBody: "Outfit",
        fontDisplay: "DM Serif Display",
        buttonRadius: "sm",
        headerStyle: "sticky",
        headerLogoHeight: 36,
        // Typography
        fontDisplayWeight: "400",
        fontDisplayStyle: "normal",
        fontDisplayTransform: "none",
        fontDisplayLetterSpacing: -1,
        // Cards
        cardStyle: "borderless",
        cardImageBg: "#e8d9b8",
        cardRadius: 8,
        cardNameFont: "display",
        cardNameStyle: "normal",
        cardNameTransform: "none",
        cardLabelFont: "body",
        cardLabelTransform: "none",
        cardAlignment: "left",
        // Buttons
        buttonTextTransform: "none",
        buttonLetterSpacing: 0,
        buttonFontFamily: "body",
        buttonFontWeight: "500",
        buttonTextColorOverride: "",
        buttonBorderWidth: 0,
        // Layout
        pageWidth: 1280,
        sectionSpacing: 64,
        gridColumnGap: 24,
        gridRowGap: 24,
        sectionBorderStyle: "none",
        // Hover
        hoverEffect: "lift",
        // Extended palette
        colorSurface: "#fdf8ec",
        colorBorder: "#d4c0a0",
        colorMuted: "#7a6a55",
        // Badges
        badgePosition: "top-left",
        badgeRadius: 4,
        // Header
        headerBorderStyle: "thin",
        cartType: "drawer",
      },
      customCss: ``,
      homepageSections: [
        { id: "s_hero", type: "hero", visible: true, settings: { heroLayout: "full-bleed" } },
        { id: "s_cats", type: "categories", visible: true, settings: { title: "Kategoriler", subtitle: "Koleksiyonumuzu keşfedin", count: 6 } },
        { id: "s_featured", type: "featured_products", visible: true, settings: { title: "Öne Çıkanlar", subtitle: "El emeği ürünler", count: 8 } },
        { id: "s_newest", type: "new_products", visible: true, settings: { title: "Yeni Gelenler", count: 8 } },
      ],
    },
  },
  {
    id: "preset-dark-luxury",
    name: "Dark Luxury",
    createdAt: "2025-01-01T00:00:00Z",
    data: {
      themeSettings: {
        colorPrimary: "#c9a96a",
        colorDark: "#8a7548",
        colorText: "#ebe5d4",
        colorHeading: "#ebe5d4",
        colorBackground: "#0e0d0b",
        colorAccent: "#c9a96a",
        fontBody: "Manrope",
        fontDisplay: "Cormorant Garamond",
        buttonRadius: "none",
        headerStyle: "transparent",
        headerLogoHeight: 40,
        // Typography
        fontDisplayWeight: "300",
        fontDisplayStyle: "normal",
        fontDisplayTransform: "none",
        fontDisplayLetterSpacing: 5,
        // Cards
        cardStyle: "borderless",
        cardImageBg: "#16140f",
        cardRadius: 0,
        cardNameFont: "display",
        cardNameStyle: "normal",
        cardNameTransform: "none",
        cardLabelFont: "mono",
        cardLabelTransform: "uppercase",
        cardAlignment: "left",
        // Buttons
        buttonTextTransform: "uppercase",
        buttonLetterSpacing: 8,
        buttonFontFamily: "mono",
        buttonFontWeight: "400",
        buttonTextColorOverride: "#0e0d0b",
        buttonBorderWidth: 0,
        // Layout
        pageWidth: 1280,
        sectionSpacing: 64,
        gridColumnGap: 24,
        gridRowGap: 24,
        sectionBorderStyle: "none",
        // Hover
        hoverEffect: "fade",
        // Extended palette
        colorSurface: "#16140f",
        colorBorder: "rgba(201,169,106,0.25)",
        colorMuted: "#857d6a",
        // Badges
        badgePosition: "top-left",
        badgeRadius: 0,
        // Header
        headerBorderStyle: "none",
        headerLayout: "minimal",
        cartType: "drawer",
      },
      customCss: `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');`,
      homepageSections: [
        { id: "s_hero", type: "hero", visible: true, settings: { heroLayout: "split", heroAccentLabel: "A / W 2025", title: "Lüksün sessiz dili.", subtitle: "El işçiliği ile üretilmiş, sınırlı sayıda parçalar.", ctaText: "KEŞFEDİN", ctaUrl: "/urunler" } },
        { id: "s_featured", type: "featured_products", visible: true, settings: { title: "Seçilen Parçalar", subtitle: "", count: 4 } },
        { id: "s_newest", type: "new_products", visible: true, settings: { title: "Yeni Koleksiyon", count: 4 } },
      ],
      productPageSettings: { galleryLayout: "stacked", descriptionStyle: "text", showBreadcrumb: true, breadcrumbSeparator: "·", showRelatedProducts: true, relatedProductsCount: 4 },
      categoryPageSettings: { filterPosition: "topbar", defaultColumns: 4, showBanner: false, showDescription: false, paginationStyle: "load_more" },
    },
  },
  {
    id: "preset-playful-pop",
    name: "Playful Pop",
    createdAt: "2025-01-01T00:00:00Z",
    data: {
      themeSettings: {
        colorPrimary: "#ff5d8f",
        colorDark: "#e04478",
        colorText: "#1a1a2e",
        colorHeading: "#1a1a2e",
        colorBackground: "#fef6e4",
        colorAccent: "#00b4d8",
        fontBody: "Plus Jakarta Sans",
        fontDisplay: "Bricolage Grotesque",
        buttonRadius: "full",
        headerStyle: "sticky",
        headerLogoHeight: 32,
        // Typography
        fontDisplayWeight: "700",
        fontDisplayStyle: "normal",
        fontDisplayTransform: "none",
        fontDisplayLetterSpacing: -5,
        // Cards
        cardStyle: "elevated",
        cardImageBg: "#fce4ed",
        cardRadius: 16,
        cardNameFont: "display",
        cardNameStyle: "normal",
        cardNameTransform: "none",
        cardLabelFont: "body",
        cardLabelTransform: "none",
        cardAlignment: "left",
        // Buttons
        buttonTextTransform: "none",
        buttonLetterSpacing: 0,
        buttonFontFamily: "display",
        buttonFontWeight: "700",
        buttonTextColorOverride: "#ffffff",
        buttonBorderWidth: 0,
        // Layout
        pageWidth: 1280,
        sectionSpacing: 64,
        gridColumnGap: 24,
        gridRowGap: 24,
        sectionBorderStyle: "none",
        // Hover
        hoverEffect: "scale",
        // Extended palette
        colorSurface: "#ffffff",
        colorBorder: "#ffd6e5",
        colorMuted: "#6b6a8e",
        // Badges
        badgePosition: "top-left",
        badgeRadius: 999,
        // Header
        headerBorderStyle: "none",
        cartType: "drawer",
      },
      customCss: ``,
      homepageSections: [
        { id: "s_hero", type: "hero", visible: true, settings: { heroLayout: "editorial", heroAccentLabel: "✦ YENİ SEZON ✦", title: "Evine renk kat!", subtitle: "Canlı renkler, eğlenceli tasarımlar, sevimli ürünler.", ctaText: "Alışverişe Başla", ctaUrl: "/urunler" } },
        { id: "s_cats", type: "categories", visible: true, settings: { title: "Kategoriler", count: 6 } },
        { id: "s_featured", type: "featured_products", visible: true, settings: { title: "Favori Ürünler ✨", count: 8 } },
      ],
    },
  },
  {
    id: "preset-tech-modern",
    name: "Tech Modern",
    createdAt: "2025-01-01T00:00:00Z",
    data: {
      themeSettings: {
        colorPrimary: "#6cf2c1",
        colorDark: "#4fd4a3",
        colorText: "#e6edf7",
        colorHeading: "#e6edf7",
        colorBackground: "#0a0c10",
        colorAccent: "#5b8def",
        fontBody: "Inter",
        fontDisplay: "Space Grotesk",
        buttonRadius: "sm",
        headerStyle: "sticky",
        headerLogoHeight: 32,
        // Typography
        fontDisplayWeight: "600",
        fontDisplayStyle: "normal",
        fontDisplayTransform: "none",
        fontDisplayLetterSpacing: -4,
        // Cards
        cardStyle: "bordered",
        cardImageBg: "#12151c",
        cardRadius: 4,
        cardNameFont: "body",
        cardNameStyle: "normal",
        cardNameTransform: "none",
        cardLabelFont: "mono",
        cardLabelTransform: "none",
        cardAlignment: "left",
        // Buttons
        buttonTextTransform: "uppercase",
        buttonLetterSpacing: 8,
        buttonFontFamily: "mono",
        buttonFontWeight: "600",
        buttonTextColorOverride: "#0a0c10",
        buttonBorderWidth: 0,
        // Layout
        pageWidth: 1280,
        sectionSpacing: 64,
        gridColumnGap: 24,
        gridRowGap: 24,
        sectionBorderStyle: "none",
        // Hover
        hoverEffect: "none",
        // Extended palette
        colorSurface: "#12151c",
        colorBorder: "#1f2430",
        colorMuted: "#7a8497",
        // Badges
        badgePosition: "top-left",
        badgeRadius: 4,
        // Header
        headerBorderStyle: "none",
        headerLayout: "split",
        cartType: "drawer",
      },
      customCss: `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');`,
      homepageSections: [
        { id: "s_hero", type: "hero", visible: true, settings: { heroLayout: "editorial", heroAccentLabel: "v2.0 — YENİ KOLEKSİYON", title: "Geleceğin tasarımını bul.", subtitle: "Modern malzemeler, akıllı tasarım, kalıcı kalite.", ctaText: "KEŞFEDİN", ctaUrl: "/urunler" } },
        { id: "s_featured", type: "featured_products", visible: true, settings: { title: "Öne Çıkanlar", count: 8 } },
        { id: "s_newest", type: "new_products", visible: true, settings: { title: "Son Eklenenler", count: 4 } },
      ],
      productPageSettings: { galleryLayout: "thumbnails", descriptionStyle: "tabs", showBreadcrumb: true, breadcrumbSeparator: "/", showRelatedProducts: true, relatedProductsCount: 4 },
      categoryPageSettings: { filterPosition: "sidebar", defaultColumns: 4, showBanner: false, showDescription: false, paginationStyle: "infinite" },
    },
  },
  {
    id: "preset-retro-vintage",
    name: "Retro Vintage",
    createdAt: "2025-01-01T00:00:00Z",
    data: {
      themeSettings: {
        colorPrimary: "#b94a2e",
        colorDark: "#932a0e",
        colorText: "#2b1a0e",
        colorHeading: "#2b1a0e",
        colorBackground: "#f1e3c4",
        colorAccent: "#d49a1f",
        fontBody: "Outfit",
        fontDisplay: "DM Serif Display",
        buttonRadius: "none",
        headerStyle: "static",
        headerLogoHeight: 36,
        // Typography
        fontDisplayWeight: "400",
        fontDisplayStyle: "italic",
        fontDisplayTransform: "none",
        fontDisplayLetterSpacing: -2,
        // Cards
        cardStyle: "bordered",
        cardImageBg: "#e8d4a8",
        cardRadius: 0,
        cardNameFont: "display",
        cardNameStyle: "italic",
        cardNameTransform: "none",
        cardLabelFont: "body",
        cardLabelTransform: "none",
        cardAlignment: "left",
        // Buttons
        buttonTextTransform: "uppercase",
        buttonLetterSpacing: 6,
        buttonFontFamily: "display",
        buttonFontWeight: "400",
        buttonTextColorOverride: "#f1e3c4",
        buttonBorderWidth: 2,
        buttonBorderOpacity: 100,
        // Layout
        pageWidth: 1280,
        sectionSpacing: 64,
        gridColumnGap: 24,
        gridRowGap: 24,
        sectionBorderStyle: "none",
        // Hover
        hoverEffect: "lift",
        // Extended palette
        colorSurface: "#fbf2db",
        colorBorder: "#2b1a0e",
        colorMuted: "#7a6a55",
        // Badges
        badgePosition: "top-left",
        badgeRadius: 0,
        // Header
        headerBorderStyle: "thick",
        cartType: "drawer",
      },
      customCss: `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');`,
      homepageSections: [
        { id: "s_hero", type: "hero", visible: true, settings: { heroLayout: "editorial", heroAccentLabel: "Est. 1985 · Sınırlı Sayıda", title: "Nostaljinin büyüsü.", subtitle: "Geçmişin ruhu, günümüzün kalitesiyle buluşuyor.", ctaText: "KOLEKSİYONU GÖR", ctaUrl: "/urunler" } },
        { id: "s_cats", type: "categories", visible: true, settings: { title: "Kategoriler", count: 6 } },
        { id: "s_featured", type: "featured_products", visible: true, settings: { title: "En Çok Sevilen", count: 4 } },
        { id: "s_newest", type: "new_products", visible: true, settings: { title: "Yeni Gelenler", count: 4 } },
      ],
    },
  },
  {
    id: "preset-couture-noir",
    name: "Couture Noir",
    createdAt: "2025-01-01T00:00:00Z",
    data: {
      themeSettings: {
        colorPrimary: "#e8e0d2",
        colorDark: "#c8b89a",
        colorText: "#ece5d3",
        colorHeading: "#ece5d3",
        colorBackground: "#0a0a0a",
        colorAccent: "#c8a39a",
        fontBody: "Manrope",
        fontDisplay: "Cormorant Garamond",
        buttonRadius: "none",
        headerStyle: "transparent",
        headerLogoHeight: 40,
        // Typography
        fontDisplayWeight: "300",
        fontDisplayStyle: "normal",
        fontDisplayTransform: "none",
        fontDisplayLetterSpacing: 10,
        // Cards
        cardStyle: "borderless",
        cardImageBg: "#171513",
        cardRadius: 0,
        cardNameFont: "display",
        cardNameStyle: "normal",
        cardNameTransform: "none",
        cardLabelFont: "mono",
        cardLabelTransform: "uppercase",
        cardAlignment: "left",
        // Buttons
        buttonTextTransform: "uppercase",
        buttonLetterSpacing: 12,
        buttonFontFamily: "mono",
        buttonFontWeight: "300",
        buttonTextColorOverride: "#0a0a0a",
        buttonBorderWidth: 0,
        // Layout
        pageWidth: 1280,
        sectionSpacing: 64,
        gridColumnGap: 24,
        gridRowGap: 24,
        sectionBorderStyle: "none",
        // Hover
        hoverEffect: "fade",
        // Extended palette
        colorSurface: "#171513",
        colorBorder: "rgba(232,224,210,0.14)",
        colorMuted: "#8b8474",
        // Badges
        badgePosition: "top-left",
        badgeRadius: 0,
        // Header
        headerBorderStyle: "none",
        headerLayout: "minimal",
        cartType: "drawer",
      },
      customCss: `@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,300;0,400;1,300;1,400&family=JetBrains+Mono:wght@400;500&display=swap');`,
      homepageSections: [
        { id: "s_hero", type: "hero", visible: true, settings: { heroLayout: "split", heroAccentLabel: "A / W 2025", title: "Karanlığın ezası.", subtitle: "Zarafet sessiz konuşur. Sınırlı üretim.", ctaText: "KOLEKSİYON", ctaUrl: "/urunler" } },
        { id: "s_featured", type: "featured_products", visible: true, settings: { title: "Seçmeler", count: 4 } },
        { id: "s_newest", type: "new_products", visible: true, settings: { title: "Yeni", count: 4 } },
      ],
    },
  },
  {
    id: "preset-soft-glass",
    name: "Soft Glass",
    createdAt: "2025-01-01T00:00:00Z",
    data: {
      themeSettings: {
        colorPrimary: "#6d5cff",
        colorDark: "#5748e0",
        colorText: "#1b1733",
        colorHeading: "#1b1733",
        colorBackground: "#f0eefb",
        colorAccent: "#ff8fb1",
        fontBody: "Plus Jakarta Sans",
        fontDisplay: "Instrument Serif",
        buttonRadius: "full",
        headerStyle: "transparent",
        headerLogoHeight: 32,
        // Typography
        fontDisplayWeight: "400",
        fontDisplayStyle: "italic",
        fontDisplayTransform: "none",
        fontDisplayLetterSpacing: -3,
        // Cards
        cardStyle: "elevated",
        cardImageBg: "#e8e4f5",
        cardRadius: 20,
        cardNameFont: "display",
        cardNameStyle: "italic",
        cardNameTransform: "none",
        cardLabelFont: "body",
        cardLabelTransform: "none",
        cardAlignment: "left",
        // Buttons
        buttonTextTransform: "none",
        buttonLetterSpacing: 0,
        buttonFontFamily: "body",
        buttonFontWeight: "600",
        buttonTextColorOverride: "#ffffff",
        buttonBorderWidth: 0,
        // Layout
        pageWidth: 1280,
        sectionSpacing: 80,
        gridColumnGap: 24,
        gridRowGap: 24,
        sectionBorderStyle: "none",
        // Hover
        hoverEffect: "lift",
        // Extended palette
        colorSurface: "rgba(255,255,255,0.55)",
        colorBorder: "rgba(255,255,255,0.6)",
        colorMuted: "#7d7896",
        // Badges
        badgePosition: "top-left",
        badgeRadius: 999,
        // Header
        headerBorderStyle: "none",
        cartType: "drawer",
      },
      customCss: ``,
      homepageSections: [
        { id: "s_hero", type: "hero", visible: true, settings: { heroLayout: "editorial", heroAccentLabel: "✦ Yeni Sezon", title: "Şeffaf güzellik.", subtitle: "Cam efekti ile modern bir dokunuş. Her parça özenle seçildi.", ctaText: "Keşfet", ctaUrl: "/urunler" } },
        { id: "s_featured", type: "featured_products", visible: true, settings: { title: "Öne Çıkanlar", count: 8 } },
        { id: "s_newest", type: "new_products", visible: true, settings: { title: "Yeni Gelenler", count: 4 } },
      ],
    },
  },
  {
    id: "preset-heritage-press",
    name: "Heritage Press",
    createdAt: "2025-01-01T00:00:00Z",
    data: {
      themeSettings: {
        colorPrimary: "#7a2818",
        colorDark: "#5c1a0a",
        colorText: "#1f1a12",
        colorHeading: "#1f1a12",
        colorBackground: "#f0e9d6",
        colorAccent: "#7a8b46",
        fontBody: "Manrope",
        fontDisplay: "Cormorant Garamond",
        buttonRadius: "none",
        headerStyle: "static",
        headerLogoHeight: 36,
        // Typography
        fontDisplayWeight: "400",
        fontDisplayStyle: "normal",
        fontDisplayTransform: "none",
        fontDisplayLetterSpacing: 2,
        // Cards
        cardStyle: "bordered",
        cardImageBg: "#e8d4a8",
        cardRadius: 0,
        cardNameFont: "display",
        cardNameStyle: "normal",
        cardNameTransform: "none",
        cardLabelFont: "body",
        cardLabelTransform: "none",
        cardAlignment: "left",
        // Buttons
        buttonTextTransform: "uppercase",
        buttonLetterSpacing: 6,
        buttonFontFamily: "display",
        buttonFontWeight: "400",
        buttonTextColorOverride: "#f0e9d6",
        buttonBorderWidth: 1,
        buttonBorderOpacity: 100,
        // Layout
        pageWidth: 1280,
        sectionSpacing: 64,
        gridColumnGap: 24,
        gridRowGap: 24,
        sectionBorderStyle: "none",
        // Hover
        hoverEffect: "none",
        // Extended palette
        colorSurface: "#fbf6e7",
        colorBorder: "#1f1a12",
        colorMuted: "#6b5d44",
        // Badges
        badgePosition: "top-left",
        badgeRadius: 0,
        // Header
        headerBorderStyle: "medium",
        headerLayout: "centered",
        cartType: "drawer",
      },
      customCss: `@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Cormorant+SC:wght@400;500&display=swap');`,
      homepageSections: [
        { id: "s_hero", type: "hero", visible: true, settings: { heroLayout: "editorial", heroAccentLabel: "CİLT I · 2025", title: "Mirası yaşatan tasarım.", subtitle: "Nesilden nesile taşınan kalite ve zarafet.", ctaText: "KOLEKSİYON", ctaUrl: "/urunler" } },
        { id: "s_cats", type: "categories", visible: true, settings: { title: "Kategoriler", count: 6 } },
        { id: "s_featured", type: "featured_products", visible: true, settings: { title: "Öne Çıkan Parçalar", count: 4 } },
        { id: "s_newest", type: "new_products", visible: true, settings: { title: "Yeni Gelenler", count: 4 } },
      ],
    },
  },
];

export function buildCssVars(t: ThemeSettings): Record<string, string> {
  const r = BUTTON_RADIUS_MAP[t.buttonRadius];

  // Determine header border width from headerBorderStyle
  const hdrBorderWidthMap: Record<NonNullable<ThemeSettings["headerBorderStyle"]>, string> = {
    none: "0px",
    thin: "1px",
    medium: "2px",
    thick: "4px",
  };
  const hdrBorderWidth = hdrBorderWidthMap[t.headerBorderStyle ?? "thin"];

  return {
    "--kt-primary": t.colorPrimary,
    "--kt-dark": t.colorDark,
    "--kt-text": t.colorText,
    "--kt-heading": t.colorHeading,
    "--kt-bg": t.colorBackground,
    "--kt-accent": t.colorAccent,
    "--kt-radius": r,
    "--kt-font-body": `'${t.fontBody}', ui-sans-serif, sans-serif`,
    "--kt-font-display": `'${t.fontDisplay}', Georgia, serif`,
    // Palette overrides — scoped to .kt-public to avoid affecting admin UI
    "--color-rose-500": t.colorPrimary,
    "--color-rose-600": t.colorDark,
    "--color-gold-500": t.colorAccent,
    "--color-ink-700": t.colorHeading,
    "--color-ink-900": t.colorText,
    // Semantic vars — stay on :root for body/html base styles
    "--bg": t.colorBackground,
    "--fg": t.colorText,
    "--primary": t.colorPrimary,
    "--accent": t.colorAccent,
    "--radius": r,
    "--radius-sm": r,
    "--radius-md": r,
    "--radius-lg": r,
    "--radius-xl": r,
    "--font-sans": `'${t.fontBody}', ui-sans-serif, sans-serif`,
    "--font-display": `'${t.fontDisplay}', Georgia, serif`,

    // ── Typography ──────────────────────────────────────────────────────────
    "--kt-body-scale": `${(t.fontBodyScale ?? 100) / 100}`,
    "--kt-display-weight": t.fontDisplayWeight ?? "400",
    "--kt-display-style": t.fontDisplayStyle ?? "normal",
    "--kt-display-transform": t.fontDisplayTransform ?? "none",
    "--kt-display-spacing": `${(t.fontDisplayLetterSpacing ?? 0) / 100}em`,

    // ── Cards ────────────────────────────────────────────────────────────────
    "--kt-card-img-bg": t.cardImageBg ?? t.colorBackground,
    "--kt-card-radius": `${t.cardRadius ?? 8}px`,
    "--kt-card-border-width": t.cardStyle === "bordered" ? "1px" : "0px",
    "--kt-card-shadow": t.cardStyle === "elevated" ? "0 4px 24px rgba(0,0,0,0.10)" : "none",
    "--kt-card-name-style": t.cardNameStyle ?? "normal",
    "--kt-card-name-transform": t.cardNameTransform ?? "none",
    "--kt-card-label-transform": t.cardLabelTransform ?? "none",
    "--kt-card-align": t.cardAlignment ?? "left",
    "--kt-card-name-font-family":
      t.cardNameFont === "display"
        ? `'${t.fontDisplay}', Georgia, serif`
        : t.cardNameFont === "body"
          ? `'${t.fontBody}', ui-sans-serif, sans-serif`
          : "inherit",

    // ── Buttons ──────────────────────────────────────────────────────────────
    "--kt-btn-transform": t.buttonTextTransform ?? "none",
    "--kt-btn-spacing": `${(t.buttonLetterSpacing ?? 0) / 100}em`,
    "--kt-btn-weight": t.buttonFontWeight ?? "500",
    "--kt-btn-text": t.buttonTextColorOverride || "#ffffff",
    "--kt-btn-border-width": `${t.buttonBorderWidth ?? 0}px`,
    "--kt-btn-font-family":
      t.buttonFontFamily === "mono"
        ? `'JetBrains Mono', ui-monospace, monospace`
        : t.buttonFontFamily === "display"
          ? `'${t.fontDisplay}', Georgia, serif`
          : `'${t.fontBody}', ui-sans-serif, sans-serif`,

    // ── Layout ───────────────────────────────────────────────────────────────
    "--kt-page-width": `${t.pageWidth ?? 1280}px`,
    "--kt-section-spacing": `${t.sectionSpacing ?? 64}px`,
    "--kt-grid-col-gap": `${t.gridColumnGap ?? 24}px`,
    "--kt-grid-row-gap": `${t.gridRowGap ?? 24}px`,

    // ── Extended Colors ──────────────────────────────────────────────────────
    "--kt-surface": t.colorSurface ?? t.colorBackground,
    "--kt-border": t.colorBorder ?? "#e2ddd6",
    "--kt-muted": t.colorMuted ?? "#6b6459",

    // ── Hover ────────────────────────────────────────────────────────────────
    "--kt-hover-transform":
      t.hoverEffect === "lift"
        ? "translateY(-4px)"
        : t.hoverEffect === "scale"
          ? "scale(1.02)"
          : "none",
    "--kt-hover-opacity": t.hoverEffect === "fade" ? "0.8" : "1",

    // ── Badges ───────────────────────────────────────────────────────────────
    "--kt-badge-radius": `${t.badgeRadius ?? 4}px`,

    // ── Header border ────────────────────────────────────────────────────────
    "--kt-header-border-width": hdrBorderWidth,
  };
}

// All color and shape vars are scoped to .kt-public so the admin panel
// (which has no .kt-public ancestor) is never affected by theme customisations.
const PUBLIC_SCOPED_VARS = new Set([
  // kt theme color tokens
  "--kt-primary", "--kt-dark", "--kt-text", "--kt-heading", "--kt-bg", "--kt-accent",
  // Tailwind palette overrides
  "--color-rose-500", "--color-rose-600", "--color-gold-500",
  "--color-ink-700", "--color-ink-900",
  // Semantic color aliases
  "--bg", "--fg", "--primary", "--accent",
  // Border radius — scoped so admin buttons keep their default shape
  "--kt-radius", "--radius", "--radius-sm", "--radius-md", "--radius-lg", "--radius-xl",
  // Typography extended
  "--kt-body-scale", "--kt-display-weight", "--kt-display-style",
  "--kt-display-transform", "--kt-display-spacing",
  // Cards
  "--kt-card-img-bg", "--kt-card-radius", "--kt-card-border-width", "--kt-card-shadow",
  "--kt-card-name-style", "--kt-card-name-transform", "--kt-card-label-transform", "--kt-card-align",
  "--kt-card-name-font-family",
  // Buttons
  "--kt-btn-transform", "--kt-btn-spacing", "--kt-btn-weight", "--kt-btn-text", "--kt-btn-border-width",
  "--kt-btn-font-family",
  // Layout
  "--kt-page-width", "--kt-section-spacing", "--kt-grid-col-gap", "--kt-grid-row-gap",
  // Extended colors
  "--kt-surface", "--kt-border", "--kt-muted",
  // Hover
  "--kt-hover-transform", "--kt-hover-opacity",
  // Badges
  "--kt-badge-radius",
  // Header border
  "--kt-header-border-width",
]);

export function buildCssVarString(t: ThemeSettings): string {
  const vars = buildCssVars(t);
  const rootEntries: string[] = [];
  const publicEntries: string[] = [];
  for (const [k, v] of Object.entries(vars)) {
    if (PUBLIC_SCOPED_VARS.has(k)) {
      publicEntries.push(`${k}:${v}`);
    } else {
      rootEntries.push(`${k}:${v}`);
    }
  }
  const root = rootEntries.length ? `:root{${rootEntries.join(";")}}` : "";
  const pub = publicEntries.length ? `.kt-public{${publicEntries.join(";")}}` : "";
  return `${root}${pub}`;
}

export function buildGoogleFontsUrl(bodyFont: string, displayFont: string): string {
  const families = [...new Set([bodyFont, displayFont])]
    .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
