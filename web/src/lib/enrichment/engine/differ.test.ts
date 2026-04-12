// web/src/lib/enrichment/engine/differ.test.ts

import { describe, it, expect } from 'vitest'
import { diff } from './differ'
import { CafeSchema } from '../schemas/cafe.schema'
import type { NormalizedField } from './normalizer'

const merged: Record<string, NormalizedField> = {
  name:  { key: 'name',  value: 'Cafe X',       confidence: 0.9, sourceId: 'osm' },
  phone: { key: 'phone', value: '+48 22 123456', confidence: 0.7, sourceId: 'osm' },
}

describe('diff', () => {
  it('returns NEW_PLACE proposals when entity does not exist in DB (current = null)', () => {
    const proposals = diff(merged, null, 'CAFE', 'Cafe X', CafeSchema)
    expect(proposals).toHaveLength(2)
    expect(proposals.every((p) => p.changeType === 'NEW_PLACE')).toBe(true)
    expect(proposals[0].entityId).toBeUndefined()
  })

  it('returns FILL proposals for fields that are null in current entity', () => {
    const current = { id: 'c1', name: 'Cafe X', phone: null }
    const proposals = diff(
      { phone: merged.phone },
      current,
      'CAFE',
      'Cafe X',
      CafeSchema,
      'c1',
    )
    expect(proposals).toHaveLength(1)
    expect(proposals[0].changeType).toBe('FILL')
    expect(proposals[0].currentValue).toBeNull()
    expect(proposals[0].proposedValue).toBe('+48 22 123456')
  })

  it('returns UPDATE proposals when proposed value differs from current', () => {
    const current = { id: 'c1', name: 'Cafe X', phone: '+48 22 000000' }
    const proposals = diff(
      { phone: merged.phone },
      current,
      'CAFE',
      'Cafe X',
      CafeSchema,
      'c1',
    )
    expect(proposals).toHaveLength(1)
    expect(proposals[0].changeType).toBe('UPDATE')
    expect(proposals[0].currentValue).toBe('+48 22 000000')
  })

  it('skips fields where proposed value equals current value', () => {
    const current = { id: 'c1', name: 'Cafe X', phone: '+48 22 123456' }
    const proposals = diff(
      { phone: merged.phone },
      current,
      'CAFE',
      'Cafe X',
      CafeSchema,
      'c1',
    )
    expect(proposals).toHaveLength(0)
  })

  it('includes fieldGroup and fieldPriority from schema', () => {
    const proposals = diff(merged, null, 'CAFE', 'Cafe X', CafeSchema)
    const nameProposal = proposals.find((p) => p.fieldKey === 'name')
    expect(nameProposal?.fieldGroup).toBe('IDENTITY')
    expect(nameProposal?.fieldPriority).toBe('REQUIRED')
  })

  it('treats arrays as equal when contents match regardless of order', () => {
    const arrayMerged: Record<string, NormalizedField> = {
      services: { key: 'services', value: ['wifi', 'vegan'], confidence: 0.7, sourceId: 'osm' },
    }
    const current = { id: 'c1', services: ['vegan', 'wifi'] }
    const proposals = diff(arrayMerged, current, 'CAFE', 'Cafe X', CafeSchema, 'c1')
    expect(proposals).toHaveLength(0)
  })
})
