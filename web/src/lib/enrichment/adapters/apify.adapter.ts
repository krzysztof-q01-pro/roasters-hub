// web/src/lib/enrichment/adapters/apify.adapter.ts

import type { SourceAdapter, DiscoveryQuery, KnownPlace, RawPlace } from './base'
import type { EntityType } from '../schemas/types'

export interface ApifyAdapterConfig {
  id: string
  name: string
  actorId: string
  supports: EntityType[]
  reliability: number
  requiresConsent?: boolean
  discoverQueryBuilder?: (q: DiscoveryQuery) => Record<string, unknown>
  enrichQueryBuilder?: (p: KnownPlace) => Record<string, unknown>
  fieldMapping?: Record<string, string>
  transformItem?: (item: Record<string, unknown>) => Record<string, unknown>
}

function getApifyToken(): string {
  const token = process.env.APIFY_TOKEN
  if (!token) {
    throw new Error('APIFY_TOKEN environment variable is not set')
  }
  return token
}

function mapFields(
  raw: Record<string, unknown>,
  fieldMapping: Record<string, string> | undefined,
): Record<string, unknown> {
  if (!fieldMapping) return raw

  const result: Record<string, unknown> = {}
  for (const [apifyKey, value] of Object.entries(raw)) {
    const schemaKey = fieldMapping[apifyKey] ?? apifyKey
    result[schemaKey] = value
  }
  return result
}

function buildSourceId(actorId: string, item: Record<string, unknown>): string {
  const id = (item['id'] as string) ?? String(Date.now())
  return `apify:${actorId}:${id}`
}

async function runActor(
  actorId: string,
  input: Record<string, unknown>,
  waitSecs = 60,
): Promise<{ defaultDatasetId?: string; status: string; statusMessage?: string }> {
  const token = getApifyToken()

  const url = `https://api.apify.com/v2/acts/${actorId}/runs?token=${token}&waitForFinish=${waitSecs}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Apify API error: ${response.status} ${error}`)
  }

  const runData = await response.json()
  const runId = runData.data?.id

  if (!runId) {
    throw new Error('No run ID returned from Apify')
  }

  const statusUrl = `https://api.apify.com/v2/acts/${actorId}/runs/${runId}?token=${token}`

  const maxWait = waitSecs * 1000
  const startTime = Date.now()

  while (Date.now() - startTime < maxWait) {
    const statusResponse = await fetch(statusUrl)
    if (!statusResponse.ok) {
      console.error(`[apify] poll status error ${statusResponse.status}`)
      return { status: 'FAILED', statusMessage: `poll error ${statusResponse.status}` }
    }
    const statusData = await statusResponse.json()
    const status = statusData.data?.status

    if (status === 'SUCCEEDED') {
      return {
        defaultDatasetId: statusData.data?.defaultDatasetId,
        status,
      }
    }
    if (status === 'FAILED') {
      return {
        status,
        statusMessage: statusData.data?.statusMessage,
        defaultDatasetId: statusData.data?.defaultDatasetId,
      }
    }
    if (status === 'ABORTED' || status === 'TIMED-OUT') {
      return { status }
    }

    await new Promise((r) => setTimeout(r, 2000))
  }

  return { status: 'TIMED-OUT' }
}

async function getDatasetItems(datasetId: string): Promise<Record<string, unknown>[]> {
  const token = getApifyToken()
  const url = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&limit=100`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch dataset items: ${response.status}`)
  }

  return response.json()
}

export class ApifyAdapter implements SourceAdapter {
  id: string
  name: string
  actorId: string
  supports: EntityType[]
  reliability: number
  requiresConsent: boolean
  private discoverQueryBuilder?: (q: DiscoveryQuery) => Record<string, unknown>
  private enrichQueryBuilder?: (p: KnownPlace) => Record<string, unknown>
  private fieldMapping?: Record<string, string>
  private transformItem?: (item: Record<string, unknown>) => Record<string, unknown>

