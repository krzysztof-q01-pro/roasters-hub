import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// GET /api/enrichment/photo?query=specialty+coffee+cafe&page=1
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get("query") ?? "specialty coffee";
  const page = req.nextUrl.searchParams.get("page") ?? "1";
  const key = process.env.UNSPLASH_ACCESS_KEY;

  if (!key) {
    return NextResponse.json({ error: "UNSPLASH_ACCESS_KEY not configured" }, { status: 500 });
  }

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=1&orientation=landscape`;

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}` },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Unsplash request failed" }, { status: 502 });
  }

  const data = await res.json();
  const photo = data.results?.[0];

  if (!photo) {
    return NextResponse.json({ url: null, credit: null });
  }

  return NextResponse.json({
    url: photo.urls.regular,
    thumb: photo.urls.thumb,
    credit: {
      name: photo.user.name,
      link: photo.links.html,
    },
  });
}
