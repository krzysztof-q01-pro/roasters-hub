// web/src/lib/enrichment/adapters/ect.adapter.ts
// European Coffee Trip — requiresConsent: true
// This adapter is DISABLED by default. To enable, pass consent: true in the run API.
// Review ECT Terms of Service before enabling in production.

import type { SourceAdapter, DiscoveryQuery, KnownPlace, RawPlace } from './base'
import type { EntityType } from '../schemas/types'

const USER_AGENT = 'BeanMapBot/1.0 (+https://beanmap.coffee/bot)'

export class EctAdapter implements SourceAdapter {
  id = 'ect'
  name = 'European Coffee Trip'
  supports: EntityType[] = ['CAFE']
  reliability = 0.8
  requiresConsent = true

  async discover(query: DiscoveryQuery): Promise<RawPlace[]> {
    // ECT city pages: https://europeancoffeetrip.com/city/warsaw/
    const city = query.city?.toLowerCase().replace(/\s+/g, '-')
    if (!city) return []

    const url = `https://europeancoffeetrip.com/city/${city}/`
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) return []
      const html = await res.text()

      // Extract cafe cards from ECT listing page
      const nameMatches = [...html.matchAll(/class="cafe-title[^"]*"[^>]*>([^<]+)</gi)]
      const limit = query.limit ?? 50

      return nameMatches.slice(0, limit).map((match, i) => ({
        sourceId: `ect:${city}:${i}`,
        fields: { name: match[1].trim() },
        sourceUrl: url,
      }))
    } catch {
      return []
    }
  }

  async enrich(_place: KnownPlace): Promise<RawPlace> {
    // Full profile enrichment not implemented — extend when needed
    return { sourceId: `ect:${_place.id}`, fields: {} }
  }
}
