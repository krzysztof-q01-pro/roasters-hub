# Enrichment UX Redesign — Design Spec
**Date:** 2026-04-14  
**Author:** @MN  
**Status:** Approved

---

## Context

The current enrichment admin UI has several critical usability problems:
- Run parameters not visible on the list page — must enter run detail to see them
- Double confirmation flow (Approve → Apply) is confusing and redundant
- Per-entity proposal review has no holistic view of the entity's full data
- No photo management at the enrichment stage
- New run form lacks keyword filtering, making it impossible to target specialty coffee specifically
- Inconsistent navigation — some views have back links, others don't
- No persistent tag configuration per entity type

This redesign addresses all of these problems with a coherent flow from run creation through per-entity review.

---

## Design

### 1. Global Admin Navigation

A persistent top navigation bar appears on every admin page:

```
[Roasters Hub]   Enrichment  Kawiarnie  Palarnie  Użytkownicy       @MN ↓
```

- Replaces ad-hoc back links as the primary navigation mechanism
- Breadcrumb back link (`← Wróć do runów`) retained only in the run detail bar for contextual navigation
- All admin routes share this nav component

---

### 2. Run List Page (`/admin/enrichment`)

The run table is extended to show run parameters inline — no drill-in needed:

| DATA | TYP | TRYB | KEYWORDS | ŹRÓDŁA | LOKALIZACJA | STATUS | OCZEK. | AKCJA |
|------|-----|------|----------|--------|-------------|--------|--------|-------|
| 13.04, 17:43 | CAFE | Discover | specialty coffee, third wave | osm website ect | Warszawa | DONE | 90 | Review → |

- `keywords` rendered from `run.query.keywords` (new field)
- `lokalizacja` = `run.query.country` + `run.query.city`, dash if empty
- Pending count highlighted amber when > 0
- "New Run →" button top right

---

### 3. New Run Form (`/admin/enrichment/new`)

```
ENTITY TYPE      [ROASTER]  [CAFE]

MODE             [Discover]  [Enrich]  [Both]

SOURCES          ☑ OSM (OpenStreetMap)
                 ☐ ECT (Ethical Coffee Trade)
                 ☑ Website scraper

KEYWORDS / TAGI  [specialty coffee ×]  [third wave ×]  [dodaj tag…]
                 ↳ filtruje wyniki OSM · używane jako query Unsplash przy losowaniu zdjęć

KRAJ (opcja)     [                 ]   MIASTO (opcja)  [                 ]

LIMIT            [20]

                 [Start run →]   Anuluj
```

**Keywords behavior:**
- Pre-populated from `EnrichmentTag` table filtered by selected `entityType`
- Switching CAFE ↔ ROASTER replaces current chips with tags from DB for the new entityType (does not merge)
- Adding/removing a chip in the form saves to `EnrichmentTag` immediately (optimistic update)
- Selected keywords also stored in `run.query.keywords` for run history
- Keywords passed to enrichment engine as OSM tag filter
- Keywords used as Unsplash search query when auto-selecting entity photos

**New DB model:**
```prisma
model EnrichmentTag {
  id         String   @id @default(cuid())
  entityType String   // CAFE | ROASTER
  value      String
  createdAt  DateTime @default(now())

  @@unique([entityType, value])
}
```

---

### 4. Run Detail — Split Layout (`/admin/enrichment/[runId]`)

Three zones on a single page:

#### 4a. Run Bar (sticky top, below global nav)

```
← Wróć do runów    CAFE — Discover  ✓DONE   osm · website · ect · Warszawa · "specialty coffee, third wave"
                   19 encji   90 do przejrzenia   7 zastosowanych
                   Próg: [====75%====]   [Zastosuj wszystkie ≥75%]
```

- Shows all run parameters at a glance (entityType, mode, sources, location, keywords)
- Stats: total entities, pending, applied
- Confidence slider (50–100%, default 75%) + bulk apply button
- **"Zastosuj wszystkie ≥75%"** = applies all pending proposals above threshold across all entities in one action (no per-entity review)

#### 4b. Left Panel (300px, fixed, scrollable)

- Search input: filters entity list by name
- Filter chips: `Wszystkie` / `Do przejrzenia` / `Nowe` / `Zatwierdzone`
- Entity list items show:
  - Name, city, source badges
  - Status badge (NOWA / Zatwierdzona / badge count "3 propozycje")
  - Confidence bar (colored: green ≥80%, amber ≥60%, red <60%)
  - Warning badge for name changes
- Pagination: 20 per page
- Active entity highlighted with left border accent
- After "Zatwierdź i przejdź dalej": auto-selects next PENDING entity in list
- If no more PENDING entities: right panel shows "Wszystkie encje przejrzane ✓" empty state with link back to run list

#### 4c. Right Panel (flex, scrollable)

Entity card with two sub-sections:

**Header:**
```
[📷 photo]    Cafe Chełmska              NOWA ENCJA
[Losuj][Wgraj]  CAFE · Warszawa
              Kompletność: ████░░░ 40% · brakuje: opis, strona, instagram
              [Zatwierdź i przejdź dalej →]  [Pomiń]  [Oznacz nieaktywna]
```

- Photo: auto-suggested on card load (Unsplash query = entity name + run keywords)
- "Losuj" re-rolls to next Unsplash result
- "Wgraj" opens UploadThing uploader
- Completeness bar with tooltip listing missing fields
- **"Zatwierdź i przejdź dalej →"**: applies all non-rejected proposals for this entity to DB immediately, then auto-advances to next PENDING entity in left panel
- "Pomiń": skips entity (marks all proposals as SKIPPED), advances to next
- "Oznacz nieaktywna": marks entity as INACTIVE/REJECTED in DB

