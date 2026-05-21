"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Folder, Upload, X, Check, Loader2, ImageIcon, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MediaFile {
  url: string;
  filename: string;
  size: number;
  folder: string;
}

interface Props {
  value?: string;
  onChange: (url: string) => void;
  folder?: string; // default folder for uploads (e.g. "banners", "logo")
  trigger?: React.ReactNode;
}

export function MediaPicker({ value, onChange, folder: defaultFolder = "", trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(defaultFolder);
  const [folders, setFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selected, setSelected] = useState<string>(value ?? "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [newFolder, setNewFolder] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (folder: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/media?folder=${encodeURIComponent(folder)}`);
      const data = await res.json() as { files: MediaFile[]; folders: string[] };
      setFiles(data.files ?? []);
      setFolders(data.folders ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelected(value ?? "");
      setCurrentFolder(defaultFolder);
      load(defaultFolder);
    }
  }, [open, value, defaultFolder, load]);

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", currentFolder);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) continue;
        const data = await res.json() as { url: string };
        setSelected(data.url);
      }
      await load(currentFolder);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  }

  function handleConfirm() {
    if (selected) onChange(selected);
    setOpen(false);
  }

  async function handleFolderCreate() {
    const name = newFolder.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    if (!name) return;
    setCurrentFolder(name);
    setNewFolder("");
    setShowNewFolder(false);
    await load(name);
  }

  const allFolders = ["", ...folders.filter((f) => f !== "")];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="outline" size="sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            Dosya Seç
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-cream-200">
          <DialogTitle>Medya Kütüphanesi</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Folder sidebar */}
          <div className="w-48 border-r border-cream-200 flex flex-col bg-cream-50 shrink-0">
            <div className="flex items-center justify-between px-3 py-2 border-b border-cream-100">
              <span className="text-xs font-medium text-ink-500 uppercase tracking-wide">Klasörler</span>
              <button
                type="button"
                onClick={() => setShowNewFolder((v) => !v)}
                className="text-ink-300 hover:text-ink-700 transition"
                title="Yeni klasör"
              >
                <FolderPlus className="h-4 w-4" />
              </button>
            </div>

            {showNewFolder && (
              <div className="px-3 py-2 border-b border-cream-100 flex gap-1">
                <input
                  autoFocus
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFolderCreate()}
                  placeholder="klasör-adı"
                  className="flex-1 text-xs px-2 py-1 rounded border border-cream-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-300"
                />
                <button
                  type="button"
                  onClick={handleFolderCreate}
                  className="text-xs px-2 py-1 rounded bg-rose-500 text-white hover:bg-rose-600"
                >
                  +
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-1">
              {allFolders.map((f) => (
                <button
                  key={f || "__root__"}
                  type="button"
                  onClick={() => { setCurrentFolder(f); load(f); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition ${
                    currentFolder === f
                      ? "bg-rose-50 text-rose-700 font-medium"
                      : "text-ink-600 hover:bg-cream-100"
                  }`}
                >
                  <Folder className="h-4 w-4 shrink-0" />
                  <span className="truncate">{f || "Tümü"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* File grid */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Upload drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`mx-4 mt-4 rounded-lg border-2 border-dashed flex items-center justify-center gap-3 py-3 transition cursor-pointer ${
                dragOver
                  ? "border-rose-400 bg-rose-50"
                  : "border-cream-300 hover:border-rose-300 hover:bg-cream-50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
              ) : (
                <Upload className="h-5 w-5 text-ink-300" />
              )}
              <span className="text-sm text-ink-400">
                {uploading
                  ? "Yükleniyor..."
                  : currentFolder
                  ? `Sürükle bırak veya tıkla — "${currentFolder}" klasörüne yükle`
                  : "Sürükle bırak veya tıkla — kök klasöre yükle"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => uploadFiles(e.target.files)}
              />
            </div>

            {/* Files */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-ink-300 gap-2">
                  <ImageIcon className="h-8 w-8" />
                  <p className="text-sm">Bu klasörde görsel yok</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-3">
                  {files.map((file) => (
                    <button
                      key={file.url}
                      type="button"
                      onClick={() => setSelected(file.url)}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 transition group ${
                        selected === file.url
                          ? "border-rose-500 ring-2 ring-rose-300"
                          : "border-cream-200 hover:border-rose-300"
                      }`}
                    >
                      <Image
                        src={file.url}
                        alt={file.filename}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                      {selected === file.url && (
                        <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                          <div className="bg-rose-500 rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition">
                        <p className="text-white text-[9px] truncate">{file.filename}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-cream-200 bg-cream-50">
          <div className="flex items-center gap-3 min-w-0">
            {selected && (
              <>
                <div className="relative h-10 w-10 rounded border border-cream-200 overflow-hidden shrink-0">
                  <Image src={selected} alt="" fill sizes="40px" className="object-cover" />
                </div>
                <p className="text-xs text-ink-500 truncate max-w-xs">{selected}</p>
                <button
                  type="button"
                  onClick={() => setSelected("")}
                  className="text-ink-300 hover:text-rose-500 shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="button" disabled={!selected} onClick={handleConfirm}>
              Seç
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
