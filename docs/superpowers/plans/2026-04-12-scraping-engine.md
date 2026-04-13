# Scraping Engine — Data Enrichment Module — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modular, legal scraping engine that discovers new cafes/roasters from public sources and enriches existing profiles with missing data, storing proposed changes for admin review.

**Architecture:** Schema-driven pipeline (Normalize → Merge → Diff → Propose). Each entity type has a TypeScript config file defining fields with groups and priorities. Source adapters implement one interface. The engine is a pure orchestrator — it never writes directly to Cafe/Roaster tables, only to EnrichmentProposal.

**Tech Stack:** Next.js App Router, Prisma (Neon/PostgreSQL), Vitest, native fetch, OpenStreetMap Overpass API.

**Spec:** `docs/superpowers/specs/2026-04-12-scraping-engine-design.md`

**Branch:** `feat/mn-scraping-engine`

---

## File Map

```
NEW FILES:
web/src/lib/enrichment/schemas/types.ts
web/src/lib/enrichment/schemas/roaster.schema.ts
web/src/lib/enrichment/schemas/cafe.schema.ts
web/src/lib/enrichment/adapters/base.ts
web/src/lib/enrichment/adapters/osm.adapter.ts
web/src/lib/enrichment/adapters/website.adapter.ts
web/src/lib/enrichment/adapters/ect.adapter.ts
web/src/lib/enrichment/engine/normalizer.ts
web/src/lib/enrichment/engine/normalizer.test.ts
web/src/lib/enrichment/engine/merger.ts
web/src/lib/enrichment/engine/merger.test.ts
web/src/lib/enrichment/engine/differ.ts
web/src/lib/enrichment/engine/differ.test.ts
web/src/lib/enrichment/engine/engine.ts
web/src/lib/enrichment/engine/engine.test.ts
web/src/lib/enrichment/registry.ts
web/src/app/api/enrichment/run/route.ts
web/src/app/api/enrichment/run/[runId]/route.ts
web/src/constants/cafe-services.ts
web/src/constants/roaster-brewing-methods.ts

MODIFIED:
web/prisma/schema.prisma  (new models + new fields on Roaster/Cafe)
```

---

## Task 1: Prisma Schema — New models + new fields

**Files:**
- Modify: `web/prisma/schema.prisma`

- [ ] **Step 1: Add new fields to Roaster model**

Open `web/prisma/schema.prisma`. Find the `model Roaster` block and add these fields before the `createdAt` line:

```prisma
  address              String?
  postalCode           String?
  phone                String?
  foundedYear          Int?
  brewingMethods       String[]
  wholesaleAvailable   Boolean?
  subscriptionAvailable Boolean?
  openingHours         Json?
  hasCafe              Boolean?
  hasTastingRoom       Boolean?
```

- [ ] **Step 2: Add new fields to Cafe model**

In `model Cafe`, add before `createdAt`:

```prisma
  postalCode     String?
  email          String?
  priceRange     String?
  seatingCapacity Int?
```

- [ ] **Step 3: Add EnrichmentRun model**

Append after the last model in `schema.prisma`:

```prisma
model EnrichmentRun {
  id          String               @id @default(cuid())
  entityType  String
  query       Json
  sources     String[]
  status      String               @default("RUNNING")
  stats       Json                 @default("{}")
  proposals   EnrichmentProposal[]
  createdAt   DateTime             @default(now())
  completedAt DateTime?
}
```

- [ ] **Step 4: Add EnrichmentProposal model**

```prisma
model EnrichmentProposal {
  id            String        @id @default(cuid())
  runId         String
  run           EnrichmentRun @relation(fields: [runId], references: [id])
  entityType    String
  entityId      String?
  entityName    String
  changeType    String
  fieldKey      String
  fieldGroup    String
  fieldPriority String
  currentValue  Json?
  proposedValue Json
  confidence    Float
  sourceId      String
  sourceUrl     String?
  status        String        @default("PENDING")
  reviewedAt    DateTime?
  reviewedBy    String?
  createdAt     DateTime      @default(now())

  @@index([runId])
  @@index([entityId])
  @@index([status])
}
```

- [ ] **Step 5: Run migration**

```bash
cd /workspaces/roasters-hub/web
npx prisma migrate dev --name enrichment_engine
```

Expected: migration created and applied, Prisma client regenerated.

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd /workspaces/roasters-hub/web
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git checkout -b feat/mn-scraping-engine
git add web/prisma/schema.prisma web/prisma/migrations/
git commit -m "DB: add EnrichmentRun, EnrichmentProposal models + taxonomy fields on Roaster/Cafe"
```

---

## Task 2: Constants — Cafe services + roaster brewing methods

**Files:**
- Create: `web/src/constants/cafe-services.ts`
- Create: `web/src/constants/roaster-brewing-methods.ts`

- [ ] **Step 1: Create cafe-services.ts**

```typescript
// web/src/constants/cafe-services.ts

export const CAFE_SERVICES = [
  { value: 'wifi',             label: 'Wi-Fi',            group: 'amenities' },
  { value: 'workspace',        label: 'Workspace',        group: 'amenities' },
  { value: 'outdoor_seating',  label: 'Outdoor seating',  group: 'amenities' },
  { value: 'dog_friendly',     label: 'Dog friendly',     group: 'amenities' },
  { value: 'vegan',            label: 'Vegan options',    group: 'food' },
  { value: 'vegetarian',       label: 'Vegetarian',       group: 'food' },
  { value: 'food',             label: 'Food menu',        group: 'food' },
  { value: 'specialty_only',   label: 'Specialty only',   group: 'coffee' },
  { value: 'alternative_brew', label: 'Alt brew methods', group: 'coffee' },
  { value: 'takeaway',         label: 'Takeaway',         group: 'service' },
  { value: 'in_store',         label: 'Dine in',          group: 'service' },
  { value: 'events',           label: 'Events',           group: 'service' },
  { value: 'cuppings',         label: 'Cuppings',         group: 'service' },
] as const

