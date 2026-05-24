import { PrismaClient, BannerPosition, MenuLocation } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ALL_PERMISSIONS } from "../src/lib/permissions";

const prisma = new PrismaClient();

const EDITOR_PERMISSIONS = [
  "products:read", "products:write",
  "orders:read", "orders:write",
  "customers:read",
  "content:write",
  "media:upload",
  "coupons:manage",
  "seo:manage",
];

async function main() {
  // Already seeded — skip to avoid overwriting user data on every restart
  const existing = await prisma.user.findFirst({ where: { role: { name: "ADMIN" } } });
  if (existing) {
    console.log("✓ Veritabanı zaten seed edilmiş, atlanıyor.");
    return;
  }

  console.log("Seed başlıyor...");

  // --- System roles ---
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: { permissions: ALL_PERMISSIONS, isSystem: true },
    create: { name: "ADMIN", permissions: ALL_PERMISSIONS, isSystem: true },
  });
  await prisma.role.upsert({
    where: { name: "EDITOR" },
    update: { permissions: EDITOR_PERMISSIONS, isSystem: true },
    create: { name: "EDITOR", permissions: EDITOR_PERMISSIONS, isSystem: true },
  });
  console.log("✔ Sistem rolleri oluşturuldu");

  // --- Admin user ---
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@kiraztasarim.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "kiraz2026";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Yönetici",
      passwordHash,
      roleId: adminRole.id,
    },
  });
  console.log(`✔ Admin: ${adminEmail} / ${adminPassword}`);

  // --- Default settings ---
  const defaultSettings: Array<{ key: string; value: any; isSecret?: boolean }> = [
    { key: "site.name", value: "Kiraz Tasarım" },
    { key: "site.tagline", value: "Çeyizinizin İlmek İlmek Mührü" },
    { key: "site.description", value: "Ev aksesuarları, çeyiz hazırlığı ve özel tasarım ürünler. El emeği ile hazırlanan, sıcak yuvanız için özenle seçilmiş parçalar." },
    { key: "site.logo", value: "/logo.svg" },
    { key: "site.favicon", value: "/favicon.ico" },
    { key: "site.contact.phone", value: "+90 555 555 5555" },
    { key: "site.contact.email", value: "info@kiraztasarim.com" },
    { key: "site.contact.address", value: "Türkiye" },
    { key: "site.social.instagram", value: "https://www.instagram.com/kiraztasarim/" },
    { key: "site.social.facebook", value: "" },
    { key: "site.social.tiktok", value: "" },
    { key: "site.workingHours", value: "Hafta içi 09:00 - 18:00" },

    { key: "shipping.flatRate", value: 89.9 },
    { key: "shipping.freeThreshold", value: 1500 },
    { key: "shipping.carriers", value: ["Yurtiçi Kargo", "Aras Kargo", "MNG Kargo"] },

    { key: "payment.iyzico.enabled", value: false },
    { key: "payment.iyzico.sandbox", value: true },
    { key: "payment.iyzico.force3ds", value: true },
    { key: "payment.iyzico.apiKey", value: "", isSecret: true },
    { key: "payment.iyzico.secret", value: "", isSecret: true },

    { key: "payment.bankTransfer.enabled", value: false },
    { key: "payment.bankTransfer.details", value: "" },

    { key: "whatsapp.enabled", value: true },
    { key: "whatsapp.number", value: "905555555555" }, // E.164 without +
    { key: "whatsapp.messageTemplate", value: "Merhaba 👋 Aşağıdaki siparişimi vermek istiyorum:\n\n{ITEMS}\n\nToplam: {TOTAL} ₺\nSipariş No: {ORDER_NUMBER}\nAd Soyad: {NAME}\nTelefon: {PHONE}\nAdres: {ADDRESS}\n\nSipariş takip: {TRACK_URL}" },

    { key: "seo.titleTemplate", value: "%s | Kiraz Tasarım" },
    { key: "seo.defaultTitle", value: "Kiraz Tasarım — Çeyiz ve Ev Aksesuarları" },
    { key: "seo.defaultDescription", value: "El emeği ile hazırlanan çeyiz ve ev aksesuarları. Tasarım vazolar, dekoratif objeler, mutfak takımları ve daha fazlası Kiraz Tasarım'da." },
    { key: "seo.defaultOgImage", value: "/og-default.png" },
    { key: "seo.googleTagManagerId", value: "" },
    { key: "seo.googleAnalyticsId", value: "" },
    { key: "seo.metaPixelId", value: "" },
    { key: "seo.searchConsoleVerification", value: "" },
    { key: "seo.robotsTxtExtra", value: "" },

    { key: "email.fromName", value: "Kiraz Tasarım" },
    { key: "email.fromAddress", value: "siparis@kiraztasarim.com" },
    { key: "email.replyTo", value: "info@kiraztasarim.com" },

    { key: "kvkk.cookieBanner", value: true },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        isSecret: setting.isSecret ?? false,
      },
    });
  }
  console.log(`✔ ${defaultSettings.length} ayar oluşturuldu`);

  // --- Categories ---
  const categories = [
    { slug: "vazo-saksi", name: "Vazo & Saksı", description: "Tasarım vazolar ve modern saksılar", sortOrder: 1 },
    { slug: "mum-mumluk", name: "Mum & Mumluk", description: "Aromaterapi mumları ve dekoratif mumluklar", sortOrder: 2 },
    { slug: "biblo-dekor", name: "Biblo & Dekor", description: "Şık biblolar ve dekoratif objeler", sortOrder: 3 },
    { slug: "mutfak", name: "Mutfak", description: "Mutfak takımları ve servis ürünleri", sortOrder: 4 },
    { slug: "ceyiz-seti", name: "Çeyiz Seti", description: "Hazır çeyiz setleri ve özel kombinler", sortOrder: 5 },
    { slug: "tepsi-servis", name: "Tepsi & Servis", description: "Şık tepsiler ve servis grupları", sortOrder: 6 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        ...cat,
        seoTitle: cat.name,
        seoDescription: cat.description,
      },
    });
  }
  console.log(`✔ ${categories.length} kategori oluşturuldu`);

  // --- Demo products ---
  const vazoCategory = await prisma.category.findUnique({ where: { slug: "vazo-saksi" } });
  const mumCategory = await prisma.category.findUnique({ where: { slug: "mum-mumluk" } });
  const dekorCategory = await prisma.category.findUnique({ where: { slug: "biblo-dekor" } });

  const demoProducts = [
    {
      slug: "krem-seramik-vazo",
      name: "Krem Seramik Vazo",
      shortDescription: "El yapımı, modern hatlı seramik vazo",
      description: "<p>El yapımı, krem rengi seramik vazo. Modern ve minimal hatları ile her ev dekorasyonuna uyum sağlar. Yapay veya doğal çiçeklerle kullanabilirsiniz.</p><ul><li>Yükseklik: 28 cm</li><li>Malzeme: Seramik</li><li>Renk: Krem</li></ul>",
      price: 449.9,
      compareAtPrice: 599.9,
      stock: 12,
      categoryId: vazoCategory?.id,
      isFeatured: true,
      sku: "KT-VZO-001",
    },
    {
      slug: "soya-mumu-tarcin",
      name: "Soya Mumu — Tarçın & Vanilya",
      shortDescription: "Doğal soya mumu, 200g",
      description: "<p>%100 doğal soya bazlı mum. Tarçın ve vanilya esansı ile evinizi sıcak bir kokuyla doldurur. Yaklaşık 35 saat yanma süresi.</p>",
      price: 189.9,
      stock: 30,
      categoryId: mumCategory?.id,
      isFeatured: true,
      sku: "KT-MUM-002",
    },
    {
      slug: "altin-detayli-mumluk",
      name: "Altın Detaylı Mumluk Seti",
      shortDescription: "3'lü pirinç mumluk seti",
      description: "<p>Altın renkli pirinç mumluk seti. Üç farklı boyda. Yemek masası ve konsol süslemeleri için ideal.</p>",
      price: 329.9,
      stock: 8,
      categoryId: dekorCategory?.id,
      isFeatured: true,
      sku: "KT-DEK-003",
    },
    {
      slug: "rattan-dokuma-sepet",
      name: "Rattan Dokuma Sepet",
      shortDescription: "El dokuması doğal sepet",
      description: "<p>Doğal rattan ile el dokuması sepet. Banyo, salon veya yatak odası organizasyonu için kullanışlı.</p>",
      price: 259.9,
      stock: 15,
      categoryId: dekorCategory?.id,
      sku: "KT-DEK-004",
    },
    {
      slug: "porselen-cay-fincan-seti",
      name: "Porselen Çay Fincan Seti — 6'lı",
      shortDescription: "İnce porselen çay fincanı seti",
      description: "<p>İnce işçilikli porselen çay fincanı seti. Tabaklı, 6 kişilik. Çeyiz hazırlığı için ideal.</p>",
      price: 549.9,
      compareAtPrice: 749.9,
      stock: 20,
      categoryId: dekorCategory?.id,
      isFeatured: true,
      sku: "KT-MTF-005",
    },
    {
      slug: "mermer-tepsi-altin-tutamac",
      name: "Mermer Tepsi — Altın Tutamaçlı",
      shortDescription: "Doğal mermer servis tepsisi",
      description: "<p>Doğal beyaz mermerden, altın renkli pirinç tutamaçlı şık servis tepsisi. Kahve servisleri ve özel günler için.</p>",
      price: 389.9,
      stock: 7,
      categoryId: dekorCategory?.id,
      sku: "KT-DEK-006",
    },
  ];

  for (const product of demoProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        seoTitle: product.name,
        seoDescription: product.shortDescription ?? "",
      },
    });
  }
  console.log(`✔ ${demoProducts.length} demo ürün oluşturuldu`);

  // --- Banners ---
  await prisma.banner.deleteMany({ where: { title: { startsWith: "[Demo]" } } });
  await prisma.banner.createMany({
    data: [
      {
        title: "[Demo] Yeni Sezon Çeyiz Koleksiyonu",
        subtitle: "Sıcak bir yuva için özenle seçilmiş tasarımlar",
        image: "/banners/banner-1.jpg",
        ctaText: "Koleksiyonu Keşfet",
        link: "/urunler",
        position: BannerPosition.HERO,
        sortOrder: 1,
      },
      {
        title: "[Demo] Vazo & Saksı Koleksiyonu",
        subtitle: "El yapımı seramik parçalar",
        image: "/banners/banner-2.jpg",
        ctaText: "Vazoları Gör",
        link: "/kategori/vazo-saksi",
        position: BannerPosition.HERO,
        sortOrder: 2,
      },
    ],
  });
  console.log(`✔ Demo banner'lar oluşturuldu`);

  // --- CMS Pages ---
  const pages = [
    {
      slug: "hakkimizda",
      title: "Hakkımızda",
      content: "<h2>Kiraz Tasarım</h2><p>Kiraz Tasarım, ev aksesuarları ve çeyiz hazırlığında yıllardır titizlikle çalışan bir markadır. Her ürünümüz, sıcak bir yuvanın detaylarına olan saygımızla seçilir.</p>",
      seoTitle: "Hakkımızda",
      seoDescription: "Kiraz Tasarım hikâyemiz, değerlerimiz ve çeyiz hazırlığında neden tercih edildiğimiz.",
    },
    {
      slug: "iletisim",
      title: "İletişim",
      content: "<p>Bizimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.</p>",
      seoTitle: "İletişim",
      seoDescription: "Kiraz Tasarım ile iletişim — telefon, e-posta ve mesajlaşma kanalları.",
    },
    {
      slug: "sss",
      title: "Sıkça Sorulan Sorular",
      content: "<h3>Siparişim ne zaman elime ulaşır?</h3><p>Stoktaki ürünler 1-3 iş günü içinde kargoya verilir.</p>",
      seoTitle: "SSS — Sıkça Sorulan Sorular",
      seoDescription: "Kargo, iade, ödeme ve ürünlerle ilgili sıkça sorulan sorular.",
    },
    {
      slug: "teslimat-iade",
      title: "Teslimat ve İade",
      content: "<h3>Teslimat</h3><p>Anlaşmalı kargolarımız ile Türkiye'nin her yerine teslimat yapıyoruz.</p><h3>İade</h3><p>14 gün içinde iade hakkınız bulunmaktadır.</p>",
      seoTitle: "Teslimat ve İade Koşulları",
    },
    {
      slug: "gizlilik",
      title: "Gizlilik Politikası",
      content: "<p>Kişisel verilerinizin korunması bizim için önemlidir.</p>",
      seoTitle: "Gizlilik Politikası",
    },
    {
      slug: "kvkk",
      title: "KVKK Aydınlatma Metni",
      content: "<p>6698 sayılı KVKK kapsamında aydınlatma metni.</p>",
      seoTitle: "KVKK Aydınlatma Metni",
    },
    {
      slug: "mesafeli-satis",
      title: "Mesafeli Satış Sözleşmesi",
      content: "<p>Mesafeli satış sözleşmesi metni.</p>",
      seoTitle: "Mesafeli Satış Sözleşmesi",
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
  console.log(`✔ ${pages.length} CMS sayfası oluşturuldu`);

  // --- Nav menus ---
  await prisma.navMenu.deleteMany({});
  await prisma.navMenu.createMany({
    data: [
      { location: MenuLocation.HEADER, label: "Ana Sayfa", url: "/", sortOrder: 1 },
      { location: MenuLocation.HEADER, label: "Tüm Ürünler", url: "/urunler", sortOrder: 2 },
      { location: MenuLocation.HEADER, label: "Vazo & Saksı", url: "/kategori/vazo-saksi", sortOrder: 3 },
      { location: MenuLocation.HEADER, label: "Mum & Mumluk", url: "/kategori/mum-mumluk", sortOrder: 4 },
      { location: MenuLocation.HEADER, label: "Çeyiz Seti", url: "/kategori/ceyiz-seti", sortOrder: 5 },
      { location: MenuLocation.HEADER, label: "Hakkımızda", url: "/hakkimizda", sortOrder: 6 },
      { location: MenuLocation.HEADER, label: "İletişim", url: "/iletisim", sortOrder: 7 },

      { location: MenuLocation.FOOTER, label: "Hakkımızda", url: "/hakkimizda", sortOrder: 1 },
      { location: MenuLocation.FOOTER, label: "İletişim", url: "/iletisim", sortOrder: 2 },
      { location: MenuLocation.FOOTER, label: "SSS", url: "/sss", sortOrder: 3 },
      { location: MenuLocation.FOOTER, label: "Teslimat & İade", url: "/teslimat-iade", sortOrder: 4 },
      { location: MenuLocation.FOOTER, label: "Gizlilik", url: "/gizlilik", sortOrder: 5 },
      { location: MenuLocation.FOOTER, label: "KVKK", url: "/kvkk", sortOrder: 6 },
      { location: MenuLocation.FOOTER, label: "Mesafeli Satış", url: "/mesafeli-satis", sortOrder: 7 },
    ],
  });
  console.log(`✔ Header ve Footer menüleri oluşturuldu`);

  // --- FAQ Items ---
  const faqItems = [
    { question: "Siparişim ne zaman elime ulaşır?", answer: "Stoktaki ürünler 1-3 iş günü içinde kargoya verilir. Kargo süresi bölgeye göre 1-3 iş günü ek süre alabilir.", sortOrder: 1 },
    { question: "Hangi kargo firmalarıyla çalışıyorsunuz?", answer: "Yurtiçi Kargo, Aras Kargo ve MNG Kargo ile çalışmaktayız. Sipariş tamamlandıktan sonra kargo takip numaranız SMS ve e-posta ile iletilir.", sortOrder: 2 },
    { question: "Ücretsiz kargo var mı?", answer: "1.500 ₺ ve üzeri siparişlerde kargo ücretsizdir. Bu tutarın altındaki siparişlerde sabit kargo ücreti uygulanır.", sortOrder: 3 },
    { question: "İade ve değişim koşulları nelerdir?", answer: "Ürünü teslim aldığınız tarihten itibaren 14 gün içinde iade veya değişim talebinde bulunabilirsiniz. Orijinal ambalajında ve kullanılmamış ürünler kabul edilir.", sortOrder: 4 },
    { question: "Siparişimi nasıl takip edebilirim?", answer: "Sipariş tamamlandıktan sonra size gönderilen e-postadaki 'Siparişi Görüntüle' bağlantısını kullanarak siparişinizi anlık takip edebilirsiniz.", sortOrder: 5 },
    { question: "Toplu veya kurumsal alım yapabilir miyim?", answer: "Evet, toplu ve kurumsal alımlar için lütfen info@kiraztasarim.com adresinden veya WhatsApp üzerinden bizimle iletişime geçin. Özel fiyatlandırma sağlıyoruz.", sortOrder: 6 },
  ];

  for (const item of faqItems) {
    await prisma.faqItem.upsert({
      where: { id: `faq_seed_${item.sortOrder}` },
      update: {},
      create: { id: `faq_seed_${item.sortOrder}`, ...item },
    });
  }
  console.log(`✔ ${faqItems.length} SSS sorusu oluşturuldu`);

  console.log("\n✅ Seed tamamlandı!\n");
  console.log(`   Admin paneli giriş: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
