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

  const url = `https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, waitForFinish: waitSecs }),
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
  }

  async discover(query: DiscoveryQuery): Promise<RawPlace[]> {
    if (!this.discoverQueryBuilder) return []
    if (!this.supports.includes(query.entityType)) return []

    const input = this.discoverQueryBuilder(query)

    let run: { defaultDatasetId?: string; status: string; statusMessage?: string }
    try {
      run = await runActor(this.actorId, input, 60)
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
    return items.map((item) => ({
      sourceId: buildSourceId(this.actorId, item),
      fields: mapFields(item, this.fieldMapping),
      sourceUrl: (item['url'] as string) ?? (item['website'] as string),
    }))
  }

  async enrich(place: KnownPlace): Promise<RawPlace> {
    if (!this.enrichQueryBuilder) {
      return { sourceId: `apify:${this.actorId}:${place.id}`, fields: {} }
    }

    const input = this.enrichQueryBuilder(place)

    let run: { defaultDatasetId?: string; status: string; statusMessage?: string }
    try {
      run = await runActor(this.actorId, input, 60)
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

    const fields = mapFields(item, this.fieldMapping)
    fields['_existingId'] = place.id

    return {
      sourceId: buildSourceId(this.actorId, item),
      fields,
      sourceUrl: (item['url'] as string) ?? (item['website'] as string),
    }
  }
}

export function createApifyEnrichmentAdapter(): ApifyAdapter {
  return new ApifyAdapter({
    id: 'apify-enrichment',
    name: 'Google Places Crawler',
    actorId: 'nwua9Gu5YrADL7ZDj',
    supports: ['CAFE', 'ROASTER'],
    reliability: 0.8,
    requiresConsent: true,
    discoverQueryBuilder: (q: DiscoveryQuery) => ({
      searchStringsArray: [
        q.entityType === 'CAFE'
          ? `cafe ${q.city ?? ''} ${q.country ?? ''}`.trim()
          : `coffee roaster ${q.city ?? ''} ${q.country ?? ''}`.trim(),
      ],
      maxCrawledPlaces: q.limit ?? 10,
    }),
    enrichQueryBuilder: (p: KnownPlace) => ({
      searchStringsArray: [`${p.name} ${p.website ?? ''}`],
      maxCrawledPlaces: 1,
    }),
    fieldMapping: {
      name: 'title',
      address: 'address',
      city: 'city',
      country: 'country',
      postalCode: 'postalCode',
      phone: 'phone',
      website: 'url',
      instagram: 'instagram',
      openingHours: 'openingHours',
      lat: 'latitude',
      lng: 'longitude',
    },
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

export function createApifyEctLeadsAdapter(): ApifyAdapter {
  return new ApifyAdapter({
    id: 'apify-ect-leads',
    name: 'Europe Coffee Trip Leads',
    actorId: 'xnKEn9W0d8qAuzMRx',
    supports: ['CAFE', 'ROASTER'],
    reliability: 0.7,
    requiresConsent: true,
    discoverQueryBuilder: () => ({
      startUrls: [{ url: 'https://europeancoffeetrip.com/gdynia/' }],
      maxItems: 10,
    }),
    enrichQueryBuilder: (p: KnownPlace) => ({
      startUrls: p.website ? [{ url: p.website }] : [{ url: `https://www.google.com/search?q=${encodeURIComponent(p.name)} coffee` }],
    }),
    fieldMapping: {
      name: 'name',
      address: 'address',
      lat: 'latitude',
      lng: 'longitude',
      website: 'link',
    },
  })
}
