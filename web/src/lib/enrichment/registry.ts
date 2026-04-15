// web/src/lib/enrichment/registry.ts

import { OsmAdapter } from './adapters/osm.adapter'
import { WebsiteAdapter } from './adapters/website.adapter'
import { EctAdapter } from './adapters/ect.adapter'
import {
  createApifyEnrichmentAdapter,
  createApifyInstagramAdapter,
  createApifyEctLeadsAdapter,
} from './adapters/apify.adapter'
import type { SourceAdapter } from './adapters/base'

const ALL_ADAPTERS: SourceAdapter[] = [
  new OsmAdapter(),
  new WebsiteAdapter(),
  new EctAdapter(),
  createApifyEnrichmentAdapter(),
  createApifyInstagramAdapter(),
  createApifyEctLeadsAdapter(),
]

export function getAdapters(sourceIds?: string[], consent = false): SourceAdapter[] {
  return ALL_ADAPTERS.filter((adapter) => {
    if (sourceIds && !sourceIds.includes(adapter.id)) return false
    if (adapter.requiresConsent && !consent) return false
    return true
  })
}

export { type ApifyAdapterConfig } from './adapters/apify.adapter'
