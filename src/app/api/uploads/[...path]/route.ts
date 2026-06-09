import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";
// Files are written at runtime, so this route must not be statically cached.
export const dynamic = "force-dynamic";

// Must match UPLOAD_DIR in src/lib/upload.ts
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filepath = path.join(UPLOAD_DIR, ...segments);

  // Prevent path traversal — resolved path must stay inside UPLOAD_DIR
  const resolved = path.resolve(filepath);
  if (resolved !== path.resolve(UPLOAD_DIR) && !resolved.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const data = await fs.readFile(resolved);
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      // Never let the browser MIME-sniff a served file into something executable.
      "X-Content-Type-Options": "nosniff",
    };
    // SVGs are same-origin documents that can carry inline <script>. Neutralize
    // any stored XSS by sandboxing and forcing download rather than inline render.
    if (ext === ".svg") {
      headers["Content-Security-Policy"] = "sandbox; default-src 'none'";
      headers["Content-Disposition"] = `attachment; filename="${path.basename(resolved)}"`;
    }
    return new Response(new Uint8Array(data), { headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
