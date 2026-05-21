import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { saveFaqItem } from "@/server/actions/faq";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FaqItemEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAdmin(["content:write"]);
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/sss";

  const item = await prisma.faqItem.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="SSS Düzenle"
        action={<Link href="/admin/sss"><Button variant="outline">Geri</Button></Link>}
      />
      <Card className="max-w-lg">
        <CardContent className="space-y-4">
          <form action={saveFaqItem} className="space-y-4">
            <input type="hidden" name="id" value={item.id} />
            <div>
              <Label htmlFor="question">Soru *</Label>
              <Input id="question" name="question" required defaultValue={item.question} />
            </div>
            <div>
              <Label htmlFor="answer">Cevap *</Label>
              <Textarea id="answer" name="answer" required rows={5} defaultValue={item.answer} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortOrder">Sıra</Label>
                <Input id="sortOrder" name="sortOrder" type="number" defaultValue={item.sortOrder} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isActive" defaultChecked={item.isActive} className="rounded" />
                  <span className="text-sm text-ink-700">Aktif</span>
                </label>
              </div>
            </div>
            <Button type="submit">Kaydet</Button>
          </form>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
