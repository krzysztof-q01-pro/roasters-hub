# Apify Enrichment Wire-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two broken Apify adapters (Google Maps + ECT Leads) and surface them in the enrichment UI so runs can actually produce field proposals.

**Architecture:** The `ApifyAdapter` class in `apify.adapter.ts` needs a `transformItem` hook for pre-processing nested response objects, and both factory functions need their `fieldMapping` and input query builders corrected. The `NewRunForm` component gets two new source checkboxes with shared consent handling.

**Tech Stack:** Next.js 15 App Router, TypeScript, Apify REST API v2, Vitest (test runner)

---

## File Map

| File | Change |
|------|--------|
| `web/src/lib/enrichment/adapters/apify.adapter.ts` | Add `transformItem` to config + class; fix Google Maps inputs + fieldMapping; fix ECT city URL + transformItem + fieldMapping |
| `web/src/lib/enrichment/adapters/apify.adapter.test.ts` | New — unit tests for `transformItem` pre-processing and corrected field mappings |
| `web/src/app/admin/enrichment/new/_components/NewRunForm.tsx` | Add two Apify sources; update consent logic |

---

## Task 1: Add `transformItem` to `ApifyAdapterConfig` and `ApifyAdapter`

**Files:**
- Modify: `web/src/lib/enrichment/adapters/apify.adapter.ts`
- Create: `web/src/lib/enrichment/adapters/apify.adapter.test.ts`

### Background

`ApifyAdapterConfig` currently has no way to pre-process Apify response items before field mapping. The ECT actor returns nested objects (`latLng: {lat, lng}`, `detail: {webSiteLink, ...}`) that `mapFields` can't handle with a simple key rename. We add an optional `transformItem` function to the config.

- [ ] **Step 1: Write the failing test**

Create `web/src/lib/enrichment/adapters/apify.adapter.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { ApifyAdapter } from './apify.adapter'
import type { ApifyAdapterConfig } from './apify.adapter'

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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/adapters/apify.adapter.test.ts 2>&1 | tail -20
```

Expected: FAIL — `transformItem` property does not exist on adapter.

- [ ] **Step 3: Add `transformItem` to the interface and class**

In `web/src/lib/enrichment/adapters/apify.adapter.ts`, make these changes:

**a) Extend `ApifyAdapterConfig` interface** — add one line after `fieldMapping`:
```ts
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
```

**b) Add private field to `ApifyAdapter` class** — after `private fieldMapping`:
```ts
private transformItem?: (item: Record<string, unknown>) => Record<string, unknown>
```

**c) Assign in constructor** — after `this.fieldMapping = config.fieldMapping`:
```ts
this.transformItem = config.transformItem
```

**d) Apply in `discover()`** — replace the final `return items.map(...)` block:
```ts
return items.map((item) => {
  const processed = this.transformItem ? this.transformItem(item) : item
  return {
    sourceId: buildSourceId(this.actorId, item),
    fields: mapFields(processed, this.fieldMapping),
    sourceUrl: (processed['url'] as string) ?? (processed['website'] as string),
  }
})
```

**e) Apply in `enrich()`** — replace the block after `const item = items[0]` (keep the `if (!item)` guard, change what follows):
```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/adapters/apify.adapter.test.ts 2>&1 | tail -20
```

Expected: PASS — 1 test passing.

---

## Task 2: Fix `createApifyEnrichmentAdapter` (Google Maps Scraper)

**Files:**
- Modify: `web/src/lib/enrichment/adapters/apify.adapter.ts`
- Modify: `web/src/lib/enrichment/adapters/apify.adapter.test.ts`

### Background

The Google Maps Scraper (`nwua9Gu5YrADL7ZDj`) returns: `title` (not `name`), `url` (website), `latitude`, `longitude`, `address`, `city`, `country`, `postalCode`, `phone`, `openingHours`, `instagram` (when social scraping enabled). The current `fieldMapping` is inverted and uses wrong input param names.

- [ ] **Step 1: Write failing tests for the discover input and field mapping**

