"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMediaFile } from "@/server/actions/media";

interface MediaFile {
  url: string;
  filename: string;
  size: number;
}

export function MediaGrid({ files }: { files: MediaFile[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  function handleDelete(url: string) {
    if (!confirm("Bu görseli kalıcı olarak silmek istediğinize emin misiniz?")) return;
    setDeleting(url);
    startTransition(async () => {
      const res = await deleteMediaFile(url);
      if (res.ok) {
        setRemoved((prev) => new Set(prev).add(url));
      } else {
        alert(res.error ?? "Silinemedi.");
      }
      setDeleting(null);
    });
  }

  const visible = files.filter((f) => !removed.has(f.url));

  if (visible.length === 0) {
    return (
      <div className="p-12 text-center text-ink-300 rounded-lg border border-cream-200 bg-white">
        Bu klasörde görsel yok.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {visible.map((f) => (
        <div
          key={f.url}
          className="relative aspect-square rounded-md overflow-hidden bg-cream-100 group"
        >
          <a href={f.url} target="_blank" rel="noreferrer" className="block w-full h-full">
            <Image src={f.url} alt={f.filename} fill sizes="200px" className="object-cover" />
          </a>

          {/* Size badge */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition pointer-events-none">
            <span className="text-xs text-white">{(f.size / 1024).toFixed(0)} KB</span>
          </div>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => handleDelete(f.url)}
            disabled={deleting === f.url}
            title="Görseli sil"
            aria-label="Görseli sil"
            className="absolute top-1.5 right-1.5 h-8 w-8 rounded-md bg-white/90 backdrop-blur flex items-center justify-center text-ink-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition disabled:opacity-100"
          >
            {deleting === f.url ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
