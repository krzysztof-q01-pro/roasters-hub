// web/src/lib/enrichment/engine/engine.ts

import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { normalize } from './normalizer'
import { merge } from './merger'
import { diff, type DiffProposal } from './differ'
import { CafeSchema } from '../schemas/cafe.schema'
import { RoasterSchema } from '../schemas/roaster.schema'
import type { SourceAdapter } from '../adapters/base'
import type { EntityType } from '../schemas/types'

export interface EnrichmentRunParams {
  entityType: EntityType
  country?: string
  city?: string
  sources?: string[]
  mode?: 'discover' | 'enrich' | 'both'
  limit?: number
  consent?: boolean
}

export async function runEnrichment(
  params: EnrichmentRunParams,
  adapters: SourceAdapter[],
): Promise<string> {
  const schema = params.entityType === 'CAFE' ? CafeSchema : RoasterSchema
  const mode = params.mode ?? 'both'
  const limit = params.limit ?? 10

  const run = await db.enrichmentRun.create({
    data: {
      entityType: params.entityType,
      query: params as unknown as Prisma.InputJsonValue,
      sources: adapters.map((a) => a.id),
      status: 'RUNNING',
      stats: {},
    },
  })

  try {
    const proposals: (DiffProposal & { runId: string })[] = []
    let discovered = 0
    let enriched = 0
    let skipped = 0

    // ── DISCOVER mode ────────────────────────────────────────────────────
    if (mode === 'discover' || mode === 'both') {
      for (const adapter of adapters) {
        if (!adapter.supports.includes(params.entityType)) continue

        const rawPlaces = await adapter.discover({
          entityType: params.entityType,
          country: params.country,
          city: params.city,
          limit,
        })

        for (const raw of rawPlaces) {
          const normalized = normalize(raw, schema, { id: adapter.id, reliability: adapter.reliability })
          const merged = merge(normalized, schema)
          const entityName = (raw.fields['name'] as string) ?? 'Unknown'
          const placeProposals = diff(merged, null, params.entityType, entityName, schema)
          if (placeProposals.length > 0) {
            proposals.push(...placeProposals.map((p) => ({ ...p, runId: run.id })))
            discovered++
          }
        }
      }
    }

    // ── ENRICH mode ──────────────────────────────────────────────────────
    if (mode === 'enrich' || mode === 'both') {
      const existing =
        params.entityType === 'CAFE'
          ? await db.cafe.findMany({
              where: { status: 'VERIFIED' },
              select: { id: true, name: true, website: true, lat: true, lng: true },
              take: limit,
            })
          : await db.roaster.findMany({
              where: { status: 'VERIFIED' },
              select: { id: true, name: true, website: true, lat: true, lng: true },
              take: limit,
            })

      for (const entity of existing) {
        const allNormalized = []

        for (const adapter of adapters) {
          if (!adapter.supports.includes(params.entityType)) continue
          const raw = await adapter.enrich({
            id: entity.id,
            entityType: params.entityType,
            name: entity.name,
            website: entity.website ?? undefined,
            lat: entity.lat ?? undefined,
            lng: entity.lng ?? undefined,
          })
          const normalized = normalize(raw, schema, { id: adapter.id, reliability: adapter.reliability })
          allNormalized.push(...normalized)
        }

        if (allNormalized.length === 0) continue

        const merged = merge(allNormalized, schema)

        const currentEntity =
          params.entityType === 'CAFE'
            ? await db.cafe.findUnique({ where: { id: entity.id } })
            : await db.roaster.findUnique({ where: { id: entity.id } })

        if (!currentEntity) continue

        const entityProposals = diff(
          merged,
          currentEntity as Record<string, unknown>,
          params.entityType,
          entity.name,
          schema,
          entity.id,
        )

        if (entityProposals.length > 0) {
          proposals.push(...entityProposals.map((p) => ({ ...p, runId: run.id })))
          enriched++
        } else {
          skipped++
        }
      }
    }

    if (proposals.length > 0) {
      await db.enrichmentProposal.createMany({
        data: proposals.map((p) => ({
          ...p,
          currentValue:
            p.currentValue === undefined || p.currentValue === null
              ? Prisma.JsonNull
              : (p.currentValue as Prisma.InputJsonValue),
          proposedValue: p.proposedValue as Prisma.InputJsonValue,
        })),
      })
    }

    await db.enrichmentRun.update({
      where: { id: run.id },
      data: {
        status: 'DONE',
        stats: { discovered, enriched, skipped, proposals: proposals.length },
        completedAt: new Date(),
      },
    })

    return run.id
  } catch (error) {
    await db.enrichmentRun.update({
      where: { id: run.id },
      data: { status: 'FAILED', completedAt: new Date() },
    })
    throw error
  }
}
