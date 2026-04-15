// web/src/lib/enrichment/engine/engine.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    enrichmentRun: {
      create: vi.fn(),
      update: vi.fn(),
    },
    enrichmentProposal: {
      createMany: vi.fn(),
    },
    cafe: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    roaster: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import { db } from '@/lib/db'
import { runEnrichment } from './engine'

import type { SourceAdapter, RawPlace } from '../adapters/base'

const mockRun = { id: 'run-1', entityType: 'CAFE', status: 'RUNNING' }

const mockAdapter: SourceAdapter = {
  id: 'osm',
  name: 'OSM',
  supports: ['CAFE'],
  reliability: 0.7,
  requiresConsent: false,
  discover: vi.fn(),
  enrich: vi.fn(),
}

const discoveredPlace: RawPlace = {
  sourceId: 'osm:node:123',
  fields: {
    name: 'New Cafe',
    city: 'Warsaw',
    country: 'Poland',
    lat: 52.2,
    lng: 21.0,
  },
  sourceUrl: 'https://osm.org/node/123',
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(db.enrichmentRun.create).mockResolvedValue(mockRun as never)
  vi.mocked(db.enrichmentRun.update).mockResolvedValue(mockRun as never)
  vi.mocked(db.enrichmentProposal.createMany).mockResolvedValue({ count: 0 })
  vi.mocked(db.cafe.findMany).mockResolvedValue([])
  vi.mocked(db.roaster.findMany).mockResolvedValue([])
})

describe('runEnrichment', () => {
  it('creates an EnrichmentRun with RUNNING status and returns runId', async () => {
    vi.mocked(mockAdapter.discover).mockResolvedValue([])
    const runId = await runEnrichment(
      { entityType: 'CAFE', city: 'Warsaw', sources: ['osm'], mode: 'discover' },
      [mockAdapter],
    )
    expect(db.enrichmentRun.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'RUNNING' }) }),
    )
    expect(runId).toBe('run-1')
  })

  it('creates NEW_PLACE proposals from discovered places', async () => {
    vi.mocked(mockAdapter.discover).mockResolvedValue([discoveredPlace])
    await runEnrichment(
      { entityType: 'CAFE', city: 'Warsaw', sources: ['osm'], mode: 'discover' },
      [mockAdapter],
    )
    expect(db.enrichmentProposal.createMany).toHaveBeenCalled()
    const call = vi.mocked(db.enrichmentProposal.createMany).mock.calls[0][0]
    expect((call as { data: unknown[] }).data.length).toBeGreaterThan(0)
  })

  it('marks run as DONE after completion', async () => {
    vi.mocked(mockAdapter.discover).mockResolvedValue([])
    await runEnrichment(
      { entityType: 'CAFE', city: 'Warsaw', sources: ['osm'], mode: 'discover' },
      [mockAdapter],
    )
    expect(db.enrichmentRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'DONE' }),
      }),
    )
  })

  it('marks run as FAILED when adapter throws', async () => {
    vi.mocked(mockAdapter.discover).mockRejectedValue(new Error('network error'))
    await expect(
      runEnrichment(
        { entityType: 'CAFE', city: 'Warsaw', sources: ['osm'], mode: 'discover' },
        [mockAdapter],
      ),
    ).rejects.toThrow('network error')
    expect(db.enrichmentRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' }),
      }),
    )
  })
})
