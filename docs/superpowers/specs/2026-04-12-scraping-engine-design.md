# Spec: Scraping Engine — Data Enrichment Module

**Date:** 2026-04-12
**Author:** @MN
**Status:** Approved

---

## Context

Projekt roasters-hub potrzebuje mechanizmu do legalnego, automatycznego pozyskiwania i wzbogacania danych o kawiarniach i palarniach. Aktualnie dane są seedowane ręcznie lub jednorazowymi skryptami (`tools/scrape_cafes_final.ts`, `tools/geocode_and_seed.ts`).

Celem jest modularny silnik który:
- Odkrywa nowe miejsca (kawiarnie, palarnie) z publicznych źródeł
- Wzbogaca istniejące wpisy o brakujące pola
- Proponuje zmiany do zatwierdzenia przez admina
- Jest w pełni legalny (oficjalne API + scraping własnych stron biznesów)
- Można rozszerzać o nowe źródła i pola bez zmian w core logice

**Focus geograficzny:** PL + DE na start, Europa docelowo.
**Trigger:** manualny (MVP), docelowo cron/AI agent.

---

## Taxonomia danych

### Palarnia (Roaster)

| Pole | Grupa | Priorytet | Status |
|------|-------|-----------|--------|
| name | IDENTITY | REQUIRED | ✅ w bazie |
| description | IDENTITY | IMPORTANT | ✅ w bazie |
| foundedYear | IDENTITY | OPTIONAL | 🆕 nowe |
| logoUrl | IDENTITY | OPTIONAL | 🆕 nowe |
| country / countryCode | LOCATION | REQUIRED | ✅ w bazie |
| city | LOCATION | REQUIRED | ✅ w bazie |
| address | LOCATION | IMPORTANT | 🆕 nowe |
| lat / lng | LOCATION | IMPORTANT | ✅ w bazie |
| postalCode | LOCATION | OPTIONAL | 🆕 nowe |
| website | CONTACT | IMPORTANT | ✅ w bazie |
| email | CONTACT | IMPORTANT | ✅ w bazie |
| phone | CONTACT | IMPORTANT | 🆕 nowe |
| shopUrl | CONTACT | OPTIONAL | ✅ w bazie |
| instagram | SOCIAL | OPTIONAL | ✅ w bazie |
| facebook | SOCIAL | OPTIONAL | ✅ w bazie |
| origins | PRODUCT | IMPORTANT | ✅ w bazie |
| roastStyles | PRODUCT | IMPORTANT | ✅ w bazie |
| certifications | PRODUCT | OPTIONAL | ✅ w bazie |
| brewingMethods | PRODUCT | OPTIONAL | 🆕 nowe |
| wholesaleAvailable | PRODUCT | OPTIONAL | 🆕 nowe |
| subscriptionAvailable | PRODUCT | OPTIONAL | 🆕 nowe |
| openingHours | VISIT | OPTIONAL | 🆕 nowe |
| hasCafe | VISIT | OPTIONAL | 🆕 nowe |
| hasTastingRoom | VISIT | OPTIONAL | 🆕 nowe |

### Kawiarnia (Cafe)

| Pole | Grupa | Priorytet | Status |
|------|-------|-----------|--------|
| name | IDENTITY | REQUIRED | ✅ w bazie |
| description | IDENTITY | IMPORTANT | ✅ w bazie |
| logoUrl | IDENTITY | OPTIONAL | ✅ w bazie |
| coverImageUrl | IDENTITY | OPTIONAL | ✅ w bazie |
| country / countryCode | LOCATION | REQUIRED | ✅ w bazie |
| city | LOCATION | REQUIRED | ✅ w bazie |
| address | LOCATION | REQUIRED | ✅ w bazie |
| lat / lng | LOCATION | IMPORTANT | ✅ w bazie |
| postalCode | LOCATION | OPTIONAL | 🆕 nowe |
| website | CONTACT | IMPORTANT | ✅ w bazie |
| phone | CONTACT | IMPORTANT | ✅ w bazie |
| email | CONTACT | OPTIONAL | 🆕 nowe |
| instagram | SOCIAL | OPTIONAL | ✅ w bazie |
| openingHours | ENRICHMENT | IMPORTANT | ✅ w bazie (JSON) |
| serving | ENRICHMENT | IMPORTANT | ✅ w bazie |
| services | ENRICHMENT | OPTIONAL | ✅ w bazie (enum tags) |
| priceRange | ENRICHMENT | OPTIONAL | 🆕 nowe |
| seatingCapacity | ENRICHMENT | OPTIONAL | 🆕 nowe |

**Uwaga `services[]`:** pozostaje jako elastyczna tablica tagów z defined enum w `constants/cafe-services.ts`. PostgreSQL ma indeks GIN na tej kolumnie. Nowy tag = jedna linijka w stałych, zero migracji DB.

---

## Architektura

