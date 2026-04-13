# Enrichment UI — Design Spec
**Date:** 2026-04-13  
**Author:** @MN  
**Status:** Approved for implementation

---

## Context

The enrichment engine (`web/src/lib/enrichment/`) is fully built and tested. It pulls data from OSM, ECT, and website scrapers, generates `EnrichmentProposal` records (PENDING), and stores run metadata in `EnrichmentRun`. There is no admin UI to trigger runs, review proposals, or apply approved changes to the database.

This spec defines the admin review interface that closes the loop: trigger → review → apply.

---

## Goals

- Allow admins to trigger enrichment runs with configurable parameters
- Review proposals grouped by entity (not by field) for better signal-to-noise
- Bulk-approve by confidence threshold; always manual for name changes
- Apply approved changes atomically to the DB with schema safety check
- Surface data completeness gaps per entity
- Assign placeholder photos to new entities discovered via enrichment

---

## Pages

### `/admin/enrichment` — Run History

Table of past runs:
- Columns: date, entity type, mode (discover/enrich/both), status (RUNNING/DONE/FAILED), stats (discovered · enriched · proposals pending), action "Review →"
- RUNNING rows show a spinner and auto-refresh every 3s
- "New Run →" button in header

### `/admin/enrichment/new` — Run Configuration

Form fields:
- **Entity type:** CAFE | ROASTER (required)
- **Mode:** discover | enrich | both (required)
- **Country** (optional text, ISO code)
- **City** (optional text)
- **Sources:** checkboxes — OSM, ECT, Website (ECT requires consent checkbox)
- **Limit:** number input (default 50)
- **Consent:** checkbox, required when ECT is selected — "I consent to use ECT data"

On submit: POST `/api/enrichment/run` → redirect to `/admin/enrichment/[runId]`.

### `/admin/enrichment/[runId]` — Review Page

See detailed layout below.

---

## Review Page Layout

### Header

```
[DONE]  Sources: OSM · ECT  ·  Duration: 3m 42s

  47 entities    312 proposals    89 pending    12 approved    0 applied
```

Status badge: RUNNING (spinner, polls every 3s) | DONE | FAILED.

### Bulk Action Bar

Sticky bar below header:

```
Confidence threshold: [slider 0–100%]  75%    [Approve all above threshold]    [Apply 12 approved →]
```

- "Approve all above threshold" sets status=APPROVED on all PENDING proposals with confidence ≥ threshold, **excluding NAME_CHANGE proposals** (always manual)
- "Apply X approved" triggers `applyEnrichmentRun(runId)` Server Action; active only when X > 0
- Counter updates live as admin approves/rejects proposals

### NOT_FOUND Section

Displayed above entity list when any entity was searched but returned 0 results from all sources:

```
⚠ Potentially closed or moved (3 entities)

  Blue Bottle Kraków    CAFE     Last verified: 2024-11-12    [Mark inactive] [Dismiss]
  Aroma Roasters        ROASTER  Last verified: 2025-01-03    [Mark inactive] [Dismiss]
```

- "Mark inactive" sets entity status → `INACTIVE` (soft delete, not permanent)
- "Dismiss" ignores the NOT_FOUND signal for this run

### Entity Cards (main list)

Each entity is a collapsible card.

**Collapsed state:**
```
▶  Coffeedesk Wrocław    ROASTER    8 proposals  ·  conf: 72–94%    ████████░░ 78%
   [OSM] [WEBSITE]       [⚠ NAME_CHANGE] [⚡ LOW_CONF]              [Approve all] [Skip all]
```

Flags:
| Flag | Color | Condition | Effect on bulk |
|------|-------|-----------|----------------|
| `NAME_CHANGE` | Orange | Any proposal has fieldKey='name' | Disables "Approve all" for this entity |
| `LOW_CONF` | Yellow | Any proposal has confidence < 60% | Warning only |
| `NOT_FOUND` | Red | Entity not returned by any source | Shown in NOT_FOUND section instead |
| `NEW_ENTITY` | Green | All proposals are for a new (non-existing) entity | Shown with "Create entity" CTA |

Completeness bar: `████████░░ 78%` — filled fields / total important fields for entity type.  
Missing fields listed on hover/expand: "Missing: description · instagram · origins"

**Expanded state — proposal table:**

