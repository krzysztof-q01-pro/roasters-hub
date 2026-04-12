// web/src/lib/enrichment/engine/merger.test.ts

import { describe, it, expect } from 'vitest'
import { merge } from './merger'
import { CafeSchema } from '../schemas/cafe.schema'
import { RoasterSchema } from '../schemas/roaster.schema'
import type { NormalizedField } from './normalizer'

describe('merge', () => {
  it('picks the field with highest confidence for scalar fields', () => {
    const fields: NormalizedField[] = [
      { key: 'website', value: 'http://a.com', confidence: 0.7, sourceId: 'osm' },
      { key: 'website', value: 'https://a.com', confidence: 0.9, sourceId: 'website' },
    ]
    const result = merge(fields, CafeSchema)
    expect(result['website'].value).toBe('https://a.com')
    expect(result['website'].sourceId).toBe('website')
  })

  it('keeps existing winner when new confidence is lower', () => {
    const fields: NormalizedField[] = [
      { key: 'phone', value: '+48 22 high', confidence: 0.9, sourceId: 'website' },
      { key: 'phone', value: '+48 22 low',  confidence: 0.6, sourceId: 'osm' },
    ]
    const result = merge(fields, CafeSchema)
    expect(result['phone'].value).toBe('+48 22 high')
  })

  it('unions values for array fields', () => {
    const fields: NormalizedField[] = [
      { key: 'origins', value: ['Ethiopia', 'Kenya'],    confidence: 0.7, sourceId: 'osm' },
      { key: 'origins', value: ['Ethiopia', 'Colombia'], confidence: 0.8, sourceId: 'website' },
    ]
    const result = merge(fields, RoasterSchema)
    const values = result['origins'].value as string[]
    expect(values).toHaveLength(3)
    expect(values).toContain('Ethiopia')
    expect(values).toContain('Kenya')
    expect(values).toContain('Colombia')
  })

  it('returns empty object for empty input', () => {
    expect(merge([], CafeSchema)).toEqual({})
  })
})
