import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "all";

  const now = new Date();
  let dateFilter: { gte?: Date } | undefined;

  if (filter === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFilter = { gte: start };
  } else if (filter === "30days") {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    dateFilter = { gte: start };
  }

  const where = dateFilter ? { createdAt: dateFilter } : {};

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { email: true, createdAt: true },
  });

  const rows = subscribers.map((s) => {
    const date = new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(s.createdAt);
    // Escape any commas or quotes in the email (defensive)
    const email = `"${s.email.replace(/"/g, '""')}"`;
    return `${email},"${date}"`;
  });

  const csv = ["E-posta,Kayıt Tarihi", ...rows].join("\r\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="newsletter.csv"',
    },
  });
}