| Field | Group | Current | Proposed | Source | Conf | Warning | Action |
|-------|-------|---------|----------|--------|------|---------|--------|
| description | IDENTITY | (empty) | "Specialty roaster…" | OSM | 91% | — | [✓][✗][–] |
| website | CONTACT | coffeedesk.com | coffeedesk.pl | WEBSITE | 88% | URL_CHANGED | [✓][✗][–] |
| instagram | SOCIAL | (empty) | @coffeedesk | WEBSITE | 82% | — | [✓][✗][–] |
| phone | CONTACT | (empty) | +48721333444 | WEBSITE | 74% | — | [✓][✗][–] |
| name | IDENTITY | Coffeedesk | Coffee Desk S.A. | OSM | 61% | ⚠ NAME_CHANGE | [→ modal] |
| foundedYear | IDENTITY | (empty) | 1847 | OSM | 55% | ⚠ YEAR < 1900 | [✓][✗][–] |

Actions: `[✓]` Approve · `[✗]` Reject · `[–]` Skip — inline, optimistic UI, no page reload.

**Suspicious value warnings:**
| Warning | Condition |
|---------|-----------|
| `URL_CHANGED` | Proposed website differs from current (domain change) |
| `INVALID_PHONE` | Phone doesn't match international format regex |
| `YEAR_SUSPICIOUS` | foundedYear < 1900 or > current year |
| `ARRAY_DOWNGRADE` | Proposed array is shorter than current (e.g. origins: 3 → 1) |
| `LOW_CONFIDENCE` | confidence < 60% |

---

## Name Change Modal

Triggered by `[→ modal]` on any NAME_CHANGE proposal. Never appears in bulk actions.

```
⚠ Name change — review impact

  Current:   Coffeedesk                    slug: coffeedesk
  Proposed:  Coffee Desk S.A.              slug: coffee-desk-s-a

  Similarity: 68% — significant change (not formatting)
  Source: OSM  ·  Confidence: 61%  ·  [View source ↗]

  If approved:
  • URL /roasters/coffeedesk → /roasters/coffee-desk-s-a
  • Slug redirect created automatically

  [Approve name change]   [Reject]   [Cancel]
```

Similarity classifier:
- ≥ 85% → "Likely formatting fix (capitalization/punctuation)"
- < 85% → "Significant change — verify manually"

Computed using normalized Levenshtein distance on lowercased, punctuation-stripped strings.

---

## Apply Mechanism (Server Action)

`applyEnrichmentRun(runId: string)` — called when admin clicks "Apply X approved":

1. Fetch all `APPROVED` proposals for the run
2. Validate: for each proposal, check that `fieldKey` exists in the current Prisma schema for that entity type. If any field is missing → **abort with error**: "Field `X` not in schema — run migration first"
3. Group proposals by `entityId`
4. For each entity:
   - `db.[roaster|cafe].update({ where: { id }, data: { [fieldKey]: proposedValue } })`
   - If NAME_CHANGE: additionally regenerate slug + `db.slugRedirect.create({ from: oldSlug, to: newSlug })`
   - If NEW_ENTITY (discover, entityId=null): `db.[roaster|cafe].create(...)` + assign random placeholder photo
5. Update all applied proposals: `status → APPLIED`
6. Call `revalidatePath()` for all affected entity pages + catalog pages

