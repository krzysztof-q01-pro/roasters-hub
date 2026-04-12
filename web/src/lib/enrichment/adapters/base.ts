// web/src/lib/enrichment/adapters/base.ts

import type { EntityType } from '../schemas/types'

export interface DiscoveryQuery {
  entityType: EntityType
  country?: string
  city?: string
  limit?: number
}

export interface KnownPlace {
  id: string
  entityType: EntityType
  name: string
  website?: string
  lat?: number
  lng?: number
}

export interface RawPlace {
  sourceId: string
  fields: Record<string, unknown>
  sourceUrl?: string
}

export interface SourceAdapter {
  id: string
  name: string
  supports: EntityType[]
  reliability: number
  requiresConsent?: boolean

  discover(query: DiscoveryQuery): Promise<RawPlace[]>
  enrich(place: KnownPlace): Promise<RawPlace>
}
