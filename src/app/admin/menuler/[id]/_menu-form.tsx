"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { MenuLocation } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMenuItem, deleteMenuItem } from "@/server/actions/menus";

type NavMenuSummary = {
  id: string;
  label: string;
  url: string;
};

type MenuFormProps = {
  id?: string;
  location: MenuLocation;
  label?: string;
  url?: string;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  topLevelItems: NavMenuSummary[];
  isNew: boolean;
};

export function MenuForm({
  id,
  location,
  label,
  url,
  parentId,
  sortOrder,
  isActive,
  topLevelItems,
  isNew,
}: MenuFormProps) {
  const [deleting, startDelete] = useTransition();

  function handleDelete() {
    if (!id) return;
    startDelete(async () => {
      await deleteMenuItem(id);
    });
  }

  return (
    <form action={saveMenuItem} className="space-y-6 max-w-xl">
      {id && <input type="hidden" name="id" value={id} />}

      <Card>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="location">Menü Konumu</Label>
            {isNew ? (
              <select
                id="location"
                name="location"
                defaultValue={location}
                className="mt-1 w-full rounded-md border border-cream-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <option value="HEADER">Header</option>
                <option value="FOOTER">Footer</option>
              </select>
            ) : (
              <>
                <input type="hidden" name="location" value={location} />
                <p className="mt-1 text-sm text-ink-700 rounded-md border border-cream-200 bg-cream-50 px-3 py-2">
                  {location === "HEADER" ? "Header" : "Footer"}
                </p>
              </>
            )}
          </div>

          <div>
            <Label htmlFor="label">Etiket *</Label>
            <Input
              id="label"
              name="label"
              defaultValue={label}
              required
              placeholder="Ürünler"
            />
          </div>

          <div>
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              name="url"
              defaultValue={url}
              required
              placeholder="/urunler"
            />
          </div>

          <div>
            <Label htmlFor="parentId">Üst Öğe</Label>
            <select
              id="parentId"
              name="parentId"
              defaultValue={parentId ?? ""}
              className="mt-1 w-full rounded-md border border-cream-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <option value="">Yok (üst düzey)</option>
              {topLevelItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.url}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="sortOrder">Sıra</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={sortOrder ?? 0}
              min={0}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={isActive ?? true}
                className="h-4 w-4 rounded border-cream-300 text-rose-500"
              />
              Aktif
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <Button type="submit">{isNew ? "Oluştur" : "Güncelle"}</Button>
        <Link href="/admin/menuler">
          <Button type="button" variant="outline" className="w-full">
            İptal
          </Button>
        </Link>
        {!isNew && id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Siliniyor…" : "Sil"}
          </button>
        )}
      </div>
    </form>
  );
}
