# Design Spec: UX Enhancement — Images, Geocoding, Reviews

**Date:** 2026-05-04
**Author:** @AGENT (approved by @MN)
**Status:** Approved for implementation

---

## Context

Current pain points in the user experience:

1. **Manual coordinates entry** — users must look up lat/lng in Google Maps and paste them. Error-prone and poor UX.
2. **No address autocomplete** — users type full addresses manually, no suggestions.
3. **Inconsistent image handling** — Roasters use `RoasterImage` table, Cafes use `logoUrl`/`coverImageUrl` string fields. No unified gallery.
4. **No user-contributed photos** — only owners and admins can add images. Users can't enrich profiles.
5. **Unverified reviews** — anyone can submit a review without authentication, reducing credibility.
6. **No default photo pool** — new entries look empty until an admin manually adds images.

**Goal:** Unified image system with user uploads and admin approval, address geocoding + autocomplete via Nominatim, auth-gated reviews tied to user profiles, default photo pool for admins, and profile galleries with lightbox.

---

## Approach

**Single unified plan** — evolve existing architecture without disruptive rewrites:

- New `Image` model replaces `RoasterImage`, supplements `Cafe` (old URL fields kept for backward compat)
- Nominatim/OSM for geocoding and address autocomplete (free, rate-limited)
- Reviews gated behind Clerk auth, tied to `UserProfile` via `userId`
- Admin settings page for configurable image upload limits
- All forms (registration, admin, dashboard) get address autocomplete + minimap

No rejected alternatives — the decisions were made interactively (Nominatim over Google Maps, unified Image model over separate tables, old URL fields kept).

---

## Architecture

### New Prisma Models

```prisma
enum EntityType {
  CAFE
  ROASTER
}

enum ImageStatus {
  PENDING
  APPROVED
  REJECTED
}

model Image {
  id           String      @id @default(cuid())
  url          String
  entityType   EntityType
  entityId     String
  uploadedById String
  status       ImageStatus @default(PENDING)
  isDefault    Boolean     @default(false)
  isPrimary    Boolean     @default(false)
  sortOrder    Int         @default(0)
  createdAt    DateTime    @default(now())

  uploadedBy   UserProfile @relation(fields: [uploadedById], references: [id])
  @@index([entityType, entityId])
  @@index([uploadedById])
  @@index([status])
}

model AppSettings {
  id    String @id @default("singleton")
  imageMaxTotal    Int @default(10)
  imageMaxPerUser  Int @default(1)
  imageMaxPerOwner Int @default(3)
  defaultPoolMax   Int @default(20)
  updatedAt DateTime @updatedAt
}
```

### Review Model Changes

```prisma
model Review {
  // ... existing fields stay
  userId     String?        // NEW — FK to UserProfile
  updatedAt  DateTime?      // NEW — for edit tracking

  user       UserProfile?   @relation(fields: [userId], references: [id])
  @@unique([userId, roasterId])  // NEW — one review per user per entity
  @@unique([userId, cafeId])     // NEW
}
```

`authorName` stays for existing reviews. New reviews derive `authorName` from Clerk `fullName` at write time.

### Component Map

```
web/src/
├── lib/
│   └── geocoding.ts              # geocodeAddress(), searchAddress() — Nominatim wrapper
├── components/
│   └── shared/
│       ├── AddressAutocomplete.tsx   # Debounced input + Nominatim dropdown
│       ├── MiniMap.tsx               # Static Leaflet with pin for coord confirmation
│       ├── ImageGallery.tsx          # Grid/carousel of approved images
│       ├── ImageLightbox.tsx         # Full-size image overlay
│       ├── ImageUploader.tsx         # UploadThing dropzone with limit counter
│       ├── ImageApprovalQueue.tsx    # Admin: PENDING images list with Approve/Reject
│       ├── DefaultImagePool.tsx      # Admin: grid, upload, delete, filter by type
│       ├── ImageSortableList.tsx     # Drag-and-drop reorder for admin/owner
│       ├── ReviewSortControls.tsx    # Sort dropdown (newest / highest rated)
│       └── VerifiedOwnerBadge.tsx    # Badge for owner-uploaded images
├── app/[locale]/
│   ├── admin/
│   │   ├── images/
│   │   │   ├── page.tsx              # Default pool management
│   │   │   └── pending/page.tsx      # Image approval queue
│   │   └── settings/page.tsx         # AppSettings: image limits
│   ├── api/uploadthing/
│   │   └── core.ts                   # +defaultImage, +userImage endpoints
│   └── dashboard/
│       ├── roaster/client.tsx        # +Gallery section
│       └── cafe/client.tsx           # +Gallery section
└── actions/
    ├── image.actions.ts              # uploadImage, approveImage, rejectImage, deleteImage
    │                                   setPrimaryImage, reorderImages, addDefaultImage
    ├── review.actions.ts             # +updateReview, +deleteReview, +reportReview
    └── settings.actions.ts           # updateAppSettings
```

