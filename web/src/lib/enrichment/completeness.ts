// Completeness score for enriched entities
// Based on field definitions in roaster.schema.ts and cafe.schema.ts

import { RoasterSchema } from './schemas/roaster.schema'
import { CafeSchema } from './schemas/cafe.schema'

export interface CompletenessResult {
  score: number       // 0-100
  filled: number
  total: number
  missing: string[]
}

type EntityLike = Record<string, unknown>

function isValuePresent(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'boolean') return true
  if (typeof value === 'number') return true
  return Boolean(value)
}

export function getRoasterCompleteness(entity: EntityLike): CompletenessResult {
  const fields = RoasterSchema.fields
  const missing: string[] = []
  let filled = 0

  for (const field of fields) {
    if (isValuePresent(entity[field.key])) {
      filled++
    } else {
      missing.push(field.key)
    }
  }

  return {
    score: Math.round((filled / fields.length) * 100),
    filled,
    total: fields.length,
    missing,
  }
}

export function getCafeCompleteness(entity: EntityLike): CompletenessResult {
  const fields = CafeSchema.fields
  const missing: string[] = []
  let filled = 0

  for (const field of fields) {
    if (isValuePresent(entity[field.key])) {
      filled++
    } else {
      missing.push(field.key)
    }
  }

  return {
    score: Math.round((filled / fields.length) * 100),
    filled,
    total: fields.length,
    missing,
  }
}

export function getCompleteness(entity: EntityLike, entityType: 'ROASTER' | 'CAFE'): CompletenessResult {
  return entityType === 'ROASTER'
    ? getRoasterCompleteness(entity)
    : getCafeCompleteness(entity)
}
