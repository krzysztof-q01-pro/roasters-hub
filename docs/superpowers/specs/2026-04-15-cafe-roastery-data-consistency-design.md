# Design Spec: Cafe & Roastery Data Consistency + Public Proposal Flow

**Date:** 2026-04-15
**Author:** @MN
**Status:** Approved for implementation

---

## Context

The codebase has grown organically and accumulated several categories of drift:

1. **Field coverage gaps** — many fields defined in the Prisma schema are not accessible through any user-facing form. Some exist only in the admin panel, others only via the enrichment pipeline, some nowhere at all.
2. **No public proposal flow** — the only way to add a cafe or roastery is through `/register` and `/register/cafe`, both owner-focused flows. There is no way for a regular user or visitor to suggest a place they know.
3. **Inconsistent openingHours type** — `Roaster.openingHours` is `Json?`, `Cafe.openingHours` is `String?`. Neither has a UI to collect or edit it.
4. **Two competing `cafe-services.ts` files** — `/src/types/cafe-services.ts` (unused) and `/src/constants/cafe-services.ts` (in use).
5. **Admin panel is not a true master editor** — many schema fields (e.g., `openingHours`, `serving`, `services`, `foundedYear`, `hasCafe`, `facebook`) cannot be edited through the admin UI at all.

**Goal:** Unify data collection across all touchpoints, build a public "suggest a place" flow with excellent UX, and make the admin panel the true master editor for all entity fields.

---

## Approach

**Approach A — Minimal delta (chosen):** Evolve the existing architecture. New `/suggest/cafe` and `/suggest/roastery` routes create `PENDING` records (same model, same admin review workflow as `/register`). Admin panel is extended to cover all schema fields. Opening hours gets a structured UI component used in both contexts. The existing `/register` owner flow is preserved unchanged.

Rejected alternatives:
- **Approach B (separate Proposal models):** Clean architecture, but premature — owner roles/claiming is a future milestone. Adds duplicate schema definitions with no current payoff.
- **Approach C (feed into EnrichmentProposal):** Enrichment infrastructure is designed for batch scraping runs, not individual user submissions. Overkill.

---

## Field Map — Canonical Reference

This table is the source of truth for which fields appear where. Update it when adding new fields or changing access rules.

### Cafe

| Field | Proposal form | Admin edit | Public display | Notes |
|-------|:---:|:---:|:---:|-------|
| `name` | ✅ required | ✅ | ✅ | |
| `city` | ✅ required | ✅ | ✅ | |
| `country` | ✅ required | ✅ | ✅ | |
| `countryCode` | — | ✅ | ✅ | Auto-derived from country |
| `address` | ✅ section 2 | ✅ | ✅ | |
| `postalCode` | — | ✅ | — | |
| `website` | ✅ section 2 | ✅ | ✅ | |
| `instagram` | ✅ section 2 | ✅ | ✅ | |
| `phone` | ✅ section 2 | ✅ | ✅ | |
| `email` | ✅ section 2 | ✅ | — | Not public |
| `description` | ✅ section 2 | ✅ | ✅ | max 500 chars in proposal, 2000 in admin |
| `openingHours` | ✅ section 3 (picker) | ✅ (picker) | ✅ | Migrate to `Json` — same as Roaster |
| `services` | ✅ section 3 (checkboxes) | ✅ | ✅ | From `/constants/cafe-services.ts` |
| `serving` | — | ✅ | ✅ | Admin/enrichment only |
| `priceRange` | — | ✅ | ✅ | Admin only |
| `seatingCapacity` | — | ✅ | — | Admin only |
| `lat` / `lng` | — | ✅ | map | Admin + geocoding |
| `logoUrl` | — | ✅ (upload) | ✅ | Admin only |
| `coverImageUrl` | — | ✅ (upload) | ✅ | Admin only |
| `sourceUrl` | — | ✅ | — | Admin only |
| `featured` / `featuredUntil` | — | ✅ | badge | Admin only |
| `status` | — | ✅ (verify/reject) | — | |

### Roaster