```
[Source Adapters]  →  [Engine Core]  →  [Proposal Store]  →  [Review UI]
  OSM, website          normalize          DB tabela           /admin
  ECT (optional)        merge, diff        EnrichmentProposal  (future)
                        confidence score
```

### Struktura plików

```
web/src/lib/enrichment/
  schemas/
    types.ts                ← FieldDef, EntitySchema, FieldGroup, FieldPriority
    roaster.schema.ts       ← EntitySchema dla palarni
    cafe.schema.ts          ← EntitySchema dla kawiarni
  adapters/
    base.ts                 ← SourceAdapter interface + typy
    osm.adapter.ts          ← OpenStreetMap / Overpass API
    website.adapter.ts      ← Scraping własnych stron (robots.txt + rate limit)
    ect.adapter.ts          ← European Coffee Trip (disabled by default, requiresConsent: true)
  engine/
    engine.ts               ← orchestrator: run() → EnrichmentRun
    normalizer.ts           ← RawPlace → NormalizedField[] + confidence
    merger.ts               ← merge z wielu źródeł, conflict resolution
    differ.ts               ← diff z aktualną DB → proposals
  registry.ts               ← rejestracja adapterów
web/src/app/api/enrichment/
  run/route.ts              ← POST /api/enrichment/run
  run/[runId]/route.ts      ← GET /api/enrichment/run/[runId]
web/src/constants/
  cafe-services.ts          ← enum tagów dla services[]
  roaster-brewing-methods.ts ← enum brewing methods
```

---

## Sekcja 1: EntitySchema

Dwa pliki TypeScript — nie baza danych. Nowe pole w taxonomii = jedna linijka.

```typescript
// web/src/lib/enrichment/schemas/types.ts
type FieldPriority = 'REQUIRED' | 'IMPORTANT' | 'OPTIONAL'
type FieldGroup = 'IDENTITY' | 'LOCATION' | 'CONTACT' | 'SOCIAL' | 'PRODUCT' | 'ENRICHMENT' | 'VISIT'
type EntityType = 'ROASTER' | 'CAFE'

interface FieldDef {
  key: string
  group: FieldGroup
  priority: FieldPriority
  isArray?: boolean
  validate?: (value: unknown) => boolean
  normalize?: (value: unknown) => unknown
}

interface EntitySchema {
  entityType: EntityType
  fields: FieldDef[]
}
```

---

## Sekcja 2: Source Adapters

```typescript
// web/src/lib/enrichment/adapters/base.ts
interface SourceAdapter {
  id: string
  name: string
  supports: EntityType[]
  reliability: number           // 0-1, wpływa na confidence score
  requiresConsent?: boolean     // dla adapterów z grey-area ToS

  discover(query: DiscoveryQuery): Promise<RawPlace[]>
  enrich(place: KnownPlace): Promise<Partial<RawPlace>>
}

interface DiscoveryQuery {
  entityType: EntityType
  country?: string
  city?: string
  bbox?: { north: number; south: number; east: number; west: number }
  limit?: number
}

interface KnownPlace {
  id: string
  entityType: EntityType
  name: string
  website?: string
  lat?: number
  lng?: number
}

interface RawPlace {
  sourceId: string
  fields: Record<string, unknown>
  sourceUrl?: string
}
```

**Adaptery MVP:**

| Adapter | Reliability | Discovery | Enrich | Koszt |
|---------|-------------|-----------|--------|-------|
| `osm` | 0.7 | ✅ Overpass API query | ✅ | Darmowy |
| `website` | 0.9 | ❌ | ✅ robots.txt + rate limit | Darmowy |
| `ect` | 0.8 | ✅ | ✅ | Darmowy (disabled by default) |

**OSM Adapter:** zapytania Overpass po tagach `amenity=cafe` / `craft=coffee_roaster` w obszarze geograficznym. Dobre dane lokalizacyjne, słabe kontaktowe.

**Website Adapter:** pobiera stronę z `website` URL, parsuje kontakt, godziny otwarcia, opis. Najwyższy reliability — biznes sam publikuje dane. Respektuje `robots.txt`, rate limiting 1 req/s per domain.

**ECT Adapter:** European Coffee Trip — lista i profile kawiarni specialty. Wymaga jawnej flagi `consent: true` przy wywołaniu API.

---

## Sekcja 3: Engine Core

**Pipeline: Normalize → Merge → Diff → Propose**

```typescript
// normalizer.ts
// confidence = reliability adaptera × completeness pola (0-1)
interface NormalizedField {
  key: string
  value: unknown
  confidence: number
  sourceId: string
  sourceUrl?: string
}

// merger.ts
// Scalar fields: wygrywa najwyższy confidence
// Array fields (origins, services, certifications): unia wartości

// differ.ts
// changeType:
// 'NEW_PLACE'  — miejsce nie istnieje w DB
// 'FILL'       — pole jest null/empty w DB
// 'UPDATE'     — pole ma inną wartość niż proposed
// 'SKIP'       — wartość identyczna → brak proposal (nie zapisywane)
```

