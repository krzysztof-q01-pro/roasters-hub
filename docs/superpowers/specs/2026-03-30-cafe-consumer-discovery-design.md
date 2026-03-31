# Spec: Cafe Profiles + Consumer Discovery

**Date:** 2026-03-30
**Author:** @MN
**Status:** Approved for implementation

---

## Problem

The current MVP covers only one supply side (Roasters) and provides no reason for a Consumer (Coffee Lover) to return to the platform. Without Cafe profiles and Roaster↔Cafe relationships, the consumer has nothing to discover — killing the network effect that drives platform growth. Every stakeholder (Roaster, Cafe, Consumer) must have a clear incentive to participate.

---

## Goals

- Add self-service Cafe registration (analogous to Roaster registration)
- Enable Cafes to declare which Roasters they serve (unilateral, no approval required)
- Give Consumers three entry points to discover both Roasters and Cafes
- Extend the Reviews system to cover Cafes

---

## Out of Scope (Phase 2)

- Roaster-side relationship management ("hide this cafe")
- Relationship confirmation/approval flow
- Geo-coding automation (lat/lng entered manually for now)
- Consumer accounts / saved cafes

---

## Data Model

### New model: `Cafe`

```prisma
model Cafe {
  id            String     @id @default(cuid())
  slug          String     @unique
  name          String
  description   String?    @db.Text
  city          String
  country       String
  address       String?
  lat           Float?
  lng           Float?
  website       String?
  instagram     String?
  phone         String?
  logoUrl       String?
  coverImageUrl String?
  status        CafeStatus @default(PENDING)
  owner         UserProfile?
  roasters      CafeRoasterRelation[]
  reviews       Review[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  @@map("cafes")
}

enum CafeStatus {
  PENDING
  VERIFIED
  REJECTED
}
```

### New model: `CafeRoasterRelation`

```prisma
model CafeRoasterRelation {
  id        String   @id @default(cuid())
  cafeId    String
  cafe      Cafe     @relation(fields: [cafeId], references: [id], onDelete: Cascade)
  roasterId String
  roaster   Roaster  @relation(fields: [roasterId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([cafeId, roasterId])
  @@map("cafe_roaster_relations")
}
```

### Extended model: `Review`

Add optional `cafeId` to the existing `Review` model:

```prisma
cafeId   String?
cafe     Cafe?   @relation(fields: [cafeId], references: [id], onDelete: Cascade)
```

- Exactly one of `roasterId` or `cafeId` must be set — enforced in application logic (Server Action validation).
- New indexes: `[cafeId]`, `[cafeId, status]`.

### Extended models

- `UserProfile` gets `cafeId String? @unique` + `cafe Cafe?` relation (same pattern as `roasterId`/`roaster`)
- `Roaster` gets `servedAt CafeRoasterRelation[]`

---

## Pages & Routing

### New public pages

| Route | Description |
|-------|-------------|
| `/cafes` | Cafe directory — grid, filters: city, country. ISR `revalidate = 3600`. |
| `/cafes/[slug]` | Cafe public profile: description, map pin, linked roasters, reviews. |

### New onboarding pages

| Route | Description |
|-------|-------------|
| `/register/cafe` | 3-step wizard: (1) Basic info, (2) Contact + social, (3) Logo + cover image (Uploadthing) |
| `/dashboard/cafe` | Cafe owner panel: edit profile, manage roaster relations, view reviews |

### Extended existing pages

| Route | Change |
|-------|--------|
| `/map` | Second pin type for Cafes (distinct icon/colour). Toggle: Roasters / Cafes / Both. |
| `/roasters/[slug]` | New "Gdzie wypić" section — cards of Cafes serving this Roaster. |
| `/` (homepage) | Search extended with Cafe entry point. Two CTAs: "Znajdź palarnię" + "Znajdź kawiarnię". |
| `/admin/cafes` | New admin panel — list of PENDING/VERIFIED/REJECTED cafes, approve/reject action. |
| `/admin/reviews` | Extended with "Kawiarnie" tab for moderating cafe reviews. |

---

## Registration & Moderation Flow

1. User visits `/register/cafe`, completes 3-step wizard.
2. On submit: `Cafe.status = PENDING`, user's role set to `CAFE`.
3. Admin sees new entry in `/admin/cafes`, clicks Verify or Reject.
4. On VERIFIED: cafe profile becomes public, appears on map and in `/cafes` catalog.
5. On REJECTED: user notified (toast / email — Phase 2).

---

## Cafe Dashboard — Roaster Relations

- Section "Palarnie które serwujemy" in `/dashboard/cafe`.
- Search input: search verified `RoasterProfile` by name.
- Add relation → creates `CafeRoasterRelation`. Remove → deletes it.
- Change is immediately reflected on the roaster's public profile ("Gdzie wypić" section).
- No approval required from the Roaster side.

---

## Reviews

- Consumer submits review on `/cafes/[slug]`: name, rating (1–5), optional comment.
- Identical UX to roaster reviews (reuse existing `ReviewForm` component).
- `Review.cafeId` set, `Review.roasterId` left null.
- Status defaults to `PENDING` — admin moderates in `/admin/reviews` (new "Kawiarnie" tab).
- Only `APPROVED` reviews displayed on public profile.
- Average rating computed in query (no DB column), displayed on cafe card and profile.

---

## Consumer Discovery

### Map (`/map`)
- Roaster pins: existing icon.
- Cafe pins: new icon, distinct colour.
- Toggle control: "Palarnie / Kawiarnie / Oba".
- Click on cafe pin → popup: name, city, link to `/cafes/[slug]`.
- Requires `lat/lng` on `Cafe` model — entered manually during registration.

### Catalog (`/cafes`)
- Grid layout matching `/roasters`.
- Filters: city, country.
- Cafe card: logo, name, city, roaster count, average rating.
- ISR: `revalidate = 3600`.

### Roaster profile — "Gdzie wypić"
- New section below existing roaster content.
- Shows cards of Cafes with an active `CafeRoasterRelation` for this Roaster.
- Card: cafe logo, name, city, link to cafe profile.
- Empty state: "Ta palarnia nie jest jeszcze dostępna w żadnej kawiarni."

### Homepage (`/`)
- Search bar extended OR two separate CTAs: "Znajdź palarnię" / "Znajdź kawiarnię".
- Decision deferred to implementation (depends on current homepage layout).

---

## Server Actions & Revalidation (Consistency Rules)

Every Server Action that mutates data must call `revalidatePath()` for all pages displaying that data:

| Action | Revalidate |
|--------|-----------|
| Create/update Cafe | `/cafes`, `/cafes/[slug]`, `/map` |
| Verify/Reject Cafe (admin) | `/cafes`, `/cafes/[slug]`, `/map` |
| Add/remove CafeRoasterRelation | `/cafes/[slug]`, `/roasters/[slug]`, `/map` |
| Approve/Reject cafe Review | `/cafes/[slug]` |

---

## Stakeholder Value Summary

| Role | Benefit |
|------|---------|
| **Roaster** | Exposure via cafes they supply — "where to drink our coffee" |
| **Cafe** | Discovery channel — consumers find cafes by roaster or map |
| **Consumer** | One place to find specialty coffee: roasters + cafes + connections |
