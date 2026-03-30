"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import {
  CreateReviewSchema,
  CreateCafeReviewSchema,
  type ActionResult,
} from "@/types/actions";

export async function submitReview(formData: FormData): Promise<ActionResult> {
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
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    const { roasterId, authorName, rating, comment } = parsed.data;
    const roaster = await db.roaster.findUnique({
      where: { id: roasterId, status: "VERIFIED" },
      select: { slug: true },
    });
    if (!roaster) return { success: false, error: "Roaster not found" };
    await db.review.create({ data: { roasterId, authorName, rating, comment: comment || null } });
    revalidatePath(`/roasters/${roaster.slug}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[submitReview]", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function submitCafeReview(formData: FormData): Promise<ActionResult> {
  try {
    const raw = {
      cafeId: formData.get("cafeId"),
      authorName: formData.get("authorName"),
      rating: formData.get("rating"),
      comment: formData.get("comment"),
    };
    const parsed = CreateCafeReviewSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    const { cafeId, authorName, rating, comment } = parsed.data;
    const cafe = await db.cafe.findUnique({
      where: { id: cafeId, status: "VERIFIED" },
      select: { slug: true },
    });
    if (!cafe) return { success: false, error: "Cafe not found" };
    await db.review.create({ data: { cafeId, authorName, rating, comment: comment || null } });
    revalidatePath(`/cafes/${cafe.slug}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[submitCafeReview]", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function approveReview(reviewId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const review = await db.review.update({
      where: { id: reviewId },
      data: { status: "APPROVED" },
      select: {
        roaster: { select: { slug: true } },
        cafe: { select: { slug: true } },
      },
    });
    if (review.roaster) revalidatePath(`/roasters/${review.roaster.slug}`);
    if (review.cafe) revalidatePath(`/cafes/${review.cafe.slug}`);
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

export async function rejectReview(reviewId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const review = await db.review.update({
      where: { id: reviewId },
      data: { status: "REJECTED" },
      select: {
        roaster: { select: { slug: true } },
        cafe: { select: { slug: true } },
      },
    });
    if (review.roaster) revalidatePath(`/roasters/${review.roaster.slug}`);
    if (review.cafe) revalidatePath(`/cafes/${review.cafe.slug}`);
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
