// web/src/lib/enrichment/engine/merger.ts

import type { EntitySchema } from '../schemas/types'
import type { NormalizedField } from './normalizer'

export function merge(
  fields: NormalizedField[],
  schema: EntitySchema,
): Record<string, NormalizedField> {
  const arrayKeys = new Set(schema.fields.filter((f) => f.isArray).map((f) => f.key))
  const result: Record<string, NormalizedField> = {}

  for (const field of fields) {
    const existing = result[field.key]

    if (arrayKeys.has(field.key)) {
      // Union strategy for arrays
      const existingValues = (existing?.value as unknown[]) ?? []
      const newValues = Array.isArray(field.value) ? field.value : [field.value]
      result[field.key] = {
        ...field,
        value: [...new Set([...existingValues, ...newValues])],
      }
    } else {
      // Highest confidence wins for scalar fields
      if (!existing || field.confidence > existing.confidence) {
        result[field.key] = field
      }
    }
  }

  return result
}