export type CafeServiceValue = (typeof CAFE_SERVICES)[number]['value']
```

- [ ] **Step 2: Create roaster-brewing-methods.ts**

```typescript
// web/src/constants/roaster-brewing-methods.ts

export const ROASTER_BREWING_METHODS = [
  { value: 'espresso',    label: 'Espresso' },
  { value: 'filter',      label: 'Filter' },
  { value: 'pour_over',   label: 'Pour over' },
  { value: 'french_press',label: 'French press' },
  { value: 'cold_brew',   label: 'Cold brew' },
  { value: 'aeropress',   label: 'AeroPress' },
  { value: 'moka_pot',    label: 'Moka pot' },
] as const

export type BrewingMethodValue = (typeof ROASTER_BREWING_METHODS)[number]['value']
```

- [ ] **Step 3: Commit**

```bash
git add web/src/constants/
git commit -m "feat: add cafe-services and roaster-brewing-methods constants"
```

---

## Task 3: Types + EntitySchemas

**Files:**
- Create: `web/src/lib/enrichment/schemas/types.ts`
- Create: `web/src/lib/enrichment/schemas/roaster.schema.ts`
- Create: `web/src/lib/enrichment/schemas/cafe.schema.ts`

- [ ] **Step 1: Create types.ts**

```typescript
// web/src/lib/enrichment/schemas/types.ts

export type FieldPriority = 'REQUIRED' | 'IMPORTANT' | 'OPTIONAL'
export type FieldGroup =
  | 'IDENTITY'
  | 'LOCATION'
  | 'CONTACT'
  | 'SOCIAL'
  | 'PRODUCT'
  | 'ENRICHMENT'
  | 'VISIT'
export type EntityType = 'ROASTER' | 'CAFE'

export interface FieldDef {
  key: string
  group: FieldGroup
  priority: FieldPriority
  isArray?: boolean
}

export interface EntitySchema {
  entityType: EntityType
  fields: FieldDef[]
}
```

- [ ] **Step 2: Create roaster.schema.ts**

```typescript
// web/src/lib/enrichment/schemas/roaster.schema.ts

import type { EntitySchema } from './types'

export const RoasterSchema: EntitySchema = {
  entityType: 'ROASTER',
  fields: [
    // IDENTITY
    { key: 'name',                 group: 'IDENTITY',  priority: 'REQUIRED'   },
    { key: 'description',          group: 'IDENTITY',  priority: 'IMPORTANT'  },
    { key: 'foundedYear',          group: 'IDENTITY',  priority: 'OPTIONAL'   },
    // LOCATION
    { key: 'country',              group: 'LOCATION',  priority: 'REQUIRED'   },
    { key: 'city',                 group: 'LOCATION',  priority: 'REQUIRED'   },
    { key: 'address',              group: 'LOCATION',  priority: 'IMPORTANT'  },
    { key: 'lat',                  group: 'LOCATION',  priority: 'IMPORTANT'  },
    { key: 'lng',                  group: 'LOCATION',  priority: 'IMPORTANT'  },
    { key: 'postalCode',           group: 'LOCATION',  priority: 'OPTIONAL'   },
    // CONTACT
    { key: 'website',              group: 'CONTACT',   priority: 'IMPORTANT'  },
    { key: 'email',                group: 'CONTACT',   priority: 'IMPORTANT'  },
    { key: 'phone',                group: 'CONTACT',   priority: 'IMPORTANT'  },
    { key: 'shopUrl',              group: 'CONTACT',   priority: 'OPTIONAL'   },
    // SOCIAL
    { key: 'instagram',            group: 'SOCIAL',    priority: 'OPTIONAL'   },
    { key: 'facebook',             group: 'SOCIAL',    priority: 'OPTIONAL'   },
    // PRODUCT
    { key: 'origins',              group: 'PRODUCT',   priority: 'IMPORTANT',  isArray: true },
    { key: 'roastStyles',          group: 'PRODUCT',   priority: 'IMPORTANT',  isArray: true },
    { key: 'certifications',       group: 'PRODUCT',   priority: 'OPTIONAL',   isArray: true },
    { key: 'brewingMethods',       group: 'PRODUCT',   priority: 'OPTIONAL',   isArray: true },
    { key: 'wholesaleAvailable',   group: 'PRODUCT',   priority: 'OPTIONAL'   },
    { key: 'subscriptionAvailable',group: 'PRODUCT',   priority: 'OPTIONAL'   },
    // VISIT
    { key: 'openingHours',         group: 'VISIT',     priority: 'OPTIONAL'   },
    { key: 'hasCafe',              group: 'VISIT',     priority: 'OPTIONAL'   },
    { key: 'hasTastingRoom',       group: 'VISIT',     priority: 'OPTIONAL'   },
  ],
}
```

- [ ] **Step 3: Create cafe.schema.ts**

```typescript
// web/src/lib/enrichment/schemas/cafe.schema.ts

import type { EntitySchema } from './types'

