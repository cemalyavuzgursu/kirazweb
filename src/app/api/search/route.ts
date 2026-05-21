import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      category: { select: { name: true } },
    },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price.toString(),
      compareAtPrice: p.compareAtPrice?.toString() ?? null,
      image: p.images[0]?.url ?? null,
      category: p.category?.name ?? null,
    })),
  });
}
