import { NextResponse } from "next/server";
import { sendNewsletterDigest } from "@/lib/email";

/**
 * POST /api/newsletter/digest
 *
 * Triggers a newsletter digest email to all subscribers.
 * Protected by CRON_SECRET — set this env var and pass it
 * as Authorization: Bearer <secret> header.
 *
 * Can be called by:
 * - Vercel Cron Jobs (vercel.json)
 * - External cron service (e.g. cron-job.org)
 * - Manual curl for testing
 */
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendNewsletterDigest();

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    failed: result.failed,
  });
}