Add to `apify.adapter.test.ts`. First update the imports at the top of the file to:

```ts
import { describe, it, expect } from 'vitest'
import { ApifyAdapter, createApifyEnrichmentAdapter, createApifyEctLeadsAdapter } from './apify.adapter'
import type { ApifyAdapterConfig } from './apify.adapter'
import type { DiscoveryQuery } from './base'
```

Then add the new `describe` block:

```ts
import { createApifyEnrichmentAdapter } from './apify.adapter'
import type { DiscoveryQuery } from './base'

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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/adapters/apify.adapter.test.ts 2>&1 | tail -30
```

Expected: FAIL — 3 new tests failing.

- [ ] **Step 3: Replace `createApifyEnrichmentAdapter` function**

In `apify.adapter.ts`, replace the entire `createApifyEnrichmentAdapter` function (lines ~210–244):

```ts
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
      locationQuery: `${q.city ?? ''} ${q.country ?? ''}`.trim(),
      maxCrawledPlacesPerSearch: q.limit ?? 10,
      language: 'en',
      scrapeSocialMediaProfiles: { instagrams: true },
    }),
    enrichQueryBuilder: (p: KnownPlace) => ({
      searchStringsArray: [p.name],
      locationQuery: p.website ?? '',
      maxCrawledPlacesPerSearch: 1,
      language: 'en',
      scrapeSocialMediaProfiles: { instagrams: true },
    }),
    fieldMapping: {
      title: 'name',
      url: 'website',
      latitude: 'lat',
      longitude: 'lng',
      // address, city, country, postalCode, phone, openingHours, instagram → pass-through
    },
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/adapters/apify.adapter.test.ts 2>&1 | tail -30
```

Expected: PASS — all tests passing.

---

## Task 3: Fix `createApifyEctLeadsAdapter` (ECT Leads Scraper)

**Files:**
- Modify: `web/src/lib/enrichment/adapters/apify.adapter.ts`
- Modify: `web/src/lib/enrichment/adapters/apify.adapter.test.ts`

### Background

The ECT Leads Scraper (`xnKEn9W0d8qAuzMRx`) returns nested objects:
- `latLng: { lat: number, lng: number }` — must be flattened
- `detail: { webSiteLink, instagramLink, about, description }` — must be unpacked
- `servingIds: string[]` — maps to `serving`
- `name`, `address` — already correct, pass-through

The `discoverQueryBuilder` is hardcoded to Gdynia. It must build the URL from `q.city`.  
ECT URL format: `https://europeancoffeetrip.com/{slug}/` where slug is city name lowercased + diacritics stripped.

- [ ] **Step 1: Write failing tests**

Add to `apify.adapter.test.ts` (imports already updated in Task 2):

```ts
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
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/adapters/apify.adapter.test.ts 2>&1 | tail -30
```

Expected: FAIL — 4 new tests failing.

- [ ] **Step 3: Replace `createApifyEctLeadsAdapter` function**

In `apify.adapter.ts`, replace the entire `createApifyEctLeadsAdapter` function (lines ~273–296):

```ts
function toCitySlug(city: string): string {
  return city
    .toLowerCase()
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
      const latLng = item['latLng'] as Record<string, unknown> | undefined
      const detail = item['detail'] as Record<string, unknown> | undefined
      return {
        ...item,
        lat: latLng?.lat,
        lng: latLng?.lng,
        website: detail?.webSiteLink,
        instagram: detail?.instagramLink,
        description: (detail?.about ?? detail?.description) as string | undefined,
        serving: item['servingIds'],
      }
    },
    fieldMapping: {},
  })
}
```

Note: `toCitySlug` is a module-private helper — place it just above `createApifyEctLeadsAdapter`, not exported.