| Field | Proposal form | Admin edit | Public display | Notes |
|-------|:---:|:---:|:---:|-------|
| `name` | ✅ required | ✅ | ✅ | |
| `city` | ✅ required | ✅ | ✅ | |
| `country` | ✅ required | ✅ | ✅ | |
| `countryCode` | — | ✅ | ✅ | Auto-derived |
| `website` | ✅ section 2 | ✅ | ✅ | |
| `instagram` | ✅ section 2 | ✅ | ✅ | |
| `email` | ✅ section 2 | ✅ | — | |
| `shopUrl` | ✅ section 2 | ✅ | ✅ | |
| `description` | ✅ section 2 | ✅ | ✅ | |
| `certifications` | ✅ section 3 | ✅ | ✅ | Pill toggles |
| `origins` | ✅ section 3 | ✅ | ✅ | Pill toggles |
| `roastStyles` | ✅ section 3 | ✅ | ✅ | Pill toggles |
| `openingHours` | ✅ section 3 (picker) | ✅ (picker) | ✅ | Already `Json` |
| `address` / `postalCode` | — | ✅ | — | Admin only |
| `phone` | — | ✅ | — | Admin only |
| `facebook` | — | ✅ | — | Admin only |
| `foundedYear` | — | ✅ | ✅ | Admin only |
| `brewingMethods` | — | ✅ | ✅ | Admin only |
| `wholesaleAvailable` | — | ✅ | badge | Admin only |
| `subscriptionAvailable` | — | ✅ | badge | Admin only |
| `hasCafe` / `hasTastingRoom` | — | ✅ | badge | Admin only |
| `featured` / `featuredUntil` | — | ✅ | badge | Admin only |
| `status` | — | ✅ (verify/reject) | — | |

---

## Components & Architecture

### 1. Public Proposal Form (`/suggest/cafe` and `/suggest/roastery`)

**Routes:**
- `web/src/app/suggest/cafe/page.tsx`
- `web/src/app/suggest/roastery/page.tsx`

**Behavior:**
- No authentication required — anyone can propose
- Submitting creates a `PENDING` Cafe or Roaster record (no `ownerId`)
- Admin reviews via existing `/admin/cafes` and `/admin/roasters` queues

**Form layout — Accordion (3 sections):**

**Section 1 — Required (always open):**
- `name` (required)
- `city` (required)
- `country` (required, dropdown)
- Info hint: "To wystarczy żeby dodać miejsce. Reszta nie jest obowiązkowa."

**Section 2 — Contact & Location (collapsed, click to expand):**
- `address` — with hint "Pomaga w znalezieniu na mapie"
- `website` (URL)
- `instagram` (handle, `@` prefix auto-added)
- `phone`
- `email` — with hint "Nie będzie widoczny publicznie"
- `description` — textarea, 500 char limit in proposal (2000 in admin), live counter

