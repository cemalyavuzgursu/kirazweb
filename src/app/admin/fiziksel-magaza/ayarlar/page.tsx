import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const SETTINGS_SECTIONS = [
  { title: "Genel", description: "Mağaza varsayılanları ve temel ayarlar" },
  { title: "Perakende Personeli", description: "Personel erişim ve izinleri" },
  { title: "Konumlar", description: "Mağaza konumları yönetimi" },
  { title: "Dil", description: "POS görüntüleme dili" },
  { title: "Abonelikler", description: "POS Pro özellik yönetimi" },
  { title: "Özelleştirme", description: "POS düzenleyicisinden yönetim" },
  { title: "POS Uygulaması", description: "Akıllı ızgara, kilit ekranı, ödeme ve uygulamalar" },
  { title: "Müşteri Ekranları", description: "Bekleme ekranı, dijital makbuzlar ve teşekkür ekranı" },
  { title: "Basılı Makbuzlar", description: "Makbuz düzeni ve içeriği" },
  { title: "Kasa", description: "Nakit yönetimi" },
  { title: "İadeler", description: "İade politikası ve mağaza kredisi ayarları" },
];

export default async function FizikselMagazaAyarlarPage() {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/fiziksel-magaza/ayarlar";

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title="POS Ayarları" description="Fiziksel mağaza yapılandırması" />

      <Card>
        <div className="divide-y divide-cream-100">
          {SETTINGS_SECTIONS.map((section) => (
            <div
              key={section.title}
              className="flex items-center justify-between px-5 py-4 hover:bg-cream-50/50 transition"
            >
              <div>
                <p className="text-sm font-medium text-ink-700">{section.title}</p>
                <p className="text-xs text-ink-400 mt-0.5">{section.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                  Yakında
                </span>
                <ChevronRight className="h-4 w-4 text-ink-300" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AdminShell>
  );
}
