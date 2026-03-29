import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiKey, isErrorResponse } from "@/lib/api-auth";

/**
 * GET /api/v1/roasters
 *
 * Query params:
 * - country: filter by country code (e.g. "PL", "DE")
 * - limit: max results (default 50, max 100)
 * - offset: pagination offset (default 0)
 */
export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
  const offset = Number(searchParams.get("offset")) || 0;

  const where = {
    status: "VERIFIED" as const,
    ...(country ? { countryCode: country.toUpperCase() } : {}),
  };

  const [roasters, total] = await Promise.all([
    db.roaster.findMany({
      where,
      select: {
        slug: true,
        name: true,
        city: true,
        country: true,
        countryCode: true,
        description: true,
        website: true,
        email: true,
        instagram: true,
        shopUrl: true,
        certifications: true,
        origins: true,
        roastStyles: true,
        lat: true,
        lng: true,
        verifiedAt: true,
      },
      orderBy: { name: "asc" },
      take: limit,
      skip: offset,
    }),
    db.roaster.count({ where }),
  ]);

  return NextResponse.json({
    data: roasters,
    meta: { total, limit, offset },
  });
}
