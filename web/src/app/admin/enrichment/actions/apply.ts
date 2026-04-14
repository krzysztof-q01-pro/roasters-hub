"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";

interface ApplyEntityParams {
  runId: string;
  entityId: string | null;
  entityName: string;
  entityType: string;
  photoUrl?: string;
}

export async function applyEntityProposals(
  params: ApplyEntityParams
): Promise<ActionResult<{ applied: number }>> {
  try {
    await requireAdmin();

    const { runId, entityId, entityName, entityType, photoUrl } = params;

    // Fetch all PENDING proposals for this entity
    const proposals = await db.enrichmentProposal.findMany({
      where: {
        runId,
        status: "PENDING",
        ...(entityId ? { entityId } : { entityId: null, entityName }),
      },
    });

    if (proposals.length === 0 && !photoUrl) {
      return { success: true, data: { applied: 0 } };
    }

    // Build field update map
    const fieldUpdates: Record<string, unknown> = {};
    for (const p of proposals) {
      fieldUpdates[p.fieldKey] = p.proposedValue;
    }

    // Add photo if provided
    if (photoUrl) {
      fieldUpdates.coverImageUrl = photoUrl;
    }

    if (Object.keys(fieldUpdates).length > 0) {
      if (entityType === "CAFE") {
        if (entityId) {
          await db.cafe.update({ where: { id: entityId }, data: fieldUpdates });
        } else {
          // NEW_PLACE: create new cafe — requires name, city, country at minimum
          const name = String(fieldUpdates.name ?? entityName);
          const city = String(fieldUpdates.city ?? "");
          const country = String(fieldUpdates.country ?? "");
          const countryCode = String(
            fieldUpdates.countryCode ?? country.slice(0, 2).toUpperCase()
          );
          const slug =
            name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") +
            "-" +
            Date.now();
          await db.cafe.create({
            data: {
              name,
              slug,
              city,
              country,
              countryCode,
              ...(fieldUpdates as Record<string, never>),
            },
          });
        }
        revalidatePath("/cafes");
        revalidatePath("/map");
      } else if (entityType === "ROASTER") {
        if (entityId) {
          await db.roaster.update({ where: { id: entityId }, data: fieldUpdates });
        } else {
          const name = String(fieldUpdates.name ?? entityName);
          const city = String(fieldUpdates.city ?? "");
          const country = String(fieldUpdates.country ?? "");
          const countryCode = String(
            fieldUpdates.countryCode ?? country.slice(0, 2).toUpperCase()
          );
          const slug =
            name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") +
            "-" +
            Date.now();
          await db.roaster.create({
            data: {
              name,
              slug,
              city,
              country,
              countryCode,
              ...(fieldUpdates as Record<string, never>),
            },
          });
        }
        revalidatePath("/roasters");
        revalidatePath("/map");
      }
    }

    // Mark all applied proposals as APPLIED
    if (proposals.length > 0) {
      await db.enrichmentProposal.updateMany({
        where: { id: { in: proposals.map((p) => p.id) } },
        data: { status: "APPLIED" },
      });
    }

    revalidatePath(`/admin/enrichment/${runId}`);
    revalidatePath("/admin/enrichment");

    return { success: true, data: { applied: proposals.length } };
  } catch (err) {
    console.error("applyEntityProposals error:", err);
    return { success: false, error: "Failed to apply proposals" };
  }
}
