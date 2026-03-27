"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { ActionResult } from "@/types/actions";

export async function verifyRoaster(
  roasterId: string,
): Promise<ActionResult<{ slug: string }>> {
  try {
    await requireAdmin();

    const roaster = await db.roaster.update({
      where: { id: roasterId },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        rejectedAt: null,
        rejectedReason: null,
      },
      select: { slug: true },
    });

    revalidatePath("/");
    revalidatePath("/roasters");
    revalidatePath(`/roasters/${roaster.slug}`);
    revalidatePath("/admin/pending");
    revalidatePath("/map");

    return { success: true, data: { slug: roaster.slug } };
  } catch (error) {
    console.error("[verifyRoaster]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function rejectRoaster(
  roasterId: string,
  reason: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    await db.roaster.update({
      where: { id: roasterId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectedReason: reason,
      },
    });

    revalidatePath("/admin/pending");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[rejectRoaster]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
