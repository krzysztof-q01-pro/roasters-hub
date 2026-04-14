import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entityType = req.nextUrl.searchParams.get("entityType") ?? "CAFE";
  const tags = await db.enrichmentTag.findMany({
    where: { entityType },
    orderBy: { createdAt: "asc" },
    select: { value: true },
  });

  return NextResponse.json({ tags: tags.map((t) => t.value) });
}
