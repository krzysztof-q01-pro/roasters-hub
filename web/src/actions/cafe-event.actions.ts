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

export async function trackCafeEvent(
  cafeId: string,
  type: EventType,
): Promise<ActionResult> {
  try {
    if (!cafeId || !VALID_EVENTS.includes(type)) {
      return { success: false, error: "Invalid event parameters" };
    }

    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

    const encoder = new TextEncoder();
    const data = encoder.encode(ip + cafeId);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const ipHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 16);

    const userAgent = headersList.get("user-agent") ?? undefined;

    await db.cafeEvent.create({
      data: {
        cafeId,
        type,
        ipHash,
        userAgent: userAgent?.slice(0, 256),
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[trackCafeEvent]", error);
    return { success: false, error: "Failed to track event" };
  }
}