---

## Feature Details

### 1. Geocoding & Address Autocomplete

**`lib/geocoding.ts`:**
- `geocodeAddress(address, city, country)` → `{ lat, lng, displayName } | null`
  - Calls `https://nominatim.openstreetmap.org/search?q=<encoded>&format=json&limit=1`
  - Sets `User-Agent: BeenMap/1.0` header (Nominatim requirement)
  - Rate limit: in-memory timestamp check (min 1s between calls)
- `searchAddress(query)` → `{ displayName, lat, lng }[]`
  - Same endpoint, limit=5, used by autocomplete

**`AddressAutocomplete` component:**
- Controlled input with 300ms debounce
- Dropdown with suggestions from Nominatim
- On select: fills address field, auto-geocodes coordinates, shows minimap pin
- Loading state ("Searching...") during API call
- Empty state ("Type to search for an address")
- Error state ("Could not find address. Enter coordinates manually.")
- Keyboard navigation (arrow keys + Enter)

**`MiniMap` component:**
- Static Leaflet map (not interactive, just visual confirmation)
- Single marker at lat/lng
- Map height: 200px
- Shows when coordinates are set (via address selection or manual entry)
- Hidden when no coordinates

**Integration points:**
- Cafe registration form: Step 1 (Location) — replaces separate address/lat/lng inputs
- Roaster registration form: NEW address step
- Admin cafe detail: LocationSection
- Admin roaster detail: LocationSection
- Cafe dashboard: profile edit
- Roaster dashboard: profile edit

### 2. Unified Image System

**Image model roles:**
- `isDefault: true` — part of admin's default pool
- `isPrimary: true` — main cover image for the entity (only one per entity)
- `status: APPROVED` — visible on public profiles
- `status: PENDING` — awaiting admin approval
- `status: REJECTED` — not displayed, URL freed from UploadThing

**UploadThing endpoints:**
- `defaultImage` — admin only, auto-sets `isDefault: true`, `status: APPROVED`
- `userImage` — any authenticated user, receives `entityType` + `entityId` via headers, creates PENDING record

**Image limits (from AppSettings):**
- `imageMaxTotal` — max images per entity (default 10)
- `imageMaxPerUser` — max images per regular user per entity (default 1)
- `imageMaxPerOwner` — max images per owner per entity (default 3)
- Owner = user whose `UserProfile.id` matches `entity.ownerId`

**Upload flow:**
1. User clicks "Add Photo" on profile → modal opens
2. Dropzone (UploadThing) with counter "You can add X more photos"
3. On upload complete: creates `Image` with status PENDING
4. Toast: "Photo submitted for review"
5. Owner flow same but counter up to 3, can also delete own images

### 3. Admin Image Management

**`/admin/images` — Default Pool:**
- Grid of default images, grouped by entityType (tabs: Cafes | Roasters)
- Upload button (dropzone or click)
- Delete button per image (with confirmation)
- Max 20 in pool (from `AppSettings.defaultPoolMax`)

**`/admin/images/pending` — Approval Queue:**
- List/table of PENDING images
- Columns: thumbnail, entity (name + type), uploaded by, date
- Per row: Approve / Reject buttons
- On Approve: status → APPROVED, if entity has no primary → set isPrimary
- On Reject: status → REJECTED, optionally delete from UploadThing
- Admin notes field for rejection reason
- Empty state: "No images pending review"

**Assigning default images to entities:**
- In admin detail (ImagesSection), "Add from pool" button opens modal
- Grid of default images for that entityType
- Click to assign (creates APPROVED Image record linked to the entity)

### 4. Owner Dashboard Gallery

**New section in both cafe and roaster dashboards:**
- Grid of owner's uploaded images (status filter: APPROVED + PENDING)
- Upload button (with counter: "You've used X of 3")
- Per image: set as primary (star button), delete (trash), status badge
- `ImageSortableList` — drag-and-drop to reorder (updates `sortOrder`)
- PENDING images shown with "Awaiting approval" badge

### 5. Review System Overhaul

**Auth gate:**
- `ReviewList` renders for all (shows existing reviews)
- `ReviewForm` wrapped in `<SignedIn>` from Clerk:
  - Signed in → shows form
  - Signed out → shows "Sign in to leave a review" button (`<SignInButton>`)

