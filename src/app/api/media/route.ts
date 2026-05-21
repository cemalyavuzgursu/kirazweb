import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listImages, listFolders } from "@/lib/upload";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") ?? "";

  const [files, folders] = await Promise.all([listImages(folder), listFolders()]);
  return NextResponse.json({ files, folders });
}
