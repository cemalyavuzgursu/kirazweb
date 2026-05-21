"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  max?: number;
}

export function ImageUploader({ value, onChange, multiple = true, max = 8 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        if (!multiple && value.length + newUrls.length >= 1) break;
        if (multiple && value.length + newUrls.length >= max) break;
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Yükleme hatası" }));
          throw new Error(err.error ?? "Yükleme hatası");
        }
        const data = (await res.json()) as { url: string };
        newUrls.push(data.url);
      }
      onChange(multiple ? [...value, ...newUrls] : newUrls);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme hatası");
    } finally {
      setUploading(false);
    }
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {value.map((url, idx) => (
          <div
            key={`${url}-${idx}`}
            className="relative aspect-square rounded-md overflow-hidden border border-cream-200 bg-cream-50 group"
          >
            <Image src={url} alt="" fill sizes="200px" className="object-cover" />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"
              title="Kaldır"
            >
              <X className="h-4 w-4 text-rose-700" />
            </button>
          </div>
        ))}

        {(multiple ? value.length < max : value.length === 0) ? (
          <label className="aspect-square rounded-md border-2 border-dashed border-cream-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-rose-300 hover:bg-cream-50 transition text-ink-300">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Upload className="h-6 w-6" />
                <span className="text-xs">Görsel ekle</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple={multiple}
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        ) : null}
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      <p className="text-xs text-ink-300">
        JPG, PNG veya WEBP. Maks. 8 MB. Otomatik olarak optimize edilir.
      </p>
    </div>
  );
}