**Section 3 — Details (collapsed, shows teaser of what's inside):**
- Cafe: `openingHours` (picker), `services` (checkboxes grouped by category)
- Roaster: `certifications`, `origins`, `roastStyles` (pill toggles), `openingHours` (picker)

**UX requirements (implemented with `/frontend-design` + `/form-cro` + `/tailwind-patterns`):**
- Inline validation — errors shown on blur, not on submit
- `@` prefix auto-inserted for instagram, `https://` for website if missing
- Country dropdown with flag icons and search
- Submit button always visible, enabled as soon as section 1 is valid
- Success state: confirmation card with "Dziękujemy! Zweryfikujemy i opublikujemy wkrótce."
- No redirect on success — stay on page, show success in place of form

**Server actions:**
- `createCafeProposal(formData)` — new action in `cafe.actions.ts`
- `createRoasterProposal(formData)` — new action in `roaster.actions.ts`
- Both call existing `createCafe` / `createRoasterRegistration` logic but without owner claim

**Zod schemas:**
- `ProposeCafeSchema` — subset of `CreateCafeSchema`, description max 500
- `ProposeRoasterSchema` — subset of `CreateRoasterSchema`, description max 500

---

### 2. Opening Hours Picker Component

**Location:** `web/src/components/shared/OpeningHoursPicker.tsx`

**Used in:** proposal forms (section 3) + admin panel

**Data format (JSON — unified for both Cafe and Roaster):**
```ts
type DayHours = {
  open: string   // "07:00"
  close: string  // "18:00"
} | null         // null = closed

type OpeningHours = {
  mon: DayHours
  tue: DayHours
  wed: DayHours
  thu: DayHours
  fri: DayHours
  sat: DayHours
  sun: DayHours
}
```

**UX behavior — "Smart Monday":**
- 7 rows (Mon–Sun), each with checkbox (open/closed) + `open` time select + `close` time select
- Clicking Monday's checkbox to "open" auto-propagates the same hours to Tue–Fri
- Sat and Sun always remain independent
- Changing any individual day after propagation overrides just that day
- Time selects: 15-minute increments from 06:00 to 23:45
- "Zamknięte" shown as greyed out row when checkbox unchecked
- Helper button: "Kopiuj Pon–Pt" resets Tue–Fri to match Monday

**Schema migration required:**
- `Cafe.openingHours` must be migrated from `String?` to `Json?` to match `Roaster.openingHours`
- Migration: parse existing string values where possible, else null

---

### 3. Admin Panel — Master Editor

**Files to extend:**
- `web/src/app/admin/cafes/[id]/client.tsx`
- `web/src/app/admin/roasters/[id]/client.tsx`
- `web/src/actions/admin.actions.ts` (extend `adminUpdateCafe` and `adminUpdateRoaster`)

**Layout — Sidebar + sections:**
- Left sidebar (fixed): section navigation links
- Main area: active section fields
- Sticky toolbar (top): entity name + status badge + Save / Verify / Reject buttons always visible

**Cafe admin sections:**
1. **Tożsamość** — name, slug (with ⚠️ hint), city, country, countryCode, description, priceRange, seatingCapacity
2. **Lokalizacja & Mapa** — address, postalCode, lat, lng (manual entry; geocode-from-address is a future iteration), sourceUrl
3. **Kontakt** — website, instagram, phone, email
4. **Godziny otwarcia** — `OpeningHoursPicker` component
5. **Serwisy & Amenities** — serving (text tags), services (checkboxes from constants)
6. **Zdjęcia** — coverImageUrl (upload), logoUrl (upload)
7. **Admin & Status** — status, featured, featuredUntil, rejectedReason, verifiedAt, ownerId

**Roaster admin sections:**
1. **Tożsamość** — name, slug, city, country, countryCode, description, foundedYear
2. **Lokalizacja** — address, postalCode, lat, lng, sourceUrl
3. **Kontakt** — website, shopUrl, instagram, facebook, phone, email
4. **Kawy & Palenie** — certifications, origins, roastStyles, brewingMethods
5. **Godziny otwarcia** — `OpeningHoursPicker`
6. **Oferta** — wholesaleAvailable, subscriptionAvailable, hasCafe, hasTastingRoom
7. **Zdjęcia** — coverImageUrl, images (RoasterImage relation: upload/delete/reorder)
8. **Admin & Status** — status, featured, featuredUntil, rejectedReason, verifiedAt, ownerId

**UX requirements (implemented with `/frontend-design` + `/tailwind-patterns`):**
- Inline admin hints per field (e.g., slug warning, priceRange scale, countryCode auto-fill)
- "Masz niezapisane zmiany" warning toast when navigating between sidebar sections before saving
- Confirm dialog before Verify/Reject
- Rejection reason required before Reject button activates

---

### 4. Schema Changes

**Migration 1 — `Cafe.openingHours` type change:**
```prisma
// Before
openingHours  String?

// After
openingHours  Json?
```
Requires a Prisma migration. Existing string values: attempt JSON.parse, fallback to null.

**Cleanup — Remove duplicate `cafe-services.ts`:**
- Delete `web/src/types/cafe-services.ts` (unused)
- Keep `web/src/constants/cafe-services.ts` (in use, more detailed)
- Update any imports if needed

**No new Prisma models required** — proposals use existing `Cafe`/`Roaster` with `PENDING` status and `ownerId: null`.

---

### 5. Navigation CTAs

Add "Zaproponuj miejsce" CTA alongside existing "List Your Roastery":
- Header: current "List Your Roastery" becomes a dropdown — "Mam palarnię / kawiarnię" (→ /register) and "Znam świetne miejsce" (→ /suggest/cafe or /suggest/roastery chooser)
- Footer: add `/suggest/cafe` and `/suggest/roastery` links
- Cafe list page: "Brakuje kawiarni? Zaproponuj →" banner
- Roaster list page: "Nie ma tu Twojej palarni? Dodaj →" banner

---

## Verification Plan

1. **Schema migration:** `npx prisma migrate dev` — no data loss, `openingHours` String→Json
2. **Proposal form (cafe):** Submit with only name/city/country → PENDING record created, ownerId null
3. **Proposal form (roastery):** Submit with full data including openingHours → JSON stored correctly
4. **Admin edit (cafe):** Open all 7 sections, edit every field, save → all fields persisted
5. **Admin edit (roaster):** Open all 8 sections, edit every field, save → all fields persisted
6. **OpeningHoursPicker:** Click Mon checkbox → Tue–Fri auto-populate; change Wed → only Wed changes; Sat independent
7. **`/lint-and-validate`** — no TypeScript errors, no lint failures
8. **Consistency check:** `python tools/consistency_check.py` — all checks pass
9. **Public pages:** Cafe and Roaster detail pages display openingHours correctly from JSON

---

## Implementation Skills Required

| Area | Skills |
|------|--------|
| Proposal forms | `/frontend-design`, `/form-cro`, `/tailwind-patterns`, `/react-best-practices` |
| Admin panel | `/frontend-design`, `/tailwind-patterns`, `/nextjs-best-practices` |
| Before commit | `/lint-and-validate`, `/superpowers:verification-before-completion` |
| After feature branch complete | `/superpowers:finishing-a-development-branch` |