- [ ] **Step 4: Run all adapter tests to verify they pass**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/adapters/apify.adapter.test.ts 2>&1 | tail -30
```

Expected: PASS — all tests passing (Task 1 + Task 2 + Task 3 tests).

---

## Task 4: Update `NewRunForm` to expose Apify sources

**Files:**
- Modify: `web/src/app/admin/enrichment/new/_components/NewRunForm.tsx`

### Background

The `SOURCES` constant lists three sources. Add `apify-enrichment` and `apify-ect-leads`. Both require consent. The consent checkbox label and validation logic need to cover all `requiresConsent` sources, not just ECT. Add an informational note when Apify sources are selected.

- [ ] **Step 1: Replace the `SOURCES` constant**

In `NewRunForm.tsx`, replace:
```ts
const SOURCES = [
  { id: "osm", label: "OSM (OpenStreetMap)" },
  { id: "ect", label: "ECT (Ethical Coffee Trade)", requiresConsent: true },
  { id: "website", label: "Website scraper" },
]
```

With:
```ts
const SOURCES: Array<{
  id: string
  label: string
  requiresConsent?: boolean
  requiresApify?: boolean
}> = [
  { id: "osm",              label: "OSM (OpenStreetMap)" },
  { id: "ect",              label: "ECT Scraper",           requiresConsent: true },
  { id: "website",          label: "Website scraper" },
  { id: "apify-enrichment", label: "Google Maps (Apify)",   requiresConsent: true, requiresApify: true },
  { id: "apify-ect-leads",  label: "ECT Leads (Apify)",     requiresConsent: true, requiresApify: true },
]
```

- [ ] **Step 2: Update consent and Apify detection logic**

Replace the `const ectSelected = ...` line and find any other references to `ectSelected` in the component. Replace with:

```ts
const consentRequired = SOURCES
  .filter((s) => s.requiresConsent)
  .some((s) => sources.includes(s.id))

const apifySelected = SOURCES
  .filter((s) => s.requiresApify)
  .some((s) => sources.includes(s.id))
