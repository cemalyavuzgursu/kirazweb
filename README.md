# Kiraz Tasarım — E-Ticaret + Yönetim Paneli

Kiraz Çeyiz ve Tasarım için, **Next.js 15 + Prisma + PostgreSQL** üzerine inşa edilmiş tam kapsamlı e-ticaret platformu.

- 🌐 **Public site**: ürün katalog, sepet, checkout (iyzico + WhatsApp)
- 🔒 **Yönetim paneli**: subdomain üzerinden (`admin.alanadi.com`), aynı uygulama
- 💳 **iyzico Sanal POS** entegrasyonu (admin'den aç/kapa)
- 💬 **WhatsApp ile sipariş** her zaman aktif
- 📦 **Cloudflare Tunnel** ile statik IP olmadan, port açmadan internete açılır
- ✉️ **Resend HTTPS API** ile e-posta (SMTP gerekmez)
- 🔍 **SEO**: sitemap, robots, JSON-LD, OG, admin'den meta yönetimi

---

## Hızlı Başlangıç (Geliştirme)

```powershell
# 1) bağımlılıkları yükle
npm install

# 2) .env oluştur
copy .env.example .env
# ENCRYPTION_KEY için: 64 hex karakter (örn: openssl rand -hex 32)
# NEXTAUTH_SECRET için: en az 16 karakter random string

# 3) PostgreSQL'i Docker ile başlat
docker compose up -d db

# 4) migration + seed
npx prisma migrate dev --name init
npm run db:seed

# 5) dev sunucusu
npm run dev
```

- Site: http://localhost:3000
- Yönetim paneli: http://admin.localhost:3000 (Windows hosts dosyasına `127.0.0.1 admin.localhost` ekleyin)
- Varsayılan giriş: `admin@kiraztasarim.com` / `kiraz2026`

---

## Üretim Kurulumu (Müşteri PC'sine)

### Gereksinimler
- Windows 10/11 (Pro önerilir) veya Linux
- **Docker Desktop** kurulu
- Müşteri domain'i **Cloudflare**'da yönetiliyor (zorunlu)
- İnternet bağlantısı (statik IP gerekmez)

### Adım 1 — Proje dosyalarını PC'ye al

```powershell
# Bu klasörü PC'nin uygun bir yerine kopyalayın, örn:
# C:\kiraz-tasarim
```

### Adım 2 — `.env` dosyasını oluştur

`.env.example`'i `.env` olarak kopyalayın ve aşağıdaki değerleri doldurun:

```ini
DATABASE_URL=postgresql://kiraz:GÜÇLÜ_BIR_PAROLA@db:5432/kiraz?schema=public
POSTGRES_PASSWORD=GÜÇLÜ_BIR_PAROLA

NEXTAUTH_SECRET=...        # openssl rand -base64 32
NEXTAUTH_URL=https://admin.kiraztasarim.com
NEXT_PUBLIC_SITE_URL=https://kiraztasarim.com
NEXT_PUBLIC_SITE_HOST=kiraztasarim.com
NEXT_PUBLIC_ADMIN_HOST=admin.kiraztasarim.com

ENCRYPTION_KEY=...         # openssl rand -hex 32

RESEND_API_KEY=re_xxx
EMAIL_FROM=Kiraz Tasarım <siparis@kiraztasarim.com>
```

### Adım 3 — Cloudflare Tunnel kur

```powershell
# Windows için cloudflared CLI:
winget install --id Cloudflare.cloudflared

# Yetkilendirme (tarayıcı açılır)
cloudflared tunnel login

# Tunnel oluştur
cloudflared tunnel create kiraz-prod
# Üretilen <tunnel-id>.json dosyasını ./cloudflared/ klasörüne kopyalayın

# config.yml'i kopyala ve düzenle
copy cloudflared\config.example.yml cloudflared\config.yml
# config.yml içindeki <tunnel-id> ve hostname'leri kendi domain'inizle değiştirin
```

**Cloudflare Dashboard** → DNS → bu CNAME'leri ekleyin (Proxied/turuncu bulut açık olmalı):

| Tip | İsim | İçerik |
|---|---|---|
| CNAME | @ | `<tunnel-id>.cfargotunnel.com` |
| CNAME | www | `<tunnel-id>.cfargotunnel.com` |
| CNAME | admin | `<tunnel-id>.cfargotunnel.com` |

### Adım 4 — Resend domain doğrulama

1. https://resend.com → Domains → Add domain (`kiraztasarim.com`)
2. Resend size birkaç DNS kaydı verir (SPF, DKIM)
3. Bu kayıtları Cloudflare DNS'e ekleyin
4. "Verify" butonuna basın → birkaç dakika içinde `Verified` olur
5. Resend → API Keys → "Production" key oluşturun, `.env`'deki `RESEND_API_KEY`'e yazın

### Adım 5 — Servisleri başlat

```powershell
# PostgreSQL + Web uygulaması
docker compose up -d --build db web

# Migration
docker compose exec web npx prisma migrate deploy
docker compose exec web npm run db:seed

# Cloudflare Tunnel
docker compose --profile tunnel up -d cloudflared

# Yedekleme cron'u (opsiyonel, günlük)
docker compose --profile backup up -d backup
```

Site artık `https://kiraztasarim.com` ve yönetim paneli `https://admin.kiraztasarim.com` adreslerinde aktif.

### Adım 6 — Yönetim paneline giriş

İlk giriş için seed sırasında oluşturulan hesabı kullanın:

- E-posta: `admin@kiraztasarim.com`
- Şifre: `kiraz2026`

**Hemen şifrenizi değiştirin!** (Faz 7'de Kullanıcı Yönetimi ekranı geldiğinde.)

---

## PC Açık Tutma — Önemli!

> "PC kapalı = site kapalı" — siteniz, ofisteki bu PC'de çalışıyor.

- **UPS** alın (kesintisiz güç kaynağı): elektrik kesintilerinde site offline olmaz
- **BIOS'ta otomatik açılma**:
  - Power On After Power Loss → **Always On** (elektrik gelince PC otomatik açılsın)
- **Windows güç ayarları**:
  - Denetim Masası → Güç Seçenekleri → Yüksek Performans
  - Uyku/Hibernate → **Asla**
  - Sabit Disk Kapatma → **Asla**
- **Windows Update**: planlı saatlerde (gece) otomatik
- **Bilgisayarı kapatmayın** — sadece restart gerektiğinde restart edin

---

## Yedekleme & Geri Yükleme

### Otomatik (önerilir)
`backup` servisi günlük olarak çalışır:
- `backups/db-YYYYMMDD-HHMMSS.sql.gz` — veritabanı
- `backups/uploads-YYYYMMDD-HHMMSS.tar.gz` — görseller
- 14 günden eski yedekler otomatik silinir

```powershell
docker compose --profile backup up -d backup
```

### Manuel yedekleme

```powershell
docker compose exec backup /backup.sh
```

### Geri yükleme

```powershell
# DB
gunzip -c backups/db-XXX.sql.gz | docker compose exec -T db psql -U kiraz kiraz

# Uploads
tar -xzf backups/uploads-XXX.tar.gz -C public/
```

> **Önemli**: `backups/` klasörünü harici bir disk veya bulut depolamaya da düzenli olarak kopyalayın.

---

## Bakım Komutları

```powershell
# Logları izle
docker compose logs -f web
docker compose logs -f cloudflared

# Yeniden başlat
docker compose restart web

# Güncellemeleri çek (dosyalar değiştiyse)
docker compose up -d --build web

# Veritabanına psql ile bağlan
docker compose exec db psql -U kiraz kiraz

# Prisma Studio (DB GUI)
docker compose exec web npx prisma studio
```

---

## Proje Yapısı

```
kiraz-tasarim/
├── docker-compose.yml      # web + db + cloudflared + backup
├── Dockerfile              # Next.js production build
├── cloudflared/            # tunnel config + credentials
├── prisma/
│   ├── schema.prisma       # tüm DB modelleri
│   └── seed.ts             # ilk admin + demo veri
├── public/
│   └── uploads/            # kullanıcı görselleri (kalıcı volume)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (public)/       # ana site (Faz 3+)
│   │   ├── admin/          # yönetim paneli
│   │   └── api/            # webhooks, upload, auth
│   ├── lib/                # db, auth, settings, iyzico, whatsapp, seo
│   ├── components/         # UI (shadcn/ui)
│   └── middleware.ts       # subdomain routing
└── scripts/
    └── backup.sh
```

---

## Geliştirme Yol Haritası

- [x] **Faz 1** — Next.js + Prisma + Docker + Auth + admin login
- [ ] **Faz 2** — Admin: ürün/kategori/banner CRUD, settings, media
- [ ] **Faz 3** — Public site, kategori, ürün detay, SEO altyapısı
- [ ] **Faz 4** — Sepet + checkout (iyzico + WhatsApp)
- [ ] **Faz 5** — Sipariş yönetimi + Resend e-posta
- [ ] **Faz 6** — CMS sayfa + SEO yönetim paneli
- [ ] **Faz 7** — Kupon, çoklu kullanıcı, KVKK, polish
- [ ] **Faz 8** — Production deploy + müşteri kullanım kılavuzu

---

## Lisans

Özel proje — Kiraz Tasarım. Tüm hakları saklıdır.
