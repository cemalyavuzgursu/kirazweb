export const PERMISSION_GROUPS = [
  {
    group: "Ürünler",
    permissions: [
      { key: "products:read",   label: "Görüntüle" },
      { key: "products:write",  label: "Düzenle / Ekle" },
      { key: "products:delete", label: "Sil" },
    ],
  },
  {
    group: "Siparişler",
    permissions: [
      { key: "orders:read",  label: "Görüntüle" },
      { key: "orders:write", label: "Düzenle" },
    ],
  },
  {
    group: "Müşteriler",
    permissions: [
      { key: "customers:read", label: "Görüntüle" },
    ],
  },
  {
    group: "İçerik (Sayfalar, Bannerlar, Kategoriler)",
    permissions: [
      { key: "content:write",  label: "Düzenle / Ekle" },
      { key: "content:delete", label: "Sil" },
    ],
  },
  {
    group: "Medya",
    permissions: [
      { key: "media:upload", label: "Görsel Yükle" },
    ],
  },
  {
    group: "Kuponlar",
    permissions: [
      { key: "coupons:manage", label: "Yönet" },
    ],
  },
  {
    group: "Kullanıcılar",
    permissions: [
      { key: "users:manage", label: "Yönet" },
    ],
  },
  {
    group: "Roller",
    permissions: [
      { key: "roles:manage", label: "Yönet" },
    ],
  },
  {
    group: "Ayarlar",
    permissions: [
      { key: "settings:manage", label: "Yönet" },
    ],
  },
  {
    group: "SEO",
    permissions: [
      { key: "seo:manage", label: "Yönet" },
    ],
  },
] as const;

export type Permission = typeof PERMISSION_GROUPS[number]["permissions"][number]["key"];

export const ALL_PERMISSIONS: string[] = PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.key),
);
