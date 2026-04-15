# Apify Enrichment Wire-up — Design Spec
**Date:** 2026-04-15  
**Author:** @MN  
**Branch:** feat/mn-apify-enrichment (new branch off main after current branch is merged)

---

## Context

The enrichment system already has `ApifyAdapter` implemented and three Apify actors registered in `registry.ts`. However:
1. **Critical bug:** `fieldMapping` is inverted in both adapters — `mapFields()` uses `fieldMapping[apifyKey]` to get the schema key, but current configs are written `{ schemaKey: apifyKey }` (backwards). Result: no fields ever map correctly.
2. **ECT adapter** has hardcoded `startUrls: [gdynia]` and misses the nested field structure the actor actually returns (`latLng.lat/lng`, `detail.webSiteLink`, etc.).
3. **Google Places adapter** uses wrong parameter name (`maxCrawledPlaces` → should be `maxCrawledPlacesPerSearch`), missing `locationQuery` and `language`.
4. **UI gap:** `NewRunForm.tsx` only lists OSM, ECT-scraper, Website — no Apify sources at all.

Goal: fix the adapters so data actually flows, surface them in the UI, verify with a live test run.

---

## Scope

Two actors:
- **`nwua9Gu5YrADL7ZDj`** — Google Maps Scraper (`apify-enrichment`) — discover + enrich, CAFE + ROASTER
- **`xnKEn9W0d8qAuzMRx`** — ECT Leads Scraper (`apify-ect-leads`) — discover, CAFE

Out of scope: Instagram adapter (`apify-instagram`), single-entity trigger buttons on detail pages.

---

## Architecture

### 1. Add `transformItem` to `ApifyAdapterConfig`

**File:** `web/src/lib/enrichment/adapters/apify.adapter.ts`

Extend config interface:
```ts
export interface ApifyAdapterConfig {
  // ...existing fields...
  transformItem?: (item: Record<string, unknown>) => Record<string, unknown>
}
```

Apply in `ApifyAdapter` before `mapFields`:
```ts
// In discover():
const processed = this.transformItem ? this.transformItem(item) : item
return { sourceId: ..., fields: mapFields(processed, this.fieldMapping), sourceUrl: ... }

// In enrich():
const processed = this.transformItem ? this.transformItem(item) : item
const fields = mapFields(processed, this.fieldMapping)
```

Store `transformItem` as private field, call it in both `discover` and `enrich`.

---

### 2. Fix `createApifyEnrichmentAdapter` (Google Maps Scraper)

**Actor output fields** (confirmed from Apify docs):  
`title`, `url`, `address`, `city`, `country`, `postalCode`, `phone`, `latitude`, `longitude`, `openingHours`, `instagram` (when `scrapeSocialMediaProfiles.instagrams: true`)

**Fix fieldMapping** (inverted — swap keys/values):
```ts
fieldMapping: {
  title: 'name',       // Apify 'title' → schema 'name'
  url: 'website',      // Apify 'url' → schema 'website'
  latitude: 'lat',     // Apify 'latitude' → schema 'lat'
  longitude: 'lng',    // Apify 'longitude' → schema 'lng'
  // address, city, country, postalCode, phone, openingHours, instagram → pass-through (same key)
},
```

**Fix discover input:**
```ts
discoverQueryBuilder: (q: DiscoveryQuery) => ({
  searchStringsArray: [
    q.entityType === 'CAFE' ? 'specialty coffee cafe' : 'coffee roaster',
  ],
  locationQuery: `${q.city ?? ''} ${q.country ?? ''}`.trim(),
  maxCrawledPlacesPerSearch: q.limit ?? 10,   // was: maxCrawledPlaces
  language: 'en',
  scrapeSocialMediaProfiles: { instagrams: true },
}),
```

**Fix enrich input:**
```ts
enrichQueryBuilder: (p: KnownPlace) => ({
  searchStringsArray: [p.name],
  locationQuery: p.website ?? '',
  maxCrawledPlacesPerSearch: 1,
  language: 'en',
  scrapeSocialMediaProfiles: { instagrams: true },
}),
```

---

### 3. Fix `createApifyEctLeadsAdapter` (ECT Leads Scraper)