**Fields (grouped, read + inline edit):**

Sections: Tożsamość / Lokalizacja / Kontakt / Oferta (Sociale for roasters: Produkt, Wizyta)

Each field row:
- Label (uppercase, muted)
- Value: green + source badge if enriched, editable input if missing, amber if conflict
- Missing fields show `<input>` inline — admin can fill manually before approving

**Proposals section (bottom of card):**
```
PROPOZYCJE (3 oczekujące)
  lng   16.2253  [OSM]  70%   [✓][✗][–]
  lat   54.2076  [OSM]  70%   [✓][✗][–]
  name  Cafe Chełmska  [OSM]  70%   [✓][✗][–]
                              [Zatwierdź wszystkie]  [Odrzuć wszystkie]
```

- Inline ✓/✗/– per proposal (approve/reject/skip)
- Name change proposals trigger existing NameChangeModal (unchanged)
- "Zatwierdź wszystkie" / "Odrzuć wszystkie" bulk actions for this entity only

---

### 5. EntityCard — Reusable Component

The right-panel card is extracted as a standalone `EntityCard` component with two modes:

```typescript
type EntityCardProps =
  | { mode: "enrichment"; runId: string; entity: EntityWithProposals; onAdvance: () => void }
  | { mode: "standalone"; entityType: "CAFE" | "ROASTER"; entityId: string }
```

**Enrichment mode** (used in run detail split layout):
- Shows proposals section
- CTA: "Zatwierdź i przejdź dalej →"
- Calls `applyEntityProposals(runId, entityId)` server action

**Standalone mode** (used from `/admin/cafes/[id]`, `/admin/roasters/[id]`):
- No proposals section
- CTA: "Zapisz zmiany →"
- Calls `updateEntity(entityType, entityId, fields)` server action
- Same photo (Losuj/Wgraj), completeness bar, grouped fields
- Note: `/admin/cafes` and `/admin/roasters` admin list pages are out of scope for this spec — the `EntityCard` component is built to support standalone mode, but wiring it to those routes is a separate task

---

## Status Model Change

Remove the intermediate `APPROVED` status from `EnrichmentProposalStatus`.

**New status flow:**
```
PENDING → APPLIED   (via "Zatwierdź i przejdź dalej" or bulk apply)
PENDING → REJECTED  (via ✗ button)
PENDING → SKIPPED   (via "Pomiń" or – button)
```

The `APPROVED` state is eliminated. Reviewing and applying are the same action.

**Migration:** existing `APPROVED` proposals → migrated to `APPLIED` (they have already been reviewed; treating them as PENDING would require unnecessary re-review). A one-time migration script handles this before deploying the new UI.

---

## Photo Integration

- **Source:** Unsplash API (requires `UNSPLASH_ACCESS_KEY` env var — free tier, 50 req/hr)
- **Auto-query on card load:** `"{entityName} {keywords[0]} specialty coffee"` (e.g. `"Cafe Chełmska specialty coffee"`)
- **"Losuj":** increments Unsplash result page index, fetches next photo from same query
- **"Wgraj":** UploadThing uploader (existing `UPLOADTHING_TOKEN`), stores URL in entity's `photoUrl` field
- **Proxy:** `/api/enrichment/photo` route proxies Unsplash requests server-side to keep the API key secret
- **Storage:** the currently displayed photo URL (Unsplash or UploadThing) is saved to `Cafe.photoUrl` / `Roaster.photoUrl` when "Zatwierdź i przejdź dalej" is clicked. If "Pomiń" is clicked, photo is not saved.

---

## Verification

End-to-end test path:
1. Open `/admin/enrichment/new` → verify CAFE tags pre-populate, adding tag saves to DB
2. Start a run → verify keywords appear in run list row
3. Open run detail → verify split layout, run params visible in bar
4. Select entity → verify photo auto-loads, fields grouped, proposals at bottom
5. Click ✓ on a proposal, then "Zatwierdź i przejdź dalej" → verify DB updated, auto-advances to next entity
6. Use confidence slider + "Zastosuj wszystkie ≥75%" → verify bulk apply across entities
7. Open `/admin/cafes/[id]` → verify same EntityCard in standalone mode, no proposals section

---

## Files to Create / Modify

**New files:**
- `web/src/app/admin/_components/AdminNav.tsx` — global top nav
- `web/src/app/admin/enrichment/[runId]/_components/SplitLayout.tsx` — split container
- `web/src/app/admin/enrichment/[runId]/_components/EntityListPanel.tsx` — left panel
- `web/src/app/admin/enrichment/[runId]/_components/EntityCard.tsx` — reusable card (replaces existing)
- `web/src/app/admin/enrichment/actions/tags.ts` — tag CRUD server actions
- `web/src/app/api/enrichment/photo/route.ts` — Unsplash proxy endpoint

**Modified files:**
- `web/prisma/schema.prisma` — add `EnrichmentTag` model, remove `APPROVED` from `EnrichmentProposalStatus`
- `web/src/app/admin/enrichment/page.tsx` — extend run list columns
- `web/src/app/admin/enrichment/new/_components/NewRunForm.tsx` — add keywords field
- `web/src/app/admin/enrichment/[runId]/page.tsx` — switch to split layout
- `web/src/app/admin/enrichment/actions.ts` — add `applyEntityProposals`, remove APPROVED flow
- All admin layout files — inject `AdminNav`
