import { describe, it, expect } from 'vitest'
import { ApifyAdapter, createApifyEnrichmentAdapter, createApifyEctLeadsAdapter } from './apify.adapter'
import type { ApifyAdapterConfig } from './apify.adapter'
import type { DiscoveryQuery } from './base'

function makeTestAdapter(overrides: Partial<ApifyAdapterConfig> = {}): ApifyAdapter {
  return new ApifyAdapter({
    id: 'test',
    name: 'Test',
    actorId: 'testActorId',
    supports: ['CAFE'],
    reliability: 0.8,
    requiresConsent: false,
    ...overrides,
  })
}

describe('ApifyAdapter — transformItem', () => {
  it('stores transformItem from config', () => {
    const transform = (item: Record<string, unknown>) => ({ ...item, extra: 'yes' })
    const adapter = makeTestAdapter({ transformItem: transform })
    // Access via any cast to verify it was stored
    expect((adapter as unknown as Record<string, unknown>).transformItem).toBe(transform)
  })
})

describe('createApifyEnrichmentAdapter', () => {
  it('builds correct discover input for CAFE', () => {
    const adapter = createApifyEnrichmentAdapter()
    const cfg = adapter as unknown as { discoverQueryBuilder: (q: DiscoveryQuery) => Record<string, unknown> }
    const input = cfg.discoverQueryBuilder({ entityType: 'CAFE', city: 'Warsaw', country: 'PL', limit: 5 })
    expect(input).toMatchObject({
      searchStringsArray: ['specialty coffee cafe'],
      locationQuery: 'Warsaw PL',
      maxCrawledPlacesPerSearch: 5,
      language: 'en',
    })
    expect(input).not.toHaveProperty('maxCrawledPlaces')
  })

  it('builds correct discover input for ROASTER', () => {
    const adapter = createApifyEnrichmentAdapter()
    const cfg = adapter as unknown as { discoverQueryBuilder: (q: DiscoveryQuery) => Record<string, unknown> }
    const input = cfg.discoverQueryBuilder({ entityType: 'ROASTER', city: 'Kraków' })
    expect((input.searchStringsArray as string[])[0]).toContain('roaster')
    expect(input.locationQuery).toBe('Kraków')
  })

  it('maps Apify title/url/latitude/longitude to schema names', () => {
    const adapter = createApifyEnrichmentAdapter()
    const mapping = (adapter as unknown as { fieldMapping: Record<string, string> }).fieldMapping
    expect(mapping['title']).toBe('name')
    expect(mapping['url']).toBe('website')
    expect(mapping['latitude']).toBe('lat')
    expect(mapping['longitude']).toBe('lng')
  })
})

describe('createApifyEctLeadsAdapter', () => {
  it('builds ECT discover URL from city name', () => {
    const adapter = createApifyEctLeadsAdapter()
    const cfg = adapter as unknown as { discoverQueryBuilder: (q: DiscoveryQuery) => Record<string, unknown> }

    const input = cfg.discoverQueryBuilder({ entityType: 'CAFE', city: 'Warsaw', limit: 15 })
    expect((input.startUrls as Array<{url:string}>)[0].url).toBe('https://europeancoffeetrip.com/warsaw/')
    expect(input.maxItems).toBe(15)
  })

  it('strips Polish diacritics from city slug', () => {
    const adapter = createApifyEctLeadsAdapter()
    const cfg = adapter as unknown as { discoverQueryBuilder: (q: DiscoveryQuery) => Record<string, unknown> }

    const input = cfg.discoverQueryBuilder({ entityType: 'CAFE', city: 'Gdańsk' })
    expect((input.startUrls as Array<{url:string}>)[0].url).toBe('https://europeancoffeetrip.com/gdansk/')
  })

  it('transformItem flattens latLng and detail fields', () => {
    const adapter = createApifyEctLeadsAdapter()
    const fn = (adapter as unknown as { transformItem: (item: Record<string, unknown>) => Record<string, unknown> }).transformItem

    const raw = {
      id: 'abc',
      name: 'Test Cafe',
      address: 'ul. Test 1, Warszawa',
      latLng: { lat: 52.237, lng: 21.017 },
      detail: {
        webSiteLink: 'https://testcafe.pl',
        instagramLink: 'testcafe',
        about: 'Specialty coffee in Warsaw',
        description: null,
      },
      servingIds: ['espresso', 'filter-coffee'],
    }

    const result = fn(raw)

    expect(result['lat']).toBe(52.237)
    expect(result['lng']).toBe(21.017)
    expect(result['website']).toBe('https://testcafe.pl')
    expect(result['instagram']).toBe('testcafe')
    expect(result['description']).toBe('Specialty coffee in Warsaw')
    expect(result['serving']).toEqual(['espresso', 'filter-coffee'])
  })

  it('transformItem falls back to detail.description when about is null', () => {
    const adapter = createApifyEctLeadsAdapter()
    const fn = (adapter as unknown as { transformItem: (item: Record<string, unknown>) => Record<string, unknown> }).transformItem

    const raw = {
      latLng: { lat: 50.0, lng: 19.9 },
      detail: { about: null, description: 'Fallback desc' },
    }

    const result = fn(raw)
    expect(result['description']).toBe('Fallback desc')
  })

  it('transformItem handles missing latLng and detail fields gracefully', () => {
    const adapter = createApifyEctLeadsAdapter()
    const fn = (adapter as unknown as { transformItem: (item: Record<string, unknown>) => Record<string, unknown> }).transformItem

    const raw = { id: 'abc', name: 'Test Cafe' } // No latLng, no detail
    const result = fn(raw)

    expect(result['lat']).toBeUndefined()
    expect(result['lng']).toBeUndefined()
    expect(result['website']).toBeUndefined()
    expect(result['instagram']).toBeUndefined()
    expect(result['description']).toBeUndefined()
  })
})