**User identity:**
- New reviews: `userId` = Clerk `userId`, `authorName` = `user.fullName`
- Existing reviews: `authorName` stays, `userId` is null
- Display: for new reviews, `authorName` from `Review.authorName` (no additional query needed)

**Edit/delete:**
- Author sees edit (pencil) and delete (trash) icons on their own reviews
- Edit: inline form replaces the review text, save/cancel buttons
- Delete: confirmation dialog, then soft-delete or status change
- Admin can also edit/delete any review

**Sorting:**
- `ReviewSortControls` dropdown: "Newest first" (default) | "Highest rated"
- Client-side sort (reviews already loaded)
- Sorted reviews passed to `ReviewList`

**Unique constraint:**
- One review per user per entity (`@@unique([userId, roasterId])`, `@@unique([userId, cafeId])`)
- Attempting second review shows toast: "You've already reviewed this place. You can edit your existing review below."
- Existing review scrolls into view

### 6. Profile Image Gallery

**Replaces single cover image on cafe and roaster profiles:**
- `ImageGallery` component shows all APPROVED images
- Grid layout (2-3 columns on desktop, 2 on tablet, 1 on mobile)
- Primary image shown larger or first
- `isDefault` images get subtle "Stock photo" label (accessible but not prominent)
- Owner images show `VerifiedOwnerBadge` (small checkmark badge in corner)
- Click any image → `ImageLightbox` overlay

**`ImageLightbox`:**
- Full-screen overlay with dark backdrop
- Image at natural aspect ratio (max 90vw/90vh)
- Left/right arrow navigation
- Close on X button, Escape key, or click outside
- Image counter "3 / 7"

**Empty states:**
- No approved images: placeholder with coffee cup icon + "No photos yet"
- For owners: "+ Add first photo" CTA button
- For visitors: "Know this place? Sign in to add a photo"

### 7. Empty States & CTAs

**Reviews:**
- No reviews: "No reviews yet. Be the first to review!" with CTA
- Signed out: "Sign in to leave a review"
- One review only: "You've already reviewed this place" (links to edit)

**Images:**
- Gallery empty: "No photos yet" (+ CTA for owners/visitors)
- Admin pending queue empty: "All clear! No images waiting for review."
- Default pool empty: "Upload your first default image to help new entries look great."

### 8. Admin Settings

**`/admin/settings` — new page:**
- Image limits section:
  - `imageMaxTotal` — number input (default 10)
  - `imageMaxPerUser` — number input (default 1)
  - `imageMaxPerOwner` — number input (default 3)
  - `defaultPoolMax` — number input (default 20)
- Save button → `updateAppSettings` server action
- Changes take effect immediately (no cache)

---

## Data Migration

1. `Image` model created via Prisma migration
2. Existing `RoasterImage` rows → `Image` with `entityType: ROASTER`, `status: APPROVED`
3. `Review.userId` + `Review.updatedAt` added via migration (nullable)
4. Existing `Review` records: `userId` stays null, display falls back to `authorName`
5. `Cafe.logoUrl` / `Cafe.coverImageUrl` — no migration needed, kept for backward compat

---

## Testing

- Unit tests for `geocoding.ts` (mocked fetch)
- Unit tests for `image.actions.ts` (limit enforcement, auth checks)
- Unit tests for `review.actions.ts` (unique constraint, edit/delete auth)
- Component tests for `AddressAutocomplete` (debounce, selection, error states)
- E2E: image upload + approval flow
- E2E: review auth gate (signed out → sign in → review)

---

## i18n

New translation keys (EN/PL/DE) needed for:
- Address autocomplete states
- Image upload UI (counters, statuses)
- Review auth gate messages
- Admin image management
- Empty states
- `AppSettings` field labels

---

## Tasks for ROADMAP

1. **DB: Image + AppSettings + Review changes** — Prisma migration
2. **lib/geocoding.ts** — Nominatim wrapper
3. **AddressAutocomplete + MiniMap** — shared components
4. **Integrate autocomplete into all forms** — register, admin, dashboard
5. **Image actions** — uploadImage, approveImage, rejectImage, deleteImage, reorderImages
6. **UploadThing endpoints** — defaultImage, userImage
7. **/admin/images** — default pool management
8. **/admin/images/pending** — approval queue
9. **/admin/settings** — image limits configuration
10. **Dashboard gallery sections** — roaster + cafe owner dashboards
11. **Review auth gate** — SignedIn wrapper, userId, edit/delete
12. **ImageGallery + ImageLightbox** — profile display
13. **Sortable image list** — drag-and-drop reorder
14. **Review sort controls** — newest/highest rated
15. **Empty states + CTAs** — galleries, reviews, admin queues
16. **VerifiedOwnerBadge** — owner-uploaded image indicator
