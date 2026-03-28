"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/actions";

const SubscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  segment: z.enum(["CONSUMER", "CAFE"]).default("CONSUMER"),
});

export async function subscribeNewsletter(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const raw = {
      email: formData.get("email"),
      segment: formData.get("segment") ?? "CONSUMER",
    };

    const parsed = SubscribeSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    await db.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { segment: parsed.data.segment },
      create: {
        email: parsed.data.email,
        segment: parsed.data.segment,
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[subscribeNewsletter]", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
