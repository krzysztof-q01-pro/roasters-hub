"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CreateReviewSchema, type ActionResult } from "@/types/actions";

export async function submitReview(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const raw = {
      roasterId: formData.get("roasterId"),
      authorName: formData.get("authorName"),
      rating: formData.get("rating"),
      comment: formData.get("comment"),
    };

    const parsed = CreateReviewSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    const { roasterId, authorName, rating, comment } = parsed.data;

    // Verify roaster exists and is verified
    const roaster = await db.roaster.findUnique({
      where: { id: roasterId, status: "VERIFIED" },
      select: { slug: true },
    });

    if (!roaster) {
      return { success: false, error: "Roaster not found" };
    }

    await db.review.create({
      data: {
        roasterId,
        authorName,
        rating,
        comment: comment || null,
      },
    });

    revalidatePath(`/roasters/${roaster.slug}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[submitReview]", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function approveReview(
  reviewId: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const review = await db.review.update({
      where: { id: reviewId },
      data: { status: "APPROVED" },
      select: { roaster: { select: { slug: true } } },
    });

    if (review.roaster?.slug) {
      revalidatePath(`/roasters/${review.roaster.slug}`);
    }
    revalidatePath("/admin/reviews");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[approveReview]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function rejectReview(
  reviewId: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const review = await db.review.update({
      where: { id: reviewId },
      data: { status: "REJECTED" },
      select: { roaster: { select: { slug: true } } },
    });

    if (review.roaster?.slug) {
      revalidatePath(`/roasters/${review.roaster.slug}`);
    }
    revalidatePath("/admin/reviews");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[rejectReview]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
