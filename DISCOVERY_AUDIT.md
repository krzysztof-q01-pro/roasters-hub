# BeanMap.pl — Discovery Features Audit

**Date:** 2026-05-03
**Author:** CTO
**Scope:** Audit what discovery features exist in the codebase and on the live site, identify gaps, and propose 3-5 high-impact improvements.

---

## 1. Current Discovery Features

### What Exists in the Codebase

The current codebase is an **AI Website Factory** for German restaurants/construction companies. It is NOT a coffee discovery platform. There are zero discovery features related to finding roasteries, cafes, or coffee.

The closest "discovery" features are restaurant-page components:

| Feature | Component | Purpose | Reusable? |
|---------|-----------|---------|------------|
| Menu/food listing | `Speisekarte.tsx` (185 lines) | Restaurant menu with category tabs, allergens, dietary labels | Pattern yes, content no |
| Reviews/testimonials | `Reviews.tsx` (89 lines) | Static review cards with star ratings | Pattern yes |
| Opening hours | `OpeningHours.tsx` (98 lines) | Hours table with open/closed indicator | Partial — open status logic is useful |
| Reservation form | `Reservation.tsx` (144 lines) | Booking form (no backend) | Form pattern reusable |
| Dynamic pages | `[slug]/page.tsx` | CMS-driven page rendering | Yes — core pattern |
| Gallery | `Gallery.tsx` (36 lines) | Image gallery | Yes — minimal, needs enhancement |
| FAQ | `FAQ.tsx` (61 lines) | Accordion-style FAQ | Reusable |
| CTA | `CTA.tsx` (34 lines) | Call to action banner | Reusable |
| Hero | `Hero.tsx` (57 lines) | Landing hero section | Needs complete redesign |
| Footer | `Footer.tsx` (75 lines) | Site footer with contact info | Needs complete redesign |

### What Does NOT Exist (Missing for BeanMap.pl)

| Feature | Status | Impact |
|---------|--------|--------|
| **Cafe/roastery listing page** | Missing | Critical — core product |
| **Search functionality** | Missing | Critical — users can't find anything |
| **Map integration** | Missing | Critical — "BeanMap" implies maps |
| **Filter/facets** | Missing | Critical — no way to narrow by roast, city, brewing method |
| **Detail pages for cafes** | Missing | Critical — no way to view a single cafe |
| **Detail pages for roasteries** | Missing | Critical — no way to view a single roastery |
| **User accounts/auth** | Missing | High — no identity, favorites, or reviews |
| **Review/rating system** | Missing | High — reviews are hardcoded, not user-generated |
| **Favorites/bookmarks** | Missing | Medium — no way to save interesting places |
| **Geolocation** | Missing | High — no "near me" feature |
| **Mobile responsiveness audit** | Unknown | Medium — components use responsive classes but need testing |
| **Polish language support** | Missing | Critical — everything is in German |

### Data Model Gaps

The Sanity schemas have NO concept of:
- Roasteries (locations, roast profiles, coffee origins, bean types)
- Cafes (addresses, hours, coffee offerings, equipment)
- Coffee lovers (user profiles, preferences, favorites)
- Reviews (user-generated ratings and text)
- Geolocation data (lat/lng, city, neighborhood)
- Search indexing

Current schemas (`page`, `siteSettings`, `hero`, `about`, `services`, `testimonials`, `faq`, `contact`, `cta`, `post`, `gallery`, `contactSubmission`) are for a single-tenant brochure site.

---

## 2. Live Site Assessment (beanmap.pl)

The live site at `beanmap.pl` displays a password-protected landing page with:
- "Discover Specialty Coffee Roasters" heading
- Private beta access code form
- No discovery features visible behind the wall (confirmed from codebase: only a static homepage with hardcoded German restaurant content)

---

## 3. High-Impact Improvements (Prioritized)

### #1: Roastery & Cafe Data Model (Critical)

**Problem:** No data model for the core domain entities.
**Proposal:** Create Sanity schemas for:
- `roastery` — name, description, location (lat/lng), city, roastTypes[], origins[], website, logo, photos[]
- `cafe` — name, description, location, city, hours, roasteryPartners[], brewingMethods[], wifi, priceRange
- `coffee` — name, roastery, origin, roastLevel, flavorNotes[], processMethod

**Impact:** Without this, nothing else can be built. All discovery features depend on structured coffee data.
**Effort:** 3-4 days

### #2: Map-Based Discovery Page (Critical)

**Problem:** The product is called "BeanMap" but has no map.
**Proposal:** Add an interactive map (Leaflet — open source, free, lightweight) as the primary discovery interface:
- Show roastery/cafe markers on a Poland map
- Click to see summary card
- Filter by type (roastery vs cafe)
- Geolocation "near me" button

**Impact:** This IS the product. Without a map, BeanMap doesn't deliver on its name or promise.
**Effort:** 5-7 days (including UI, clustering, mobile)

### #3: Search & Filtering (Critical)

**Problem:** No way for users to find specific roasteries or cafes.
**Proposal:**
- Text search by name, city, roast type
- Filter by: city, roast level, brewing method, wifi, price range
- Sort by: rating, distance, newest
- Sanity GROQ queries for server-side filtering (no external search needed at MVP scale)

**Impact:** Discovery without search is a static directory. Search makes it dynamic and useful.
**Effort:** 3-4 days

### #4: User Reviews & Ratings (High)

**Problem:** Reviews are hardcoded German restaurant testimonials.
**Proposal:**
- User-generated 1-5 star ratings with text
- Per-cafe and per-roastery review pages
- Aggregate ratings shown on listing and detail pages
- Requires auth (see auth recommendation above)

**Impact:** User-generated content creates engagement, trust, and SEO value.
**Effort:** 4-5 days (depends on auth)

### #5: Polish Localization & Branding (High)

**Problem:** Everything is in German with restaurant branding.
**Proposal:**
- Replace all content with Polish/coffee context
- Update Tailwind color palette from amber/stone (restaurant) to coffee-appropriate palette (brown/cream/espresso)
- Add i18n infrastructure (next-intl) for Polish/English
- Replace German legal menu items with Polish equivalents

**Impact:** Without Polish localization, the product can't serve its market.
**Effort:** 2-3 days

---

## 4. Recommended Priority Order

| Priority | Feature | Rationale |
|----------|---------|-----------|
| P0 | Roastery & Cafe Data Model | Everything depends on structured data |
| P0 | Polish Localization & Branding | Can't ship German content to Polish market |
| P1 | Map-Based Discovery Page | This is the product's core value proposition |
| P1 | Search & Filtering | Makes discovery functional |
| P2 | User Auth & Accounts | Enables reviews, favorites, community |
| P2 | Reviews & Ratings | Builds trust and engagement |
| P3 | Favorites/Bookmarks | Nice-to-have for repeat visits |
| P3 | Mobile Responsiveness Audit | Polish pass before launch |

---

## 5. Success Criteria

Per the task requirements:
- ✅ Clear understanding of what already ships — documented above (single-tenant German restaurant brochure, no discovery)
- ✅ Concrete list of 3-5 high-impact improvements — 5 items ranked P0-P2 above
- ✅ Prioritized backlog — provided in section 4

The single most important next step is **defining the roastery and cafe data model in Sanity** — without it, no discovery feature can be built.