// web/src/lib/enrichment/engine/normalizer.test.ts

import { describe, it, expect } from 'vitest'
import { normalize } from './normalizer'
import { CafeSchema } from '../schemas/cafe.schema'
import type { RawPlace } from '../adapters/base'

describe('normalize', () => {
  const adapter = { id: 'osm', reliability: 0.7 }

  it('maps raw fields that exist in schema to NormalizedField[]', () => {
    const raw: RawPlace = {
      sourceId: 'osm:123',
      fields: { name: 'Cafe X', phone: '+48 22 123', unknownField: 'ignored' },
      sourceUrl: 'https://osm.org/node/123',
    }
    const result = normalize(raw, CafeSchema, adapter)

    expect(result).toHaveLength(2)
    const nameField = result.find((f) => f.key === 'name')
    expect(nameField).toEqual({
      key: 'name',
      value: 'Cafe X',
      confidence: 0.7,
      sourceId: 'osm',
      sourceUrl: 'https://osm.org/node/123',
    })
  })

  it('filters out null and undefined values', () => {
    const raw: RawPlace = {
      sourceId: 'osm:1',
      fields: { name: 'Cafe X', phone: null, website: undefined },
    }
    const result = normalize(raw, CafeSchema, adapter)
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('name')
  })

  it('filters out empty strings', () => {
    const raw: RawPlace = {
      sourceId: 'osm:1',
      fields: { name: 'Cafe X', phone: '' },
    }
    const result = normalize(raw, CafeSchema, adapter)
    expect(result).toHaveLength(1)
  })

  it('includes sourceUrl as undefined when not provided', () => {
    const raw: RawPlace = { sourceId: 'osm:1', fields: { name: 'X' } }
    const result = normalize(raw, CafeSchema, adapter)
    expect(result[0].sourceUrl).toBeUndefined()
  })
})