export const CafeSchema: EntitySchema = {
  entityType: 'CAFE',
  fields: [
    // IDENTITY
    { key: 'name',          group: 'IDENTITY',    priority: 'REQUIRED'   },
    { key: 'description',   group: 'IDENTITY',    priority: 'IMPORTANT'  },
    // LOCATION
    { key: 'country',       group: 'LOCATION',    priority: 'REQUIRED'   },
    { key: 'city',          group: 'LOCATION',    priority: 'REQUIRED'   },
    { key: 'address',       group: 'LOCATION',    priority: 'REQUIRED'   },
    { key: 'lat',           group: 'LOCATION',    priority: 'IMPORTANT'  },
    { key: 'lng',           group: 'LOCATION',    priority: 'IMPORTANT'  },
    { key: 'postalCode',    group: 'LOCATION',    priority: 'OPTIONAL'   },
    // CONTACT
    { key: 'website',       group: 'CONTACT',     priority: 'IMPORTANT'  },
    { key: 'phone',         group: 'CONTACT',     priority: 'IMPORTANT'  },
    { key: 'email',         group: 'CONTACT',     priority: 'OPTIONAL'   },
    // SOCIAL
    { key: 'instagram',     group: 'SOCIAL',      priority: 'OPTIONAL'   },
    // ENRICHMENT
    { key: 'openingHours',  group: 'ENRICHMENT',  priority: 'IMPORTANT'  },
    { key: 'serving',       group: 'ENRICHMENT',  priority: 'IMPORTANT',  isArray: true },
    { key: 'services',      group: 'ENRICHMENT',  priority: 'OPTIONAL',   isArray: true },
    { key: 'priceRange',    group: 'ENRICHMENT',  priority: 'OPTIONAL'   },
    { key: 'seatingCapacity', group: 'ENRICHMENT', priority: 'OPTIONAL'  },
  ],
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd /workspaces/roasters-hub/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/enrichment/schemas/ web/src/constants/
git commit -m "feat: EntitySchema types + roaster/cafe schemas + constants"
```

---

## Task 4: Source Adapter base types

**Files:**
- Create: `web/src/lib/enrichment/adapters/base.ts`

- [ ] **Step 1: Create base.ts**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /workspaces/roasters-hub/web && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/enrichment/adapters/base.ts
git commit -m "feat: SourceAdapter base interface + types"
```

---

## Task 5: Normalizer (TDD)

**Files:**
- Create: `web/src/lib/enrichment/engine/normalizer.ts`
- Create: `web/src/lib/enrichment/engine/normalizer.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// web/src/lib/enrichment/engine/normalizer.test.ts

import { describe, it, expect } from 'vitest'
import { normalize } from './normalizer'
import { CafeSchema } from '../schemas/cafe.schema'
import type { RawPlace } from '../adapters/base'

describe('normalize', () => {
  const adapter = { id: 'osm', reliability: 0.7 }

  it('maps raw fields that exist in schema to NormalizedField[]', () => {
    const raw: RawPlace = {
      sourceId: 'osm:123',
      fields: { name: 'Cafe X', phone: '+48 22 123', unknownField: 'ignored' },
      sourceUrl: 'https://osm.org/node/123',
    }
    const result = normalize(raw, CafeSchema, adapter)

    expect(result).toHaveLength(2)
    const nameField = result.find((f) => f.key === 'name')
    expect(nameField).toEqual({
      key: 'name',
      value: 'Cafe X',
      confidence: 0.7,
      sourceId: 'osm',
      sourceUrl: 'https://osm.org/node/123',
    })
  })

  it('filters out null and undefined values', () => {
    const raw: RawPlace = {
      sourceId: 'osm:1',
      fields: { name: 'Cafe X', phone: null, website: undefined },
    }
    const result = normalize(raw, CafeSchema, adapter)
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('name')
  })

  it('filters out empty strings', () => {
    const raw: RawPlace = {
      sourceId: 'osm:1',
      fields: { name: 'Cafe X', phone: '' },
    }
    const result = normalize(raw, CafeSchema, adapter)
    expect(result).toHaveLength(1)
  })

  it('includes sourceUrl as undefined when not provided', () => {
    const raw: RawPlace = { sourceId: 'osm:1', fields: { name: 'X' } }
    const result = normalize(raw, CafeSchema, adapter)
    expect(result[0].sourceUrl).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/engine/normalizer.test.ts
```

Expected: FAIL — "Cannot find module './normalizer'"

- [ ] **Step 3: Implement normalizer.ts**

```typescript
// web/src/lib/enrichment/engine/normalizer.ts

import type { EntitySchema } from '../schemas/types'
import type { RawPlace } from '../adapters/base'

export interface NormalizedField {
  key: string
  value: unknown
  confidence: number
  sourceId: string
  sourceUrl?: string
}

export function normalize(
  raw: RawPlace,
  schema: EntitySchema,
  adapter: { id: string; reliability: number },
): NormalizedField[] {
  const schemaKeys = new Set(schema.fields.map((f) => f.key))
  const result: NormalizedField[] = []

  for (const [key, value] of Object.entries(raw.fields)) {
    if (!schemaKeys.has(key)) continue
    if (value === null || value === undefined || value === '') continue

    result.push({
      key,
      value,
      confidence: adapter.reliability,
      sourceId: adapter.id,
      sourceUrl: raw.sourceUrl,
    })
  }

  return result
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/engine/normalizer.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/enrichment/engine/
git commit -m "feat: normalizer — RawPlace → NormalizedField[] with confidence scoring"
```

---

## Task 6: Merger (TDD)

**Files:**
- Create: `web/src/lib/enrichment/engine/merger.ts`
- Create: `web/src/lib/enrichment/engine/merger.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// web/src/lib/enrichment/engine/merger.test.ts

import { describe, it, expect } from 'vitest'
import { merge } from './merger'
import { CafeSchema } from '../schemas/cafe.schema'
import { RoasterSchema } from '../schemas/roaster.schema'
import type { NormalizedField } from './normalizer'

describe('merge', () => {
  it('picks the field with highest confidence for scalar fields', () => {
    const fields: NormalizedField[] = [
      { key: 'website', value: 'http://a.com', confidence: 0.7, sourceId: 'osm' },
      { key: 'website', value: 'https://a.com', confidence: 0.9, sourceId: 'website' },
    ]
    const result = merge(fields, CafeSchema)
    expect(result['website'].value).toBe('https://a.com')
    expect(result['website'].sourceId).toBe('website')
  })

  it('keeps existing winner when new confidence is lower', () => {
    const fields: NormalizedField[] = [
      { key: 'phone', value: '+48 22 high', confidence: 0.9, sourceId: 'website' },
      { key: 'phone', value: '+48 22 low',  confidence: 0.6, sourceId: 'osm' },
    ]
    const result = merge(fields, CafeSchema)
    expect(result['phone'].value).toBe('+48 22 high')
  })

  it('unions values for array fields', () => {
    const fields: NormalizedField[] = [
      { key: 'origins', value: ['Ethiopia', 'Kenya'],    confidence: 0.7, sourceId: 'osm' },
      { key: 'origins', value: ['Ethiopia', 'Colombia'], confidence: 0.8, sourceId: 'website' },
    ]
    const result = merge(fields, RoasterSchema)
    const values = result['origins'].value as string[]
    expect(values).toHaveLength(3)
    expect(values).toContain('Ethiopia')
    expect(values).toContain('Kenya')
    expect(values).toContain('Colombia')
  })

  it('returns empty object for empty input', () => {
    expect(merge([], CafeSchema)).toEqual({})
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/engine/merger.test.ts
```

Expected: FAIL — "Cannot find module './merger'"

- [ ] **Step 3: Implement merger.ts**

```typescript
// web/src/lib/enrichment/engine/merger.ts

import type { EntitySchema } from '../schemas/types'
import type { NormalizedField } from './normalizer'

export function merge(
  fields: NormalizedField[],
  schema: EntitySchema,
): Record<string, NormalizedField> {
  const arrayKeys = new Set(schema.fields.filter((f) => f.isArray).map((f) => f.key))
  const result: Record<string, NormalizedField> = {}

  for (const field of fields) {
    const existing = result[field.key]

    if (arrayKeys.has(field.key)) {
      // Union strategy for arrays
      const existingValues = (existing?.value as unknown[]) ?? []
      const newValues = Array.isArray(field.value) ? field.value : [field.value]
      result[field.key] = {
        ...field,
        value: [...new Set([...existingValues, ...newValues])],
      }
    } else {
      // Highest confidence wins for scalar fields
      if (!existing || field.confidence > existing.confidence) {
        result[field.key] = field
      }
    }
  }

  return result
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/engine/merger.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/enrichment/engine/merger.ts web/src/lib/enrichment/engine/merger.test.ts
git commit -m "feat: merger — multi-source conflict resolution with array union support"
```

---

## Task 7: Differ (TDD)

**Files:**
- Create: `web/src/lib/enrichment/engine/differ.ts`
- Create: `web/src/lib/enrichment/engine/differ.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// web/src/lib/enrichment/engine/differ.test.ts

import { describe, it, expect } from 'vitest'
import { diff } from './differ'
import { CafeSchema } from '../schemas/cafe.schema'
import type { NormalizedField } from './normalizer'

const merged: Record<string, NormalizedField> = {
  name:  { key: 'name',  value: 'Cafe X',       confidence: 0.9, sourceId: 'osm' },
  phone: { key: 'phone', value: '+48 22 123456', confidence: 0.7, sourceId: 'osm' },
}

describe('diff', () => {
  it('returns NEW_PLACE proposals when entity does not exist in DB (current = null)', () => {
    const proposals = diff(merged, null, 'CAFE', 'Cafe X', CafeSchema)
    expect(proposals).toHaveLength(2)
    expect(proposals.every((p) => p.changeType === 'NEW_PLACE')).toBe(true)
    expect(proposals[0].entityId).toBeUndefined()
  })

  it('returns FILL proposals for fields that are null in current entity', () => {
    const current = { id: 'c1', name: 'Cafe X', phone: null }
    const proposals = diff(
      { phone: merged.phone },
      current,
      'CAFE',
      'Cafe X',
      CafeSchema,
      'c1',
    )
    expect(proposals).toHaveLength(1)
    expect(proposals[0].changeType).toBe('FILL')
    expect(proposals[0].currentValue).toBeNull()
    expect(proposals[0].proposedValue).toBe('+48 22 123456')
  })

  it('returns UPDATE proposals when proposed value differs from current', () => {
    const current = { id: 'c1', name: 'Cafe X', phone: '+48 22 000000' }
    const proposals = diff(
      { phone: merged.phone },
      current,
      'CAFE',
      'Cafe X',
      CafeSchema,
      'c1',
    )
    expect(proposals).toHaveLength(1)
    expect(proposals[0].changeType).toBe('UPDATE')
    expect(proposals[0].currentValue).toBe('+48 22 000000')
  })

  it('skips fields where proposed value equals current value', () => {
    const current = { id: 'c1', name: 'Cafe X', phone: '+48 22 123456' }
    const proposals = diff(
      { phone: merged.phone },
      current,
      'CAFE',
      'Cafe X',
      CafeSchema,
      'c1',
    )
    expect(proposals).toHaveLength(0)
  })

  it('includes fieldGroup and fieldPriority from schema', () => {
    const proposals = diff(merged, null, 'CAFE', 'Cafe X', CafeSchema)
    const nameProposal = proposals.find((p) => p.fieldKey === 'name')
    expect(nameProposal?.fieldGroup).toBe('IDENTITY')
    expect(nameProposal?.fieldPriority).toBe('REQUIRED')
  })

  it('treats arrays as equal when contents match regardless of order', () => {
    const arrayMerged: Record<string, NormalizedField> = {
      services: { key: 'services', value: ['wifi', 'vegan'], confidence: 0.7, sourceId: 'osm' },
    }
    const current = { id: 'c1', services: ['vegan', 'wifi'] }
    const proposals = diff(arrayMerged, current, 'CAFE', 'Cafe X', CafeSchema, 'c1')
    expect(proposals).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/engine/differ.test.ts
```

Expected: FAIL — "Cannot find module './differ'"

- [ ] **Step 3: Implement differ.ts**

```typescript
// web/src/lib/enrichment/engine/differ.ts

import type { EntitySchema, EntityType } from '../schemas/types'
import type { NormalizedField } from './normalizer'

export interface DiffProposal {
  entityType: string
  entityId?: string
  entityName: string
  changeType: 'NEW_PLACE' | 'FILL' | 'UPDATE'
  fieldKey: string
  fieldGroup: string
  fieldPriority: string
  currentValue?: unknown
  proposedValue: unknown
  confidence: number
  sourceId: string
  sourceUrl?: string
}

function valuesAreEqual(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      JSON.stringify([...(a as unknown[])].sort()) ===
      JSON.stringify([...(b as unknown[])].sort())
    )
  }
  return JSON.stringify(a) === JSON.stringify(b)
}

export function diff(
  merged: Record<string, NormalizedField>,
  current: Record<string, unknown> | null,
  entityType: EntityType,
  entityName: string,
  schema: EntitySchema,
  entityId?: string,
): DiffProposal[] {
  const proposals: DiffProposal[] = []

  for (const [key, field] of Object.entries(merged)) {
    const schemaDef = schema.fields.find((f) => f.key === key)
    if (!schemaDef) continue

    const base: Omit<DiffProposal, 'changeType' | 'currentValue'> = {
      entityType,
      entityId,
      entityName,
      fieldKey: key,
      fieldGroup: schemaDef.group,
      fieldPriority: schemaDef.priority,
      proposedValue: field.value,
      confidence: field.confidence,
      sourceId: field.sourceId,
      sourceUrl: field.sourceUrl,
    }

    if (current === null) {
      proposals.push({ ...base, changeType: 'NEW_PLACE' })
      continue
    }

    const currentValue = current[key]

    if (currentValue === null || currentValue === undefined) {
      proposals.push({ ...base, changeType: 'FILL', currentValue: currentValue ?? null })
    } else if (!valuesAreEqual(currentValue, field.value)) {
      proposals.push({ ...base, changeType: 'UPDATE', currentValue })
    }
    // SKIP if equal
  }

  return proposals
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/engine/differ.test.ts
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/enrichment/engine/differ.ts web/src/lib/enrichment/engine/differ.test.ts
git commit -m "feat: differ — DB comparison producing NEW_PLACE/FILL/UPDATE proposals"
```

---

## Task 8: OSM Adapter

**Files:**
- Create: `web/src/lib/enrichment/adapters/osm.adapter.ts`

- [ ] **Step 1: Create osm.adapter.ts**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /workspaces/roasters-hub/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/enrichment/adapters/osm.adapter.ts
git commit -m "feat: OSM adapter — Overpass API discovery and enrichment"
```

---

## Task 9: Website Adapter

**Files:**
- Create: `web/src/lib/enrichment/adapters/website.adapter.ts`

- [ ] **Step 1: Create website.adapter.ts**

```typescript
// web/src/lib/enrichment/adapters/website.adapter.ts

import type { SourceAdapter, DiscoveryQuery, KnownPlace, RawPlace } from './base'
import type { EntityType } from '../schemas/types'

const USER_AGENT = 'BeanMapBot/1.0 (+https://beanmap.coffee/bot)'
const RATE_LIMIT_MS = 1500
const FETCH_TIMEOUT_MS = 8000

async function isAllowedByRobots(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url)
    const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`
    const res = await fetch(robotsUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return true // No robots.txt = allowed

    const text = await res.text()
    const lines = text.split('\n').map((l) => l.trim())
    let applicable = false

    for (const line of lines) {
      if (/^user-agent:\s*(\*|beanmapbot)/i.test(line)) {
        applicable = true
      }
      if (applicable && /^disallow:\s*\//i.test(line)) {
        return false
      }
      if (applicable && /^user-agent:/i.test(line) && !/^user-agent:\s*(\*|beanmapbot)/i.test(line)) {
        applicable = false
      }
    }
    return true
  } catch {
    return true
  }
}

function extractPhone(html: string): string | undefined {
  const telMatch = html.match(/href="tel:([^"]+)"/i)
  if (telMatch) return decodeURIComponent(telMatch[1]).trim()

  const phonePattern = /(\+?\d[\d\s\-().]{7,}\d)/g
  const matches = html.match(phonePattern)
  if (matches) {
    const cleaned = matches.find((m) => m.replace(/\D/g, '').length >= 7)
    return cleaned?.trim()
  }
  return undefined
}

function extractEmail(html: string): string | undefined {
  const mailtoMatch = html.match(/href="mailto:([^"?]+)"/i)
  if (mailtoMatch) return mailtoMatch[1].trim()
  return undefined
}

function extractInstagram(html: string): string | undefined {
  const igMatch = html.match(/instagram\.com\/([a-zA-Z0-9._]+)/i)
  if (igMatch && igMatch[1] !== 'p' && igMatch[1] !== 'reel') {
    return igMatch[1]
  }
  return undefined
}

function extractDescription(html: string): string | undefined {
  const metaMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]{20,500})"/i)
  if (metaMatch) return metaMatch[1].trim()

  const ogMatch = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]{20,500})"/i)
  if (ogMatch) return ogMatch[1].trim()

  return undefined
}

function extractOpeningHours(html: string): string | undefined {
  const ohMatch = html.match(
    /(?:opening.?hours?|godziny|öffnungszeiten)[^<]{0,200}?(\d{1,2}[:h]\d{2}|\d{1,2}\s*[-–]\s*\d{1,2})/i,
  )
  return ohMatch ? ohMatch[0].replace(/<[^>]+>/g, '').trim().substring(0, 200) : undefined
}

export class WebsiteAdapter implements SourceAdapter {
  id = 'website'
  name = 'Own Website'
  supports: EntityType[] = ['CAFE', 'ROASTER']
  reliability = 0.9
  requiresConsent = false

  private lastRequestAt = 0

  private async fetchHtml(url: string): Promise<string | null> {
    const now = Date.now()
    const elapsed = now - this.lastRequestAt
    if (elapsed < RATE_LIMIT_MS) {
      await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - elapsed))
    }
    this.lastRequestAt = Date.now()

    try {
      const allowed = await isAllowedByRobots(url)
      if (!allowed) {
        console.warn(`[WebsiteAdapter] robots.txt disallows scraping: ${url}`)
        return null
      }

      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })
      if (!res.ok) return null
      return res.text()
    } catch {
      return null
    }
  }

  async discover(_query: DiscoveryQuery): Promise<RawPlace[]> {
    // Website adapter cannot discover new places — it enriches known ones
    return []
  }

  async enrich(place: KnownPlace): Promise<RawPlace> {
    if (!place.website) {
      return { sourceId: `website:${place.id}`, fields: {} }
    }

    const html = await this.fetchHtml(place.website)
    if (!html) {
      return { sourceId: `website:${place.id}`, fields: {} }
    }

    const fields: Record<string, unknown> = {
      _existingId: place.id,
    }

    const phone = extractPhone(html)
    if (phone) fields['phone'] = phone

    const email = extractEmail(html)
    if (email) fields['email'] = email

    const instagram = extractInstagram(html)
    if (instagram) fields['instagram'] = instagram

    const description = extractDescription(html)
    if (description) fields['description'] = description

    const openingHours = extractOpeningHours(html)
    if (openingHours) fields['openingHours'] = openingHours

    return {
      sourceId: `website:${place.id}`,
      fields,
      sourceUrl: place.website,
    }
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /workspaces/roasters-hub/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/enrichment/adapters/website.adapter.ts
git commit -m "feat: website adapter — legal enrichment via robots.txt + rate limiting"
```

---

## Task 10: ECT Adapter (disabled by default)

**Files:**
- Create: `web/src/lib/enrichment/adapters/ect.adapter.ts`

- [ ] **Step 1: Create ect.adapter.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add web/src/lib/enrichment/adapters/ect.adapter.ts
git commit -m "feat: ECT adapter (disabled by default, requiresConsent: true)"
```

---

## Task 11: Engine + Registry (TDD)

**Files:**
- Create: `web/src/lib/enrichment/engine/engine.ts`
- Create: `web/src/lib/enrichment/engine/engine.test.ts`
- Create: `web/src/lib/enrichment/registry.ts`

- [ ] **Step 1: Write failing engine tests**

```typescript
// web/src/lib/enrichment/engine/engine.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    enrichmentRun: {
      create: vi.fn(),
      update: vi.fn(),
    },
    enrichmentProposal: {
      createMany: vi.fn(),
    },
    cafe: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    roaster: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import { db } from '@/lib/db'