**Actor output fields** (confirmed from Apify docs):  
`id`, `name`, `address`, `cityId`, `featuredPhoto`, `latLng: { lat, lng }`, `detail: { webSiteLink, instagramLink, about, description, gallery }`, `featureIds`, `servingIds`, `openingHours`

**Fix city URL construction — `discoverQueryBuilder`:**
```ts
discoverQueryBuilder: (q: DiscoveryQuery) => {
  const slug = (q.city ?? 'warsaw')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip diacritics: ą→a, ę→e, etc.
    .replace(/\s+/g, '-')
  return {
    startUrls: [{ url: `https://europeancoffeetrip.com/${slug}/` }],
    maxItems: q.limit ?? 20,
  }
},
```

**Add `transformItem`** to flatten nested fields:
```ts
transformItem: (item) => {
  const latLng = item['latLng'] as Record<string, unknown> | undefined
  const detail = item['detail'] as Record<string, unknown> | undefined
  return {
    ...item,
    lat: latLng?.lat,
    lng: latLng?.lng,
    website: detail?.webSiteLink,
    instagram: detail?.instagramLink,
    description: detail?.about ?? detail?.description,
  }
},
```

**Fix fieldMapping** (ECT names mostly match schema already):
```ts
fieldMapping: {
  // name, address → pass-through
  // lat, lng, website, instagram, description → already set by transformItem
  // No remapping needed after transform
},
```

Remove old `lat: 'latitude'`, `lng: 'longitude'`, `website: 'link'` entries — they were wrong in both direction and field name.

---

### 4. NewRunForm UI changes

**File:** `web/src/app/admin/enrichment/new/_components/NewRunForm.tsx`

**Extend SOURCES list:**
```ts
const SOURCES = [
  { id: "osm",              label: "OSM (OpenStreetMap)" },
  { id: "ect",              label: "ECT Scraper",            requiresConsent: true },
  { id: "website",          label: "Website scraper" },
  { id: "apify-enrichment", label: "Google Maps (Apify)",    requiresConsent: true, requiresApify: true },
  { id: "apify-ect-leads",  label: "ECT Leads (Apify)",      requiresConsent: true, requiresApify: true },
]
```

**Consent UI logic:**
- Any source with `requiresConsent: true` selected → show consent checkbox (already exists)
- Any source with `requiresApify: true` selected → also show Apify-specific note: _"Apify sources use external paid API. Ensure APIFY_TOKEN is configured."_
- Keep single `consent` boolean (existing API already passes it through; all Apify adapters check `requiresConsent`)

**No other UI changes needed** — city/limit/mode fields already exist and will pass through correctly to the adapters.

---

## Verification (Approach C — Live Test Run)

After implementation, run manual test via `/admin/enrichment/new`:

| Test | Entity | Mode | Source | City | Limit | Expected |
|------|--------|------|--------|------|-------|----------|
| T1 | CAFE | discover | apify-ect-leads | Warsaw | 3 | ≥1 NEW_PLACE proposal with name, address, lat, lng, website |
| T2 | CAFE | discover | apify-enrichment | Warsaw | 3 | ≥1 NEW_PLACE proposal with name, address, lat/lng |
| T3 | ROASTER | enrich | apify-enrichment | — | 5 | FILL proposals for existing verified roasters |

**Pass criteria:**
- Run status ends as DONE (not FAILED)
- Proposals created (count > 0)
- Proposals have `fieldKey` values matching schema fields (`name`, `lat`, `lng`, `website`, etc.)
- Confidence values present (0.7–0.9 range)

**Failure diagnosis path:**
- FAILED run → check server logs for Apify API error (`runActor` throw)
- Empty proposals → check normalizer output — likely fieldKey not in schema
- Wrong field values → check transformItem / fieldMapping correctness

---

## Files Changed

| File | Change |
|------|--------|
| `web/src/lib/enrichment/adapters/apify.adapter.ts` | Add `transformItem` to config + class; fix Google Places fieldMapping + inputs; fix ECT city URL + transformItem + fieldMapping |
| `web/src/app/admin/enrichment/new/_components/NewRunForm.tsx` | Add `apify-enrichment` and `apify-ect-leads` to SOURCES; add Apify consent note |

Total: **2 files**, no schema changes, no new routes.

---

## Not Changed

- `registry.ts` — adapters already registered
- `engine.ts` — no changes needed
- Prisma schema — no new models
- `apify-instagram` adapter — out of scope
