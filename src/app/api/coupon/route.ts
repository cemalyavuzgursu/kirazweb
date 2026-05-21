import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: "Kupon kodu gerekli" }, { status: 400 });
  }

  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "Geçersiz kupon kodu" }, { status: 404 });
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return NextResponse.json({ error: "Bu kupon henüz aktif değil" }, { status: 400 });
  }
  if (coupon.endsAt && coupon.endsAt < now) {
    return NextResponse.json({ error: "Bu kuponun süresi dolmuş" }, { status: 400 });
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ error: "Bu kuponun kullanım limiti dolmuş" }, { status: 400 });
  }

  return NextResponse.json({
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    minSubtotal: coupon.minSubtotal ? Number(coupon.minSubtotal) : null,
  });
}
