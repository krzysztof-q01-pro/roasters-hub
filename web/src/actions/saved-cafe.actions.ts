"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import type { ActionResult } from "@/types/actions";

export async function saveCafe(
  cafeId: string,
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    await db.savedCafe.upsert({
      where: {
        userId_cafeId: { userId, cafeId },
      },
      update: {},
      create: { userId, cafeId },
    });

    revalidatePath("/dashboard/cafe");
    revalidatePath("/dashboard/saved-roasters");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[saveCafe]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function unsaveCafe(
  cafeId: string,
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    await db.savedCafe.deleteMany({
      where: { userId, cafeId },
    });

    revalidatePath("/dashboard/cafe");
    revalidatePath("/dashboard/saved-roasters");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[unsaveCafe]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function isCafeSaved(
  cafeId: string,
): Promise<boolean> {
  try {
    const userId = await requireAuth();

    const saved = await db.savedCafe.findUnique({
      where: {
        userId_cafeId: { userId, cafeId },
      },
    });

    return !!saved;
  } catch {
    return false;
  }
}
