import { headers } from "next/headers";
import { Pencil, Trash2, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { saveFaqItem, deleteFaqItem } from "@/server/actions/faq";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function FaqAdminPage() {
  const session = await requireAdmin(["content:write"]);
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/sss";

  const items = await prisma.faqItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader title="SSS Yönetimi" description="Sıkça Sorulan Sorular — JSON-LD ile Google'da öne çıkar" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add new item */}
        <Card>
          <CardContent className="space-y-4">
            <h3 className="font-display text-lg text-ink-700">Yeni Soru Ekle</h3>
            <form action={saveFaqItem} className="space-y-3">
              <div>
                <Label htmlFor="question">Soru *</Label>
                <Input id="question" name="question" required placeholder="Kargo süresi ne kadar?" />
              </div>
              <div>
                <Label htmlFor="answer">Cevap *</Label>
                <Textarea id="answer" name="answer" required rows={4} placeholder="Siparişleriniz 3-5 iş günü içinde..." />
              </div>
              <div>
                <Label htmlFor="sortOrder">Sıra</Label>
                <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" className="w-24" />
              </div>
              <Button type="submit">
                <Plus className="h-4 w-4 mr-1" /> Ekle
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Item list */}
        <div className="space-y-3">
          {items.length === 0 ? (
            <Card>
              <CardContent>
                <p className="text-sm text-ink-300 py-8 text-center">Henüz soru yok.</p>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id}>
                <CardContent className="space-y-2">
                  <p className="font-medium text-ink-700 text-sm">{item.question}</p>
                  <p className="text-ink-500 text-xs line-clamp-2">{item.answer}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-cream-100 text-ink-400"}`}>
                      {item.isActive ? "Aktif" : "Gizli"}
                    </span>
                    <span className="text-xs text-ink-300">Sıra: {item.sortOrder}</span>
                    <div className="ml-auto flex gap-2">
                      <a href={`/admin/sss/${item.id}`} className="text-ink-300 hover:text-ink-700">
                        <Pencil className="h-4 w-4" />
                      </a>
                      <form action={deleteFaqItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="text-ink-300 hover:text-rose-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}
