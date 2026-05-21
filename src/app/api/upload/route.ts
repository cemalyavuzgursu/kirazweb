import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveImage } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }
    const folder = typeof formData.get("folder") === "string" ? (formData.get("folder") as string) : "";
    const result = await saveImage(file, folder);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Yükleme başarısız";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
