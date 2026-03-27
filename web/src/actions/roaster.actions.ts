"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { generateUniqueSlug } from "@/lib/slug";
import { CreateRoasterSchema, type ActionResult } from "@/types/actions";

export async function createRoasterRegistration(
  formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
  try {
    const raw = {
      name: formData.get("name"),
      description: formData.get("description"),
      country: formData.get("country"),
      city: formData.get("city"),
      website: formData.get("website"),
      email: formData.get("email"),
      instagram: formData.get("instagram"),
      shopUrl: formData.get("shopUrl"),
      certifications: formData.getAll("certifications"),
      origins: formData.getAll("origins"),
      roastStyles: formData.getAll("roastStyles"),
    };

    const parsed = CreateRoasterSchema.safeParse(raw);

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

    const { name, city, description, ...rest } = parsed.data;

    const slug = await generateUniqueSlug(name, city);

    const roaster = await db.roaster.create({
      data: {
        name,
        slug,
        city,
        country: rest.country,
        countryCode: "", // will be resolved in Phase 2 (geocoding)
        description: description || null,
        website: rest.website || null,
        email: rest.email || null,
        instagram: rest.instagram || null,
        shopUrl: rest.shopUrl || null,
        certifications: rest.certifications,
        origins: rest.origins,
        roastStyles: rest.roastStyles,
      },
    });

    revalidatePath("/admin/pending");

    return { success: true, data: { slug: roaster.slug } };
  } catch (error) {
    console.error("[createRoasterRegistration]", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
