"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import type { ActionResult } from "@/types/actions";

export async function saveRoaster(
  roasterId: string,
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    await db.savedRoaster.upsert({
      where: {
        userId_roasterId: { userId, roasterId },
      },
      update: {},
      create: { userId, roasterId },
    });

    revalidatePath("/dashboard/cafe");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[saveRoaster]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function unsaveRoaster(
  roasterId: string,
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    await db.savedRoaster.deleteMany({
      where: { userId, roasterId },
    });

    revalidatePath("/dashboard/cafe");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[unsaveRoaster]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function isRoasterSaved(
  roasterId: string,
): Promise<boolean> {
  try {
    const userId = await requireAuth();

    const saved = await db.savedRoaster.findUnique({
      where: {
        userId_roasterId: { userId, roasterId },
      },
    });

    return !!saved;
  } catch {
    return false;
  }
}