Transaction: all-or-nothing per entity (if one field update fails, roll back that entity's updates only, mark proposals as FAILED with error message).

---

## Completeness Score

Defined field lists (hardcoded constants, not dynamic):

**ROASTER important fields (21):** name, description, foundedYear, country, city, address, lat, lng, website, email, phone, instagram, origins, roastStyles, certifications, brewingMethods, wholesaleAvailable, subscriptionAvailable, openingHours, hasCafe, hasTastingRoom

**CAFE important fields (16):** name, description, country, city, address, lat, lng, website, phone, email, instagram, openingHours, serving, services, priceRange, seatingCapacity

Score = count of non-null/non-empty fields / total important fields × 100.

Displayed in entity card header as a progress bar. Updates optimistically when a proposal is approved.

Missing fields clickable → opens entity edit page (`/admin/roasters/[id]/edit`).

---

## Placeholder Photo Library

5–10 curated photos stored as static assets in `web/public/images/placeholders/`:
- `cafe-01.jpg` through `cafe-05.jpg`
- `roaster-01.jpg` through `roaster-05.jpg`

Assignment:
- **NEW_ENTITY auto-assign:** random photo from the matching type list, set on `coverImage` field at Apply time
- **Manual override in review UI:** photo picker shows thumbnails, admin can change before Apply

Photo picker appears in the NEW_ENTITY card header area (not in the proposal table).

---

## Known Schema Gaps (require work before MVP is complete)

### SlugRedirect model (for NAME_CHANGE apply)
The `slugRedirect` model does not exist in Prisma schema yet. Before the Apply mechanism can handle name changes, a migration must add:
```prisma
model SlugRedirect {
  id        String   @id @default(cuid())
  fromSlug  String   @unique
  toSlug    String
  entityType String  // 'roaster' | 'cafe'
  createdAt DateTime @default(now())
}
```
The Next.js middleware or a catch-all route must then resolve these redirects at request time.

### NOT_FOUND signal in engine
The engine currently does not emit a NOT_FOUND signal when an entity is searched but returns 0 results from all sources. To support the NOT_FOUND section in UI, the engine needs a small extension: after running adapters for an entity in ENRICH mode, if `results.length === 0`, record a `notFoundAt` timestamp on the entity or create a special proposal with `changeType: 'NOT_FOUND'`. This is a minor engine change (1 adapter pass, 1 write).

**MVP decision:** NOT_FOUND section moves to V2. MVP ships without it. Engine change scoped separately.

---

## Schema Consistency Rule

The Apply action is the enforcement point: proposals referencing fields not in the current Prisma schema are **blocked**, not silently ignored.

Workflow for adding a new field (V2+):
1. Add field to Prisma schema + generate migration
2. Add field to enrichment engine's field definitions (`web/src/lib/enrichment/fields/`)
3. Add field to completeness score constants
4. Deploy migration before next enrichment run

---

## MVP Scope

| Feature | In MVP |
|---------|--------|
| Run history page | ✓ |
| New run form | ✓ |
| Entity-first review with proposals | ✓ |
| Approve/reject/skip per proposal | ✓ |
| Bulk approve by confidence threshold | ✓ |
| Flags: NAME_CHANGE, LOW_CONF, SUSPICIOUS values | ✓ |
| Name change modal with slug impact | ✓ |
| NOT_FOUND section | ✗ (V2 — requires engine change) |
| Apply Server Action with schema check | ✓ |
| Completeness score per entity | ✓ |
| Placeholder photo library (random assign) | ✓ |
| Photo picker in NEW_ENTITY cards | ✓ |

## V2 Scope (after observing engine in production)

- Cross-source confidence boosting in engine
- NOT_FOUND section (requires engine change: emit NOT_FOUND signal when 0 sources return results)
- Stale entity tracking across multiple runs (NOT_FOUND N times → auto-suggest inactive)
- New DB fields if identified as missing (requires migration + engine update)
- Photo scraping from entity websites as enrichment proposals

---

## Critical Files

| File | Role |
|------|------|
| `web/src/app/api/enrichment/run/route.ts` | POST — start run |
| `web/src/app/api/enrichment/run/[runId]/route.ts` | GET — run status + proposals |
| `web/src/lib/enrichment/engine/engine.ts` | Core engine (read-only in MVP) |
| `web/prisma/schema.prisma` | EnrichmentRun + EnrichmentProposal models |
| `web/src/app/admin/` | Existing admin pages (pattern to follow) |
| `web/src/app/admin/enrichment/` | New pages (to create) |

---

## Verification

1. Start dev server: `cd web && npm run dev`
2. Log in as admin
3. Navigate to `/admin/enrichment` — run history table visible
4. Click "New Run" → configure ROASTER + enrich + OSM + limit 5 → submit
5. Redirect to `/admin/enrichment/[runId]` — RUNNING status with spinner
6. Wait for DONE — entity cards appear with proposals
7. Approve some proposals, reject others
8. Set confidence slider to 80% → "Approve all above threshold" → verify NAME_CHANGE proposals not auto-approved
9. Click "Apply X approved" → check DB (Prisma Studio or direct query)
10. Navigate to an affected roaster page → verify data updated
11. For a name-changed roaster: verify old slug redirects to new slug
