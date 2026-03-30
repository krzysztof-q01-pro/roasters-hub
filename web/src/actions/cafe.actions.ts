"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin, requireCafeOwner } from "@/lib/auth";
import { generateUniqueCafeSlug } from "@/lib/slug";
import { resolveCountryCode } from "@/lib/country-codes";
import { CreateCafeSchema, UpdateCafeSchema, type ActionResult } from "@/types/actions";

export async function createCafe(
  formData: FormData,
  userId: string,
): Promise<ActionResult<{ slug: string }>> {
  try {
    const raw = {
      name: formData.get("name"),
      description: formData.get("description"),
      country: formData.get("country"),
      city: formData.get("city"),
      address: formData.get("address"),
      lat: formData.get("lat") || undefined,
      lng: formData.get("lng") || undefined,
      website: formData.get("website"),
      instagram: formData.get("instagram"),
      phone: formData.get("phone"),
    };

    const parsed = CreateCafeSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { name, description, country, city, address, lat, lng, website, instagram, phone } =
      parsed.data;

    const slug = await generateUniqueCafeSlug(name, city);
    const countryCode = resolveCountryCode(country);

    const cafe = await db.cafe.create({
      data: {
        name,
        slug,
        description: description || null,
        country,
        countryCode,
        city,
        address: address || null,
        lat: typeof lat === "number" ? lat : null,
        lng: typeof lng === "number" ? lng : null,
        website: website || null,
        instagram: instagram || null,
        phone: phone || null,
        status: "PENDING",
      },
    });

    await db.userProfile.update({
      where: { id: userId },
      data: { cafeId: cafe.id, role: "CAFE" },
    });

    revalidatePath("/cafes");
    return { success: true, data: { slug: cafe.slug } };
  } catch (error) {
    console.error("[createCafe]", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateCafe(cafeId: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireCafeOwner(cafeId);

    const raw = {
      description: formData.get("description"),
      address: formData.get("address"),
      lat: formData.get("lat") || undefined,
      lng: formData.get("lng") || undefined,
      website: formData.get("website"),
      instagram: formData.get("instagram"),
      phone: formData.get("phone"),
    };

    const parsed = UpdateCafeSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const cafe = await db.cafe.update({
      where: { id: cafeId },
      data: {
        description: parsed.data.description || null,
        address: parsed.data.address || null,
        lat: typeof parsed.data.lat === "number" ? parsed.data.lat : null,
        lng: typeof parsed.data.lng === "number" ? parsed.data.lng : null,
        website: parsed.data.website || null,
        instagram: parsed.data.instagram || null,
        phone: parsed.data.phone || null,
      },
      select: { slug: true },
    });

    revalidatePath("/cafes");
    revalidatePath(`/cafes/${cafe.slug}`);
    revalidatePath("/map");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[updateCafe]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function verifyCafe(cafeId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const cafe = await db.cafe.update({
      where: { id: cafeId },
      data: { status: "VERIFIED", verifiedAt: new Date() },
      select: { slug: true },
    });
    revalidatePath("/cafes");
    revalidatePath(`/cafes/${cafe.slug}`);
    revalidatePath("/map");
    revalidatePath("/admin/cafes");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[verifyCafe]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function rejectCafe(cafeId: string, reason: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const cafe = await db.cafe.update({
      where: { id: cafeId },
      data: { status: "REJECTED", rejectedAt: new Date(), rejectedReason: reason },
      select: { slug: true },
    });
    revalidatePath("/cafes");
    revalidatePath(`/cafes/${cafe.slug}`);
    revalidatePath("/admin/cafes");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[rejectCafe]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
