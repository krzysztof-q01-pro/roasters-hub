import { NextRequest, NextResponse } from "next/server";

/**
 * BETA PASSWORD AUTH
 * ==================
 * POST /api/beta-auth
 * Body: { password: string }
 * Sets cookie "beta_auth" for 24h if password matches BETA_PASSWORD env var.
 *
 * How to remove:
 * 1. Delete this file
 * 2. Delete BETA_PASSWORD from env
 * 3. Delete cookie check from middleware.ts
 */

const BETA_PASSWORD = process.env.BETA_PASSWORD;

export async function POST(req: NextRequest) {
  if (!BETA_PASSWORD) {
    return NextResponse.json({ ok: true });
  }

  const { password } = await req.json();

  if (password !== BETA_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("beta_auth", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return response;
}