  constructor(config: ApifyAdapterConfig) {
    this.id = config.id
    this.name = config.name
    this.actorId = config.actorId
    this.supports = config.supports
    this.reliability = config.reliability
    this.requiresConsent = config.requiresConsent ?? true
    this.discoverQueryBuilder = config.discoverQueryBuilder
    this.enrichQueryBuilder = config.enrichQueryBuilder
    this.fieldMapping = config.fieldMapping
    this.transformItem = config.transformItem
  }

  async discover(query: DiscoveryQuery): Promise<RawPlace[]> {
    if (!this.discoverQueryBuilder) return []
    if (!this.supports.includes(query.entityType)) return []

    const input = this.discoverQueryBuilder(query)

    let run: { defaultDatasetId?: string; status: string; statusMessage?: string }
    try {
      run = await runActor(this.actorId, input, 250)
    } catch (err) {
      console.error(`[${this.id}] discover failed:`, err)
      return []
    }

    if (run.status === 'FAILED') {
      console.error(`[${this.id}] actor run failed:`, run.statusMessage)
      return []
    }

    if (!run.defaultDatasetId) return []

    const items = await getDatasetItems(run.defaultDatasetId)
    return items.map((item) => {
      const processed = this.transformItem ? this.transformItem(item) : item
      return {
        sourceId: buildSourceId(this.actorId, item),
        fields: mapFields(processed, this.fieldMapping),
        sourceUrl: (processed['url'] as string) ?? (processed['website'] as string),
      }
    })
  }

  async enrich(place: KnownPlace): Promise<RawPlace> {
    if (!this.enrichQueryBuilder) {
      return { sourceId: `apify:${this.actorId}:${place.id}`, fields: {} }
    }

    const input = this.enrichQueryBuilder(place)

    let run: { defaultDatasetId?: string; status: string; statusMessage?: string }
    try {
      run = await runActor(this.actorId, input, 250)
    } catch (err) {
      console.error(`[${this.id}] enrich failed for ${place.id}:`, err)
      return { sourceId: `apify:${this.actorId}:${place.id}`, fields: {} }
    }

    if (run.status === 'FAILED') {
      console.error(`[${this.id}] actor run failed:`, run.statusMessage)
      return { sourceId: `apify:${this.actorId}:${place.id}`, fields: {} }
    }

    if (!run.defaultDatasetId) {
      return { sourceId: `apify:${this.actorId}:${place.id}`, fields: {} }
    }

    const items = await getDatasetItems(run.defaultDatasetId)
    const item = items[0]

    if (!item) {
      return { sourceId: `apify:${this.actorId}:${place.id}`, fields: {} }
    }

    const processed = this.transformItem ? this.transformItem(item) : item
    const fields = mapFields(processed, this.fieldMapping)
    fields['_existingId'] = place.id

    return {
      sourceId: buildSourceId(this.actorId, item),
      fields,
      sourceUrl: (processed['url'] as string) ?? (processed['website'] as string),
    }
  }
}

export function createApifyEnrichmentAdapter(): ApifyAdapter {
  return new ApifyAdapter({
    id: 'apify-enrichment',
    name: 'Google Maps Scraper',
    actorId: 'nwua9Gu5YrADL7ZDj',
    supports: ['CAFE', 'ROASTER'],
    reliability: 0.8,
    requiresConsent: true,
    discoverQueryBuilder: (q: DiscoveryQuery) => ({
      searchStringsArray: [
        q.entityType === 'CAFE' ? 'specialty coffee cafe' : 'coffee roaster',
      ],
      // Apify geofencing requires "City, Country" format (comma-separated)
      locationQuery: [q.city, q.country].filter(Boolean).join(', '),
      maxCrawledPlacesPerSearch: q.limit ?? 10,
      language: 'en',
      scrapePlaceDetailPage: true,
      scrapeSocialMediaProfiles: { instagrams: true },
    }),
    enrichQueryBuilder: (p: KnownPlace) => ({
      searchStringsArray: [p.name],
      // No locationQuery for enrich mode — search globally by name
      maxCrawledPlacesPerSearch: 1,
      language: 'en',
      scrapePlaceDetailPage: true,
      scrapeSocialMediaProfiles: { instagrams: true },
    }),
    // Actor returns: title (name), website (website), location.lat/lng (nested), address, city, countryCode, phone
    // url field is Google Maps URL — do NOT map to website
    fieldMapping: {
      title: 'name',
      countryCode: 'country',
      // address, city, postalCode, phone, openingHours → pass-through (same names)
    },
    // Flatten nested location object: { lat, lng } → top-level lat, lng
    transformItem: (item) => ({
      ...item,
      lat: (item['location'] as Record<string, unknown> | undefined)?.lat,
      lng: (item['location'] as Record<string, unknown> | undefined)?.lng,
    }),
  })
}

