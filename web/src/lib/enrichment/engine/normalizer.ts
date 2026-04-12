// web/src/lib/enrichment/engine/normalizer.ts

import type { EntitySchema } from '../schemas/types'
import type { RawPlace } from '../adapters/base'

export interface NormalizedField {
  key: string
  value: unknown
  confidence: number
  sourceId: string
  sourceUrl?: string
}

export function normalize(
  raw: RawPlace,
  schema: EntitySchema,
  adapter: { id: string; reliability: number },
): NormalizedField[] {
  const schemaKeys = new Set(schema.fields.map((f) => f.key))
  const result: NormalizedField[] = []

  for (const [key, value] of Object.entries(raw.fields)) {
    if (!schemaKeys.has(key)) continue
    if (value === null || value === undefined || value === '') continue

    result.push({
      key,
      value,
      confidence: adapter.reliability,
      sourceId: adapter.id,
      sourceUrl: raw.sourceUrl,
    })
  }

  return result
}