**Przykład wyniku jednego runu:**

```
Run #abc123 — "Cafes in Warsaw" — OSM + website
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEW_PLACE  "Cafe Karma"           12 fields   confidence: 0.75
FILL       "Relax Cafe" → phone   +48 22 ...  confidence: 0.90
UPDATE     "Black Cat" → website  new-url.com confidence: 0.85
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3 proposals pending review
```

---

## Sekcja 4: Prisma Schema + Trigger API

### Nowe modele Prisma

```prisma
model EnrichmentRun {
  id          String               @id @default(cuid())
  entityType  String               // 'ROASTER' | 'CAFE'
  query       Json                 // DiscoveryQuery snapshot
  sources     String[]             // ['osm', 'website']
  status      String               // 'RUNNING' | 'DONE' | 'FAILED'
  stats       Json                 // { discovered, enriched, skipped }
  proposals   EnrichmentProposal[]
  createdAt   DateTime             @default(now())
  completedAt DateTime?
}

model EnrichmentProposal {
  id             String        @id @default(cuid())
  runId          String
  run            EnrichmentRun @relation(fields: [runId], references: [id])
  entityType     String
  entityId       String?       // null = nowe miejsce
  entityName     String
  changeType     String        // 'NEW_PLACE' | 'FILL' | 'UPDATE'
  fieldKey       String
  fieldGroup     String
  fieldPriority  String
  currentValue   Json?
  proposedValue  Json
  confidence     Float
  sourceId       String
  sourceUrl      String?
  status         String        @default("PENDING")
  reviewedAt     DateTime?
  reviewedBy     String?
  createdAt      DateTime      @default(now())

  @@index([runId])
  @@index([entityId])
  @@index([status])
}
```

### Nowe pola na istniejących modelach

**Roaster (migracja Prisma):**
`address String?`, `postalCode String?`, `phone String?`, `foundedYear Int?`, `brewingMethods String[]`, `wholesaleAvailable Boolean?`, `subscriptionAvailable Boolean?`, `openingHours Json?`, `hasCafe Boolean?`, `hasTastingRoom Boolean?`

**Cafe (migracja Prisma):**
`postalCode String?`, `email String?`, `priceRange String?`, `seatingCapacity Int?`

### Trigger API (manual MVP)

```
POST /api/enrichment/run
Body: {
  entityType: 'CAFE' | 'ROASTER'
  country?: string          // np. 'Poland'
  city?: string             // np. 'Warsaw'
  sources?: string[]        // default: ['osm', 'website']
  mode?: 'discover' | 'enrich' | 'both'   // default: 'both'
  limit?: number            // max nowych miejsc, default: 50
  consent?: boolean         // wymagane dla ect adapter
}
Response: { runId: string }

GET /api/enrichment/run/[runId]
Response: EnrichmentRun + proposals[]
```

Docelowo: ten sam endpoint wywoływany przez cron job lub AI agenta.

---

## Legalność — guardrails wbudowane w engine

1. **robots.txt** — `website.adapter.ts` sprawdza `robots.txt` przed każdym requestem
2. **Rate limiting** — 1 req/s per domain, konfigurowalny per adapter
3. **User-Agent** — identyfikuje się jako `BeanMapBot/1.0 (+https://beanmap.coffee/bot)`
4. **ToS consent** — adaptery z `requiresConsent: true` wymagają `consent: true` w body API
5. **Dane osobowe** — engine zbiera tylko dane biznesowe publiczne, nie osobowe
6. **sourceUrl** — każda propozycja przechowuje URL źródła (audit trail)
7. **Brak nadpisywania** — engine NIGDY nie modyfikuje danych bezpośrednio; wszystko idzie przez `EnrichmentProposal` z `status: PENDING`

---

## Krytyczne pliki do modyfikacji

- [web/prisma/schema.prisma](../../web/prisma/schema.prisma) — nowe modele + nowe pola na Roaster i Cafe
- `web/src/lib/enrichment/` — cały nowy moduł (nowe pliki)
- `web/src/app/api/enrichment/` — nowe route handlery (nowe pliki)
- `web/src/constants/cafe-services.ts` — enum tagów (nowy lub rozszerzony)

---

## Weryfikacja

1. `npx tsc --noEmit` — zero błędów typów
2. `npm run lint` — zero błędów
3. Ręczny test discovery: `POST /api/enrichment/run` z `{ entityType: 'CAFE', city: 'Warsaw', sources: ['osm'], mode: 'discover', limit: 5 }`
4. Sprawdzić `EnrichmentRun.status === 'DONE'` + `EnrichmentProposal` rekordy w DB
5. Sprawdzić confidence scores i changeType dla każdego proposal
6. Test enrichment: wziąć istniejącą kawiarnię bez `phone`, uruchomić z `mode: 'enrich'` → proposal `FILL` dla `phone`
7. Test legalności: weryfikacja że `website.adapter.ts` respektuje `robots.txt` (test z domeną która ma `Disallow: /`)