export function createApifyInstagramAdapter(): ApifyAdapter {
  return new ApifyAdapter({
    id: 'apify-instagram',
    name: 'Instagram Profile Scraper',
    actorId: 'dSCLg0C3YEZ83HzYX',
    supports: ['CAFE', 'ROASTER'],
    reliability: 0.75,
    requiresConsent: true,
    enrichQueryBuilder: (p: KnownPlace) => {
      const place = p as unknown as Record<string, unknown>
      const instagramHandle = (place['instagram'] as string) ?? p.name
      return {
        usernames: [instagramHandle],
      }
    },
    fieldMapping: {
      username: 'instagram',
      fullName: 'name',
      bio: 'description',
      website: 'websiteUrl',
      followersCount: 'instagramFollowers',
      followingCount: 'following',
      postsCount: 'postsCount',
    },
  })
}

function toCitySlug(city: string): string {
  return city
    .toLowerCase()
    // Replace characters not covered by NFD decomposition
    .replace(/ł/g, 'l')
    .replace(/ø/g, 'o')
    .replace(/đ/g, 'd')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

export function createApifyEctLeadsAdapter(): ApifyAdapter {
  return new ApifyAdapter({
    id: 'apify-ect-leads',
    name: 'ECT Leads Scraper',
    actorId: 'xnKEn9W0d8qAuzMRx',
    supports: ['CAFE'],
    reliability: 0.7,
    requiresConsent: true,
    discoverQueryBuilder: (q: DiscoveryQuery) => ({
      startUrls: [{ url: `https://europeancoffeetrip.com/${toCitySlug(q.city ?? 'warsaw')}/` }],
      maxItems: q.limit ?? 20,
    }),
    transformItem: (item) => {
      // latLng has three observed formats:
      //   array  ["lat_str", "lng_str"]  — actor docs (v0.0.9+)
      //   object { lat: number, lng: number } — some actor builds
      //   flat   latitude/longitude strings  — older actor output
      const latLng = item['latLng']
      let lat: number | undefined
      let lng: number | undefined
      if (Array.isArray(latLng) && latLng.length >= 2) {
        lat = parseFloat(latLng[0] as string)
        lng = parseFloat(latLng[1] as string)
      } else if (latLng && typeof latLng === 'object') {
        const o = latLng as Record<string, unknown>
        lat = typeof o['lat'] === 'number' ? (o['lat'] as number) : parseFloat(o['lat'] as string)
        lng = typeof o['lng'] === 'number' ? (o['lng'] as number) : parseFloat(o['lng'] as string)
      } else if (item['latitude'] !== undefined) {
        lat = parseFloat(item['latitude'] as string)
        lng = parseFloat(item['longitude'] as string)
      }

      const detail = item['detail'] as Record<string, unknown> | undefined
      const instagramUrl = detail?.instagramLink as string | undefined
      // Normalise Instagram URL → handle (@handle) or keep raw URL
      const instagram = instagramUrl
        ? instagramUrl.replace(/https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')
        : undefined

      return {
        ...item,
        lat,
        lng,
        website: detail?.webSiteLink as string | undefined,
        instagram,
        description: (detail?.about ?? detail?.description) as string | undefined,
        // shareLink or flat 'link' (older format) → used by discover() for sourceUrl
        url: (detail?.shareLink ?? item['link']) as string | undefined,
        serving: item['servingIds'],
      }
    },
    fieldMapping: {
      // name, address, openingHours, servingIds, featureIds → pass-through
    },
  })
}
