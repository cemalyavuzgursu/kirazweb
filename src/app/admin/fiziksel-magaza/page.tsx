import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import {
  Smartphone,
  Monitor,
  Printer,
  Banknote,
  RotateCcw,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

const FEATURE_CARDS = [
  {
    icon: Smartphone,
    title: "Mobil POS Uygulaması",
    description: "Akıllı ızgara ve kilit ekranı",
  },
  {
    icon: Monitor,
    title: "Müşteri Ekranı",
    description: "Dijital makbuzlar ve teşekkür ekranı",
  },
  {
    icon: Printer,
    title: "Basılı Makbuzlar",
    description: "Makbuz düzeni ve içeriği",
  },
  {
    icon: Banknote,
    title: "Nakit Yönetimi",
    description: "Kasa açılış/kapanış raporları",
  },
  {
    icon: RotateCcw,
    title: "İadeler",
    description: "Politika ve mağaza kredisi",
  },
  {
    icon: Users,
    title: "Müşteri Segmentleri",
    description: "POS müşteri takibi",
  },
];

export default async function FizikselMagazaPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/fiziksel-magaza";

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Fiziksel Mağaza"
        description="Satış Noktası (POS)"
      />

      {/* Notice */}
      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        POS mobil uygulaması yakında. Satış yönetimi web arayüzü üzerinden kullanılabilecek.
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Bugünkü Satışlar", desc: "Toplam gelir" },
          { label: "İşlem Sayısı", desc: "Tamamlanan işlem" },
          { label: "Ort. Sepet Tutarı", desc: "Ortalama değer" },
          { label: "Aktif Konum", desc: "Açık mağazalar" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-cream-200 p-5">
            <p className="text-xs text-ink-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-display text-ink-700">—</p>
            <p className="text-xs text-ink-400 mt-1">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <h2 className="font-display text-lg text-ink-700 mb-4">Özellikler</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURE_CARDS.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-violet-50">
                    <Icon className="h-5 w-5 text-violet-500" />
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                    Yakında
                  </span>
                </div>
                <p className="text-sm font-medium text-ink-700 mb-1">{f.title}</p>
                <p className="text-xs text-ink-400">{f.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AdminShell>
  );
}