```

- [ ] **Step 3: Update validation and fetch body**

Find the block:
```ts
if (ectSelected && !consent) {
  setError("Consent required to use ECT data.")
  return
}
```
Replace with:
```ts
if (consentRequired && !consent) {
  setError("Consent required for the selected sources.")
  return
}
```

Find in the fetch body:
```ts
consent: ectSelected ? consent : undefined,
```
Replace with:
```ts
consent: consentRequired ? consent : undefined,
```

- [ ] **Step 4: Replace the consent checkbox section**

Find the `{ectSelected && (` block and replace it with:
```tsx
{consentRequired && (
  <div className="space-y-2">
    <label className="flex items-start gap-3 cursor-pointer bg-amber-50 border border-amber-200 rounded-xl p-4">
      <input
        type="checkbox"
        checked={consent}
        onChange={e => setConsent(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0"
      />
      <span className="text-sm text-amber-900">
        I consent to use data from third-party sources (ECT, Apify) in this enrichment run.
      </span>
    </label>
    {apifySelected && (
      <p className="text-xs text-on-surface-variant px-1">
        Google Maps and ECT Leads use the Apify API (paid per run). Ensure{" "}
        <code className="font-mono bg-surface-container px-1 rounded">APIFY_TOKEN</code>{" "}
        is configured in the environment.
      </p>
    )}
  </div>
)}
```

---

## Task 5: Lint, TypeScript, and tests

**Files:** none modified — validation only

- [ ] **Step 1: Run TypeScript compiler**

```bash
cd /workspaces/roasters-hub/web && npx tsc --noEmit 2>&1 | head -50
```

Expected: no errors. Fix any type errors before continuing.

- [ ] **Step 2: Run linter**

```bash
cd /workspaces/roasters-hub/web && npx eslint src/lib/enrichment/adapters/apify.adapter.ts src/app/admin/enrichment/new/_components/NewRunForm.tsx 2>&1
```

Expected: no errors or warnings.

- [ ] **Step 3: Run full adapter test suite**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/adapters/apify.adapter.test.ts 2>&1
```

Expected: all tests pass.

- [ ] **Step 4: Run full enrichment test suite**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/ 2>&1
```

Expected: all tests pass (engine, normalizer, merger, differ + new adapter tests).

---

## Task 6: Commit

- [ ] **Step 1: Stage the changes**

```bash
cd /workspaces/roasters-hub && git add \
  web/src/lib/enrichment/adapters/apify.adapter.ts \
  web/src/lib/enrichment/adapters/apify.adapter.test.ts \
  web/src/app/admin/enrichment/new/_components/NewRunForm.tsx
```

- [ ] **Step 2: Commit**

```bash
cd /workspaces/roasters-hub && git commit -m "$(cat <<'EOF'
[UI] feat: wire Apify sources into enrichment UI — fix adapter field mappings

- Add transformItem hook to ApifyAdapterConfig for pre-processing nested responses
- Fix createApifyEnrichmentAdapter: invert fieldMapping, use maxCrawledPlacesPerSearch,
  add locationQuery + language + scrapeSocialMediaProfiles
- Fix createApifyEctLeadsAdapter: city-slug URL from query.city, transformItem flattens
  latLng/detail nested fields, correct fieldMapping
- Add toCitySlug helper (strips diacritics, lowercases)
- NewRunForm: add apify-enrichment + apify-ect-leads sources, update consent logic
- Unit tests for transformItem and input builders

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Live Test Verification

**Manual verification via browser — run after commit.**

This is approach C: trigger a live Apify run to confirm data actually flows end-to-end.

- [ ] **Step 1: Start dev server**

```bash
cd /workspaces/roasters-hub/web && npm run dev 2>&1 &
```

Wait for `ready - started server on 0.0.0.0:3000`.

- [ ] **Step 2: Test T1 — ECT Leads discover**

Navigate to `http://localhost:3000/admin/enrichment/new`.

Configure:
- Entity type: **CAFE**
- Mode: **discover**
- Sources: check **ECT Leads (Apify)**
- City: `Warsaw`
- Limit: `3`
- Check consent checkbox

Click "Start run →". You will be redirected to the run review page.

**Pass criteria:**
- Run status: `DONE` (not `FAILED` or `TIMED-OUT`)
- At least 1 proposal created
- Proposals have `fieldKey` values from: `name`, `address`, `lat`, `lng`, `website`, `instagram`
- Proposal `sourceId` starts with `apify:xnKEn9W0d8qAuzMRx:`

**Failure diagnosis:**
- `FAILED` run → check server terminal for `[apify-ect-leads] discover failed:` error
- 0 proposals → open browser DevTools → Network → check the `POST /api/enrichment/run` response; then check normalizer (`fieldKey` must match schema field names)
- Wrong city → check that `toCitySlug('Warsaw')` returns `'warsaw'`

- [ ] **Step 3: Test T2 — Google Maps discover**

Configure:
- Entity type: **CAFE**
- Mode: **discover**
- Sources: check **Google Maps (Apify)**
- City: `Warsaw`
- Country: `PL`
- Limit: `3`
- Check consent checkbox

**Pass criteria:**
- Run status: `DONE`
- Proposals have `name`, `address`, `lat`, `lng`
- Proposal `sourceId` starts with `apify:nwua9Gu5YrADL7ZDj:`

- [ ] **Step 4: Record any issues**

If either test fails, note the error in a comment on this plan task. Common fixes:
- If Google Maps returns `location.lat` (nested) instead of `latitude` → add a `transformItem` to `createApifyEnrichmentAdapter` that flattens `location.lat/lng`
- If field names differ from expected → update `fieldMapping` keys to match actual Apify response keys
- If actor input rejected → check Apify console for error details; adjust query builder

---

## Summary

| Task | Files | Tests |
|------|-------|-------|
| 1: transformItem hook | `apify.adapter.ts` | 1 test |
| 2: Fix Google Maps adapter | `apify.adapter.ts` | 3 tests |
| 3: Fix ECT adapter | `apify.adapter.ts` | 4 tests |
| 4: NewRunForm UI | `NewRunForm.tsx` | — |
| 5: Lint + tsc + tests | — | all green |
| 6: Commit | — | — |
| 7: Live test | — | manual |