import { runEnrichment } from './engine'
import { CafeSchema } from '../schemas/cafe.schema'
import type { SourceAdapter, RawPlace } from '../adapters/base'

const mockRun = { id: 'run-1', entityType: 'CAFE', status: 'RUNNING' }

const mockAdapter: SourceAdapter = {
  id: 'osm',
  name: 'OSM',
  supports: ['CAFE'],
  reliability: 0.7,
  requiresConsent: false,
  discover: vi.fn(),
  enrich: vi.fn(),
}

const discoveredPlace: RawPlace = {
  sourceId: 'osm:node:123',
  fields: {
    name: 'New Cafe',
    city: 'Warsaw',
    country: 'Poland',
    lat: 52.2,
    lng: 21.0,
  },
  sourceUrl: 'https://osm.org/node/123',
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(db.enrichmentRun.create).mockResolvedValue(mockRun as never)
  vi.mocked(db.enrichmentRun.update).mockResolvedValue(mockRun as never)
  vi.mocked(db.enrichmentProposal.createMany).mockResolvedValue({ count: 0 })
  vi.mocked(db.cafe.findMany).mockResolvedValue([])
  vi.mocked(db.roaster.findMany).mockResolvedValue([])
})

describe('runEnrichment', () => {
  it('creates an EnrichmentRun with RUNNING status and returns runId', async () => {
    vi.mocked(mockAdapter.discover).mockResolvedValue([])
    const runId = await runEnrichment(
      { entityType: 'CAFE', city: 'Warsaw', sources: ['osm'], mode: 'discover' },
      [mockAdapter],
    )
    expect(db.enrichmentRun.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'RUNNING' }) }),
    )
    expect(runId).toBe('run-1')
  })

  it('creates NEW_PLACE proposals from discovered places', async () => {
    vi.mocked(mockAdapter.discover).mockResolvedValue([discoveredPlace])
    await runEnrichment(
      { entityType: 'CAFE', city: 'Warsaw', sources: ['osm'], mode: 'discover' },
      [mockAdapter],
    )
    expect(db.enrichmentProposal.createMany).toHaveBeenCalled()
    const call = vi.mocked(db.enrichmentProposal.createMany).mock.calls[0][0]
    expect((call as { data: unknown[] }).data.length).toBeGreaterThan(0)
  })

  it('marks run as DONE after completion', async () => {
    vi.mocked(mockAdapter.discover).mockResolvedValue([])
    await runEnrichment(
      { entityType: 'CAFE', city: 'Warsaw', sources: ['osm'], mode: 'discover' },
      [mockAdapter],
    )
    expect(db.enrichmentRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'DONE' }),
      }),
    )
  })

  it('marks run as FAILED when adapter throws', async () => {
    vi.mocked(mockAdapter.discover).mockRejectedValue(new Error('network error'))
    await expect(
      runEnrichment(
        { entityType: 'CAFE', city: 'Warsaw', sources: ['osm'], mode: 'discover' },
        [mockAdapter],
      ),
    ).rejects.toThrow('network error')
    expect(db.enrichmentRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' }),
      }),
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/engine/engine.test.ts
```

Expected: FAIL — "Cannot find module './engine'"

- [ ] **Step 3: Implement engine.ts**

```typescript
// web/src/lib/enrichment/engine/engine.ts

import { db } from '@/lib/db'
import { normalize } from './normalizer'
import { merge } from './merger'
import { diff, type DiffProposal } from './differ'
import { CafeSchema } from '../schemas/cafe.schema'
import { RoasterSchema } from '../schemas/roaster.schema'
import type { SourceAdapter } from '../adapters/base'
import type { EntityType } from '../schemas/types'

export interface EnrichmentRunParams {
  entityType: EntityType
  country?: string
  city?: string
  sources?: string[]
  mode?: 'discover' | 'enrich' | 'both'
  limit?: number
  consent?: boolean
}

export async function runEnrichment(
  params: EnrichmentRunParams,
  adapters: SourceAdapter[],
): Promise<string> {
  const schema = params.entityType === 'CAFE' ? CafeSchema : RoasterSchema
  const mode = params.mode ?? 'both'
  const limit = params.limit ?? 10

  const run = await db.enrichmentRun.create({
    data: {
      entityType: params.entityType,
      query: params as Record<string, unknown>,
      sources: adapters.map((a) => a.id),
      status: 'RUNNING',
      stats: {},
    },
  })

  try {
    const proposals: (DiffProposal & { runId: string })[] = []
    let discovered = 0
    let enriched = 0
    let skipped = 0

    // ── DISCOVER mode ────────────────────────────────────────────────────
    if (mode === 'discover' || mode === 'both') {
      for (const adapter of adapters) {
        if (!adapter.supports.includes(params.entityType)) continue

        const rawPlaces = await adapter.discover({
          entityType: params.entityType,
          country: params.country,
          city: params.city,
          limit,
        })

        for (const raw of rawPlaces) {
          const normalized = normalize(raw, schema, { id: adapter.id, reliability: adapter.reliability })
          const merged = merge(normalized, schema)
          const entityName = (raw.fields['name'] as string) ?? 'Unknown'
          const placeProposals = diff(merged, null, params.entityType, entityName, schema)
          if (placeProposals.length > 0) {
            proposals.push(...placeProposals.map((p) => ({ ...p, runId: run.id })))
            discovered++
          }
        }
      }
    }

    // ── ENRICH mode ──────────────────────────────────────────────────────
    if (mode === 'enrich' || mode === 'both') {
      const existing =
        params.entityType === 'CAFE'
          ? await db.cafe.findMany({
              where: { status: 'VERIFIED' },
              select: { id: true, name: true, website: true, lat: true, lng: true },
              take: limit,
            })
          : await db.roaster.findMany({
              where: { status: 'VERIFIED' },
              select: { id: true, name: true, website: true, lat: true, lng: true },
              take: limit,
            })

      for (const entity of existing) {
        const allNormalized = []

        for (const adapter of adapters) {
          if (!adapter.supports.includes(params.entityType)) continue
          const raw = await adapter.enrich({
            id: entity.id,
            entityType: params.entityType,
            name: entity.name,
            website: entity.website ?? undefined,
            lat: entity.lat ?? undefined,
            lng: entity.lng ?? undefined,
          })
          const normalized = normalize(raw, schema, { id: adapter.id, reliability: adapter.reliability })
          allNormalized.push(...normalized)
        }

        if (allNormalized.length === 0) continue

        const merged = merge(allNormalized, schema)

        const currentEntity =
          params.entityType === 'CAFE'
            ? await db.cafe.findUnique({ where: { id: entity.id } })
            : await db.roaster.findUnique({ where: { id: entity.id } })

        if (!currentEntity) continue

        const entityProposals = diff(
          merged,
          currentEntity as Record<string, unknown>,
          params.entityType,
          entity.name,
          schema,
          entity.id,
        )

        if (entityProposals.length > 0) {
          proposals.push(...entityProposals.map((p) => ({ ...p, runId: run.id })))
          enriched++
        } else {
          skipped++
        }
      }
    }

    if (proposals.length > 0) {
      await db.enrichmentProposal.createMany({
        data: proposals.map((p) => ({
          ...p,
          currentValue: p.currentValue ?? null,
          proposedValue: p.proposedValue as Record<string, unknown>,
        })),
      })
    }

    await db.enrichmentRun.update({
      where: { id: run.id },
      data: {
        status: 'DONE',
        stats: { discovered, enriched, skipped, proposals: proposals.length },
        completedAt: new Date(),
      },
    })

    return run.id
  } catch (error) {
    await db.enrichmentRun.update({
      where: { id: run.id },
      data: { status: 'FAILED', completedAt: new Date() },
    })
    throw error
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /workspaces/roasters-hub/web && npx vitest run src/lib/enrichment/engine/engine.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Create registry.ts**

```typescript
// web/src/lib/enrichment/registry.ts

import { OsmAdapter } from './adapters/osm.adapter'
import { WebsiteAdapter } from './adapters/website.adapter'
import { EctAdapter } from './adapters/ect.adapter'
import type { SourceAdapter } from './adapters/base'

const ALL_ADAPTERS: SourceAdapter[] = [
  new OsmAdapter(),
  new WebsiteAdapter(),
  new EctAdapter(),
]

export function getAdapters(sourceIds?: string[], consent = false): SourceAdapter[] {
  return ALL_ADAPTERS.filter((adapter) => {
    if (sourceIds && !sourceIds.includes(adapter.id)) return false
    if (adapter.requiresConsent && !consent) return false
    return true
  })
}
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd /workspaces/roasters-hub/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add web/src/lib/enrichment/engine/ web/src/lib/enrichment/registry.ts
git commit -m "feat: engine orchestrator + adapter registry"
```

---

## Task 12: API Endpoints

**Files:**
- Create: `web/src/app/api/enrichment/run/route.ts`
- Create: `web/src/app/api/enrichment/run/[runId]/route.ts`

- [ ] **Step 1: Create POST /api/enrichment/run**

```typescript
// web/src/app/api/enrichment/run/route.ts

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { runEnrichment, type EnrichmentRunParams } from '@/lib/enrichment/engine/engine'
import { getAdapters } from '@/lib/enrichment/registry'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: EnrichmentRunParams
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { entityType, country, city, sources, mode, limit, consent } = body

  if (entityType !== 'CAFE' && entityType !== 'ROASTER') {
    return NextResponse.json(
      { error: 'entityType must be CAFE or ROASTER' },
      { status: 400 },
    )
  }

  const adapters = getAdapters(sources, consent ?? false)
  if (adapters.length === 0) {
    return NextResponse.json(
      { error: 'No adapters available for given sources. Check source IDs or consent flag.' },
      { status: 400 },
    )
  }

  try {
    const runId = await runEnrichment(
      { entityType, country, city, sources, mode, limit: limit ?? 10, consent },
      adapters,
    )
    return NextResponse.json({ runId }, { status: 200 })
  } catch (error) {
    console.error('[POST /api/enrichment/run]', error)
    return NextResponse.json({ error: 'Enrichment run failed' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create GET /api/enrichment/run/[runId]**

```typescript
// web/src/app/api/enrichment/run/[runId]/route.ts

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { runId } = await params

  const run = await db.enrichmentRun.findUnique({
    where: { id: runId },
    include: {
      proposals: {
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
    },
  })

  if (!run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 })
  }

  const summary = {
    id: run.id,
    entityType: run.entityType,
    status: run.status,
    sources: run.sources,
    stats: run.stats,
    createdAt: run.createdAt,
    completedAt: run.completedAt,
    proposalCount: run.proposals.length,
    proposals: run.proposals.map((p) => ({
      id: p.id,
      entityName: p.entityName,
      changeType: p.changeType,
      fieldKey: p.fieldKey,
      fieldGroup: p.fieldGroup,
      fieldPriority: p.fieldPriority,
      currentValue: p.currentValue,
      proposedValue: p.proposedValue,
      confidence: p.confidence,
      sourceId: p.sourceId,
      sourceUrl: p.sourceUrl,
      status: p.status,
    })),
  }

  return NextResponse.json(summary)
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /workspaces/roasters-hub/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Lint**

```bash
cd /workspaces/roasters-hub/web && npx eslint src/lib/enrichment/ src/app/api/enrichment/ --ext .ts
```

Expected: no errors (fix any if found).

- [ ] **Step 5: Run all unit tests**

```bash
cd /workspaces/roasters-hub/web && npx vitest run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add web/src/app/api/enrichment/
git commit -m "feat: POST /api/enrichment/run + GET /api/enrichment/run/[runId] endpoints"
```

---

## Task 13: ROADMAP + docs update

**Files:**
- Modify: `ROADMAP.md`
- Modify: `PROJECT_STATUS.md`

- [ ] **Step 1: Update ROADMAP.md**

In the `### Data Strategy & Taxonomy` section, mark the task started and update:

```markdown
- [IN PROGRESS] [P1] **Taxonomia danych: palarnie i kawiarnie** — ... (@MN)
- [IN PROGRESS] [P1] **Zasilenie bazy kawiarni w PL** — ... (@MN)
- [IN PROGRESS] [P1] **Aspekt prawny scrapowania danych** — ... (@MN)
```

When fully done, mark `[x]` on all three.

- [ ] **Step 2: Update PROJECT_STATUS.md**

Find the `@MN` line in Active Work and update to reflect this branch.

- [ ] **Step 3: Bump version**

```bash
cd /workspaces/roasters-hub/web && npm run version:patch
```

- [ ] **Step 4: Final commit**

```bash
git add ROADMAP.md PROJECT_STATUS.md web/package.json
git commit -m "DOCS: update ROADMAP + STATUS for scraping engine"
```

- [ ] **Step 5: Push branch**

```bash
git push -u origin feat/mn-scraping-engine
```

---

## Verification (end-to-end)

After all tasks:

1. **TypeScript:** `cd web && npx tsc --noEmit` → zero errors
2. **Lint:** `cd web && npx eslint src/ --ext .ts,.tsx` → zero errors
3. **Unit tests:** `cd web && npx vitest run` → all pass
4. **Manual discovery test:**
   ```bash
   curl -X POST http://localhost:3000/api/enrichment/run \
     -H "Content-Type: application/json" \
     -d '{"entityType":"CAFE","city":"Warsaw","sources":["osm"],"mode":"discover","limit":5}'
   # → {"runId":"..."}
   ```
5. **Check run result:**
   ```bash
   curl http://localhost:3000/api/enrichment/run/{runId}
   # → status: DONE, proposalCount > 0, proposals with changeType: NEW_PLACE
   ```
6. **Manual enrichment test:**
   ```bash
   curl -X POST http://localhost:3000/api/enrichment/run \
     -H "Content-Type: application/json" \
     -d '{"entityType":"CAFE","sources":["website"],"mode":"enrich","limit":3}'
   # → proposals with changeType: FILL for cafes missing phone/email
   ```
7. **Verify proposals in DB:** check `EnrichmentProposal` table — `status: PENDING`, `confidence` 0-1, `sourceUrl` populated
