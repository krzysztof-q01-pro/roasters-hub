// web/src/lib/enrichment/engine/differ.ts

import type { EntitySchema, EntityType } from '../schemas/types'
import type { NormalizedField } from './normalizer'

export interface DiffProposal {
  entityType: string
  entityId?: string
  entityName: string
  changeType: 'NEW_PLACE' | 'FILL' | 'UPDATE'
  fieldKey: string
  fieldGroup: string
  fieldPriority: string
  currentValue?: unknown
  proposedValue: unknown
  confidence: number
  sourceId: string
  sourceUrl?: string
}

function valuesAreEqual(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      JSON.stringify([...(a as unknown[])].sort()) ===
      JSON.stringify([...(b as unknown[])].sort())
    )
  }
  return JSON.stringify(a) === JSON.stringify(b)
}

export function diff(
  merged: Record<string, NormalizedField>,
  current: Record<string, unknown> | null,
  entityType: EntityType,
  entityName: string,
  schema: EntitySchema,
  entityId?: string,
): DiffProposal[] {
  const proposals: DiffProposal[] = []

  for (const [key, field] of Object.entries(merged)) {
    const schemaDef = schema.fields.find((f) => f.key === key)
    if (!schemaDef) continue

    const base: Omit<DiffProposal, 'changeType' | 'currentValue'> = {
      entityType,
      entityId,
      entityName,
      fieldKey: key,
      fieldGroup: schemaDef.group,
      fieldPriority: schemaDef.priority,
      proposedValue: field.value,
      confidence: field.confidence,
      sourceId: field.sourceId,
      sourceUrl: field.sourceUrl,
    }

    if (current === null) {
      proposals.push({ ...base, changeType: 'NEW_PLACE' })
      continue
    }

    const currentValue = current[key]

    if (currentValue === null || currentValue === undefined) {
      proposals.push({ ...base, changeType: 'FILL', currentValue: currentValue ?? null })
    } else if (!valuesAreEqual(currentValue, field.value)) {
      proposals.push({ ...base, changeType: 'UPDATE', currentValue })
    }
    // SKIP if equal
  }

  return proposals
}
