import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Validate API key from Authorization header.
 * Returns the API key record if valid, or a NextResponse error.
 */
export async function validateApiKey(
  request: Request,
): Promise<{ id: string; name: string } | NextResponse> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header. Use: Bearer <api-key>" },
      { status: 401 },
    );
  }

  const key = authHeader.slice(7);

  const apiKey = await db.apiKey.findUnique({
    where: { key, active: true },
    select: { id: true, name: true },
  });

  if (!apiKey) {
    return NextResponse.json(
      { error: "Invalid or inactive API key" },
      { status: 401 },
    );
  }

  // Update lastUsed (fire-and-forget)
  db.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  }).catch(() => {});

  return apiKey;
}

export function isErrorResponse(
  result: { id: string; name: string } | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
