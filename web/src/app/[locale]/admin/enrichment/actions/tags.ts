"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { ActionResult } from "@/types/actions";

export async function getEnrichmentTags(
  entityType: string
): Promise<ActionResult<{ id: string; entityType: string; value: string }[]>> {
  try {
    await requireAdmin();
    const tags = await db.enrichmentTag.findMany({
      where: { entityType },
      orderBy: { createdAt: "asc" },
    });
    return { success: true, data: tags };
  } catch {
    return { success: false, error: "Failed to fetch tags" };
  }
}

export async function upsertEnrichmentTag(
  entityType: string,
  value: string
): Promise<ActionResult<{ id: string; entityType: string; value: string }>> {
  try {
    await requireAdmin();
    const trimmed = value.trim();
    if (!trimmed) return { success: false, error: "Tag value cannot be empty" };

    const tag = await db.enrichmentTag.upsert({
      where: { entityType_value: { entityType, value: trimmed } },
      create: { entityType, value: trimmed },
      update: {},
    });
    revalidatePath("/admin/enrichment/new");
    return { success: true, data: tag };
  } catch {
    return { success: false, error: "Failed to save tag" };
  }
}

export async function deleteEnrichmentTag(
  entityType: string,
  value: string
): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    await db.enrichmentTag.delete({
      where: { entityType_value: { entityType, value } },
    });
    revalidatePath("/admin/enrichment/new");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete tag" };
  }
}
