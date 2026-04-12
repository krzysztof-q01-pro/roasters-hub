"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { ActionResult } from "@/types/actions";
import {
  sendRoasterVerifiedEmail,
  sendRoasterRejectedEmail,
} from "@/lib/email";

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
      select: { slug: true, name: true, email: true },
    });

    revalidatePath("/");
    revalidatePath("/roasters");
    revalidatePath(`/roasters/${roaster.slug}`);
    revalidatePath("/admin/pending");
    revalidatePath("/admin");
    revalidatePath("/admin/roasters");
    revalidatePath("/admin/activity");
    revalidatePath("/map");

    if (roaster.email) {
      sendRoasterVerifiedEmail({
        email: roaster.email,
        name: roaster.name,
        slug: roaster.slug,
      });
    }

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

    const roaster = await db.roaster.update({
      where: { id: roasterId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectedReason: reason,
      },
      select: { slug: true, name: true, email: true },
    });

    revalidatePath("/");
    revalidatePath("/roasters");
    revalidatePath(`/roasters/${roaster.slug}`);
    revalidatePath("/admin/pending");
    revalidatePath("/admin");
    revalidatePath("/admin/roasters");
    revalidatePath("/admin/activity");
    revalidatePath("/map");

    if (roaster.email) {
      sendRoasterRejectedEmail({
        email: roaster.email,
        name: roaster.name,
        reason,
      });
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[rejectRoaster]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
