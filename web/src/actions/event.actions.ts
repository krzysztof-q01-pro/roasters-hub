"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/actions";
import type { EventType } from "@prisma/client";

const VALID_EVENTS: EventType[] = [
  "PAGE_VIEW",
  "CONTACT_CLICK",
  "SHOP_CLICK",
  "WEBSITE_CLICK",
  "MAP_CLICK",
  "SHARE_CLICK",
];

/**
 * Track a profile interaction event (page view, click, etc.)
 * Called from client components on roaster profile pages.
 */
export async function trackEvent(
  roasterId: string,
  type: EventType,
): Promise<ActionResult> {
  try {
    if (!roasterId || !VALID_EVENTS.includes(type)) {
      return { success: false, error: "Invalid event parameters" };
    }

    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

    // Simple hash to anonymize IP — not reversible
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + roasterId);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const ipHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 16);

    const userAgent = headersList.get("user-agent") ?? undefined;

    await db.profileEvent.create({
      data: {
        roasterId,
        type,
        ipHash,
        userAgent: userAgent?.slice(0, 256),
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[trackEvent]", error);
    return { success: false, error: "Failed to track event" };
  }
}
