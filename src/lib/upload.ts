import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function sanitizeFolder(folder: string): string {
  // Allow only alphanumeric, dash, underscore — no path traversal
  return folder.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
}

export async function ensureUploadDir(subfolder = "") {
  const dir = subfolder
    ? path.join(UPLOAD_DIR, sanitizeFolder(subfolder))
    : UPLOAD_DIR;
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export interface UploadedImage {
  url: string;
  width: number;
  height: number;
  size: number;
  filename: string;
}

export interface MediaFile {
  url: string;
  filename: string;
  size: number;
  folder: string;
}

export async function saveImage(file: File, subfolder = ""): Promise<UploadedImage> {
  if (!ALLOWED_MIMES.has(file.type)) {
    throw new Error("Yalnızca JPG, PNG, WEBP veya AVIF görseller yüklenebilir.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Görsel 8 MB'dan büyük olamaz.");
  }

  const dir = await ensureUploadDir(subfolder);
  const safe = subfolder ? sanitizeFolder(subfolder) : "";

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomBytes(8).toString("hex");
  const filename = `${Date.now()}-${id}.webp`;
  const filepath = path.join(dir, filename);

  const processed = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  await fs.writeFile(filepath, processed.data);

  const urlPath = safe ? `/uploads/${safe}/${filename}` : `/uploads/${filename}`;
  return {
    url: urlPath,
    width: processed.info.width,
    height: processed.info.height,
    size: processed.info.size,
    filename,
  };
}

export async function listImages(subfolder = ""): Promise<MediaFile[]> {
  const safe = subfolder ? sanitizeFolder(subfolder) : "";
  const dir = safe ? path.join(UPLOAD_DIR, safe) : UPLOAD_DIR;

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: MediaFile[] = [];

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (![".webp", ".jpg", ".jpeg", ".png", ".avif", ".gif", ".svg"].includes(ext)) continue;
      const stat = await fs.stat(path.join(dir, entry.name));
      const urlPath = safe ? `/uploads/${safe}/${entry.name}` : `/uploads/${entry.name}`;
      files.push({ url: urlPath, filename: entry.name, size: stat.size, folder: safe });
    }

    return files.sort((a, b) => b.filename.localeCompare(a.filename));
  } catch {
    return [];
  }
}

export async function listFolders(): Promise<string[]> {
  try {
    const entries = await fs.readdir(UPLOAD_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

export async function deleteImage(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  // Strip leading /uploads/
  const rel = url.slice("/uploads/".length);
  const filepath = path.join(UPLOAD_DIR, rel);
  // Ensure we stay within UPLOAD_DIR (no traversal)
  if (!filepath.startsWith(UPLOAD_DIR)) return;
  try {
    await fs.unlink(filepath);
  } catch {
    // already deleted or never existed
  }
}
