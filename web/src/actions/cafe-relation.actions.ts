"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCafeOwner } from "@/lib/auth";
import type { ActionResult } from "@/types/actions";

export async function addCafeRoasterRelation(
  cafeId: string,
  roasterId: string,
  cafeSlug: string,
  roasterSlug: string,
): Promise<ActionResult> {
  try {
    await requireCafeOwner(cafeId);
    await db.cafeRoasterRelation.create({ data: { cafeId, roasterId } });
    revalidatePath(`/cafes/${cafeSlug}`);
    revalidatePath(`/roasters/${roasterSlug}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[addCafeRoasterRelation]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function removeCafeRoasterRelation(
  cafeId: string,
  roasterId: string,
  cafeSlug: string,
  roasterSlug: string,
): Promise<ActionResult> {
  try {
    await requireCafeOwner(cafeId);
    await db.cafeRoasterRelation.delete({
      where: { cafeId_roasterId: { cafeId, roasterId } },
    });
    revalidatePath(`/cafes/${cafeSlug}`);
    revalidatePath(`/roasters/${roasterSlug}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[removeCafeRoasterRelation]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function searchVerifiedRoasters(query: string) {
  if (query.length < 2) return [];
  return db.roaster.findMany({
    where: {
      status: "VERIFIED",
      name: { contains: query, mode: "insensitive" },
    },
    select: { id: true, name: true, slug: true, city: true, country: true },
    take: 10,
  });
}
