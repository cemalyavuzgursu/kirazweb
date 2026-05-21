import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { listImages, listFolders } from "@/lib/upload";
import { AdminShell, PageHeader } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";
import { Folder } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const session = await requireAdmin();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/admin/medya";
  const { folder = "" } = await searchParams;

  const [files, folders] = await Promise.all([listImages(folder), listFolders()]);

  return (
    <AdminShell userName={session.user.name ?? ""} pathname={pathname}>
      <PageHeader
        title="Medya Kütüphanesi"
        description={`${files.length} dosya${folder ? ` · /${folder}` : " · kök klasör"}`}
      />

      {/* Folder tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        <Link
          href="/admin/medya"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition ${
            !folder
              ? "bg-rose-500 text-white"
              : "bg-cream-100 text-ink-600 hover:bg-cream-200"
          }`}
        >
          Tümü
        </Link>
        {folders.map((f) => (
          <Link
            key={f}
            href={`/admin/medya?folder=${encodeURIComponent(f)}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition ${
              folder === f
                ? "bg-rose-500 text-white"
                : "bg-cream-100 text-ink-600 hover:bg-cream-200"
            }`}
          >
            <Folder className="h-3.5 w-3.5" />
            {f}
          </Link>
        ))}
      </div>

      {files.length === 0 ? (
        <Card>
          <div className="p-12 text-center text-ink-300">
            Bu klasörde henüz görsel yüklenmemiş.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {files.map((f) => (
            <a
              key={f.url}
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="relative aspect-square rounded-md overflow-hidden bg-cream-100 group"
            >
              <Image src={f.url} alt={f.filename} fill sizes="200px" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                <span className="text-xs text-white">{(f.size / 1024).toFixed(0)} KB</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
