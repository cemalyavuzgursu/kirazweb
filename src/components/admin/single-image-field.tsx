"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { MediaPicker } from "./media-picker";
import { Button } from "@/components/ui/button";

interface Props {
  name: string;
  defaultValue?: string;
  folder?: string;
}

export function SingleImageField({ name, defaultValue, folder }: Props) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (folder) fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) return;
      const data = await res.json() as { url: string };
      setUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      {url ? (
        <div className="flex items-center gap-3">
          <div className="relative h-20 w-20 rounded-md overflow-hidden border border-cream-200 shrink-0">
            <Image src={url} alt="" fill sizes="80px" className="object-cover" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-ink-500 truncate max-w-[200px]">{url}</p>
            <div className="flex gap-2">
              <MediaPicker value={url} onChange={setUrl} folder={folder} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUrl("")}
                className="text-rose-600 hover:text-rose-700"
              >
                <X className="h-4 w-4 mr-1" />
                Kaldır
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-cream-300 text-sm text-ink-400 hover:border-rose-300 hover:text-ink-600 transition disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Yükle
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <span className="text-xs text-ink-300">veya</span>
          <MediaPicker value="" onChange={setUrl} folder={folder} />
        </div>
      )}
    </div>
  );
}
