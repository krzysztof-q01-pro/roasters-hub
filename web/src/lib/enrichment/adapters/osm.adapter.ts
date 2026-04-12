// web/src/lib/enrichment/adapters/osm.adapter.ts

import type { SourceAdapter, DiscoveryQuery, KnownPlace, RawPlace } from './base'
import type { EntityType } from '../schemas/types'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const RATE_LIMIT_MS = 1000
const USER_AGENT = 'BeanMapBot/1.0 (+https://beanmap.coffee/bot)'

function buildQuery(entityType: EntityType, city?: string, country?: string, limit = 50): string {
  const tag =
    entityType === 'CAFE'
      ? '"amenity"="cafe"'
      : '"craft"="coffee_roaster"'

  if (city) {
    return `
      [out:json][timeout:30][maxsize:${limit * 5000}];
      area["name"="${city}"]["admin_level"~"[4-8]"]->.a;
      (node[${tag}](area.a);way[${tag}](area.a););
      out center body ${limit};
    `
  }
  if (country) {
    return `
      [out:json][timeout:30][maxsize:${limit * 5000}];
      area["ISO3166-1"~"${country.substring(0, 2).toUpperCase()}"][admin_level=2]->.a;
      (node[${tag}](area.a);way[${tag}](area.a););
      out center body ${limit};
    `
  }
  return `
    [out:json][timeout:30];
    (node[${tag}];way[${tag}];);
    out center body ${limit};
  `
}

function mapOsmTagsToFields(
  element: Record<string, unknown>,
): Record<string, unknown> {
  const tags = (element['tags'] as Record<string, string>) ?? {}
  const lat = (element['lat'] as number) ?? (element['center'] as Record<string, number> | undefined)?.['lat']
  const lon = (element['lon'] as number) ?? (element['center'] as Record<string, number> | undefined)?.['lon']

  const street = tags['addr:street'] ?? ''
  const housenumber = tags['addr:housenumber'] ?? ''
  const address = [street, housenumber].filter(Boolean).join(' ') || undefined

  const instagram =
    tags['contact:instagram'] ??
    tags['instagram'] ??
    undefined

  return {
    name: tags['name'],
    address,
    postalCode: tags['addr:postcode'],
    city: tags['addr:city'],
    website: tags['website'] ?? tags['contact:website'],
    phone: tags['phone'] ?? tags['contact:phone'],
    openingHours: tags['opening_hours'],
    instagram,
    lat,
    lng: lon,
  }
}

export class OsmAdapter implements SourceAdapter {
  id = 'osm'
  name = 'OpenStreetMap'
  supports: EntityType[] = ['CAFE', 'ROASTER']
  reliability = 0.7
  requiresConsent = false

  private lastRequestAt = 0

  private async rateLimitedFetch(query: string): Promise<unknown> {
    const now = Date.now()
    const elapsed = now - this.lastRequestAt
    if (elapsed < RATE_LIMIT_MS) {
      await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - elapsed))
    }
    this.lastRequestAt = Date.now()

    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
      },
      body: `data=${encodeURIComponent(query)}`,
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`)
    }
    return response.json()
  }

  async discover(query: DiscoveryQuery): Promise<RawPlace[]> {
    if (!this.supports.includes(query.entityType)) return []

    const overpassQuery = buildQuery(
      query.entityType,
      query.city,
      query.country,
      query.limit ?? 50,
    )

    let data: { elements?: Record<string, unknown>[] }
    try {
      data = (await this.rateLimitedFetch(overpassQuery)) as typeof data
    } catch (err) {
      console.error('[OsmAdapter] discover failed:', err)
      return []
    }

    return (data.elements ?? [])
      .filter((el) => (el['tags'] as Record<string, string>)?.['name'])
      .map((el) => ({
        sourceId: `osm:${el['type']}:${el['id']}`,
        fields: mapOsmTagsToFields(el),
        sourceUrl: `https://www.openstreetmap.org/${el['type']}/${el['id']}`,
      }))
  }

  async enrich(place: KnownPlace): Promise<RawPlace> {
    if (!place.lat || !place.lng) {
      return { sourceId: `osm:enrich:${place.id}`, fields: {} }
    }

    const query = `
      [out:json][timeout:15];
      node(around:100,${place.lat},${place.lng})["name"="${place.name.replace(/"/g, '\\"')}"];
      out body 1;
    `

    let data: { elements?: Record<string, unknown>[] }
    try {
      data = (await this.rateLimitedFetch(query)) as typeof data
    } catch {
      return { sourceId: `osm:enrich:${place.id}`, fields: {} }
    }

    const el = data.elements?.[0]
    if (!el) return { sourceId: `osm:enrich:${place.id}`, fields: {} }

    return {
      sourceId: `osm:${el['type']}:${el['id']}`,
      fields: { ...mapOsmTagsToFields(el), _existingId: place.id },
      sourceUrl: `https://www.openstreetmap.org/${el['type']}/${el['id']}`,
    }
  }
}
