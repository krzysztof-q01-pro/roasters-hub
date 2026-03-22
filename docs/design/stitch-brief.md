# Roasters Hub — Design Brief for Google Stitch

**Version:** 1.0
**Date:** 2026-03-14
**Purpose:** Input document for Google Stitch UI generation

---

## 1. Product Overview

### What is Roasters Hub?

Roasters Hub is a **three-sided discovery platform** for the specialty coffee industry. It connects:
- **Coffee roasters** seeking visibility beyond their local market
- **Cafés and buyers** searching for new suppliers
- **Coffee enthusiasts** discovering specialty roasters worldwide

It is the only platform that serves all three sides simultaneously — functioning as a global, verified directory of specialty coffee roasters with rich profiles, filterable catalog, interactive map, and direct contact links.

**Tagline:** *Discover the world's best specialty coffee roasters.*

**URL structure:** `beanmap.cafe`

### Core User Journeys

**Journey A — Café buyer:**
Homepage → Catalog (filter by country + certifications) → Roaster Profile → Click "Contact" or "Visit Website"

**Journey B — Coffee enthusiast:**
Google search "specialty roasters in Berlin" → SEO Landing Page → Roaster Profile → Click "Shop Online" → Share

**Journey C — Roaster:**
Homepage → Register → Fill profile (3-step form) → Await verification → Dashboard

**Journey D — Traveler:**
Map page → Find pins in city → Click pin → Roaster Profile

---

## 2. Visual Direction

### Design Philosophy

**Editorial minimalism with warmth.** The modern specialty coffee aesthetic is clean, intentional, and premium — not rustic or "coffee-brown." Think: well-designed food magazine meets clean tech product. References to aim for:

- **Onyx Coffee Lab** (onyxcoffeelab.com) — dark, editorial, bold typography
- **Counter Culture Coffee** (counterculturecoffee.com) — clean white, strong brand voice
- **La Marzocco** (lamarzocco.com) — warm grey, premium, confidence

### Color Palette — "Clean & Warm"

```
Background:     #FAFAF8   Warm off-white page background (not pure white)
Surface:        #FFFFFF   Cards, modals, inputs
Text primary:   #1A1A1A   Headings and body text
Text secondary: #6B6B6B   Subtext, labels, meta
Text tertiary:  #9B9B9B   Placeholders, disabled states

Accent:         #C4621D   Burnt orange — primary brand color (CTAs, links, highlights)
Accent hover:   #A85218   Accent darker (hover state)
Accent soft:    #F5E6D3   Very light orange (badge backgrounds, highlights)

Success:        #2D6A4F   Deep green — used for Verified badge, certifications
Success soft:   #E8F4EE   Light green backgrounds

Warning:        #B45309   Amber — for pending status
Warning soft:   #FEF3C7

Error:          #DC2626   Red — for rejected, errors
Error soft:     #FEE2E2

Border:         #E5E5E0   Default borders, dividers
Border strong:  #D0D0CA   Focused or emphasized borders
```

### Typography

```
Display font:   "Fraunces" (Google Fonts — variable, serif with warmth)
                Used for: Hero headlines, roaster names in profile, large numbers
                Fallback: Georgia, serif

UI font:        "Inter" (Google Fonts — variable, clean sans-serif)
                Used for: Everything else — body, labels, navigation, buttons
                Fallback: system-ui, sans-serif

Type scale:
  Display XL:  56px / 600 weight / Fraunces     (hero headline)
  Display L:   40px / 600 weight / Fraunces     (page titles, roaster name in profile)
  Display M:   32px / 600 weight / Fraunces     (section headings)
  Body L:      18px / 400 weight / Inter        (lead paragraphs)
  Body M:      16px / 400 weight / Inter        (default body text)
  Body S:      14px / 400 weight / Inter        (secondary info, meta)
  Label:       12px / 500 weight / Inter        (badges, tags, caps tracking)
  Caption:     11px / 400 weight / Inter        (fine print, timestamps)
```

### Component Style

```
Border radius:
  Cards:        12px
  Buttons:      6px
  Inputs:       6px
  Badges:       4px (small), 20px (pill/tag)
  Map popups:   8px

Shadows:
  Card default: 0 1px 3px rgba(0,0,0,0.08)
  Card hover:   0 4px 12px rgba(0,0,0,0.12)
  Dropdown:     0 8px 24px rgba(0,0,0,0.12)

Spacing system: 4px base unit (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96)
```

### What to Avoid

- ❌ Coffee-brown color palettes (looks dated)
- ❌ Heavy gradients or glassmorphism
- ❌ Busy background patterns or textures
- ❌ Too many font weights/sizes (max 3 in any single screen)
- ❌ Full-width colorful hero sections (editorial white is better)
- ❌ Centered body text for long paragraphs
- ❌ Modal-heavy interactions (prefer inline or page navigation)

---

## 3. Screens

### Responsive Breakpoints

```
Mobile S:   375px   (iPhone SE — minimum supported)
Mobile L:   430px   (iPhone 15 Pro Max)
Tablet:     768px
Desktop:    1280px  (primary design target)
Wide:       1440px
```

All screens must be designed **mobile-first** — the mobile layout is the primary layout.

---

### Screen 01: Homepage

**URL:** `/`
**Rendering:** Static (SSG)
**Primary CTA:** "Browse Roasters"

#### Layout (desktop, top → bottom)

**Navigation bar:**
- Logo "Bean Map" (left) — Fraunces font, accent color for "Hub"
- Nav links: Browse Roasters | Map | List Your Roastery (right)
- Clean white background, subtle bottom border

**Hero section:**
- Left column (60%): Large headline in Fraunces: *"Discover the world's specialty coffee roasters"*
- Subheadline (Inter, body L): *"The global directory connecting cafés and coffee lovers with verified specialty roasters."*
- Two CTAs side by side: Primary "Browse Roasters" (accent orange, solid) + Secondary "List Your Roastery" (outline)
- Right column (40%): Collage of 3–4 roaster profile photos (staggered, overlapping)
- Background: #FAFAF8

**Stats bar:**
- Three numbers: "60+ Roasters" | "25 Countries" | "Verified Profiles"
- Small, centered, text-secondary color. Separator dots.

**Featured Roasters strip:**
- Section title: "Featured Roasters" (Display M, Fraunces)
- Horizontal scroll on mobile, 4-column grid on desktop
- 4 RoasterCard components (see component specs below)
- "View all roasters →" link at end

**Three-panel value props:**
- Section title: "Built for the specialty coffee community"
- 3 columns, each with icon + heading + 2-line description:
  - Coffee Roasters: "Get discovered by cafés and enthusiasts worldwide"
  - Cafés & Buyers: "Find your next supplier with filters that matter"
  - Coffee Lovers: "Explore and buy from the world's best roasters"

**Map teaser:**
- Full-width section (muted background #F4F4F0)
- Left: Headline "Find roasters wherever you go" + short description + "Explore the Map" CTA
- Right: Static screenshot/preview of the map with a few pins visible

**Newsletter signup:**
- Centered, single column
- Headline: "Stay in the loop"
- Subtext: "New roasters, curated picks, and specialty coffee news."
- Email input + "Subscribe" button + radio: "I'm a Café / I'm a Coffee Lover" (segment selector)

**Footer:**
- 3 columns: Logo + tagline | Links (Browse, Map, Register) | Social icons
- Copyright line
- Background: #1A1A1A (dark), text white

#### Mobile layout

- Hero: stacked (text + CTA above image)
- Featured roasters: horizontal scroll
- Value props: stacked single column
- Map teaser: stacked, map preview below text

---

### Screen 02: Roaster Catalog

**URL:** `/roasters`
**Rendering:** SSR (filters in URL params)
**Primary CTA:** Click on a roaster card

#### Layout (desktop)

**Page header:**
- Breadcrumb: Home > Roasters
- H1: "Specialty Coffee Roasters" + count "(247 verified)"

**Layout: 2-column (sidebar + main)**

**Left sidebar (300px):**
- "Filters" heading + "Clear all" link
- Search input: "Search by name or city..."
- Filter group: "Country" — select dropdown with flag emojis
- Filter group: "Origin" — multi-select chips (Ethiopia, Kenya, Colombia, Brazil...)
- Filter group: "Certifications" — checkbox list with icons (Fair Trade ✓, Organic ✓, Direct Trade ✓...)
- Filter group: "Roast Style" — toggle chips (Light / Medium / Dark / Espresso / Filter)
- Toggle: "Direct Trade only" (prominent, switch)
- Toggle: "Featured only"

**Main content (flexible):**
- Sort bar: "Showing 24 of 247" | Sort: "Relevance / Name A–Z / Newest"
- Grid: 3 columns desktop, 2 tablet, 1 mobile
- 24 RoasterCard components
- Pagination: Previous | 1 2 3 ... 10 | Next

**Empty state:**
- Illustration (simple, not busy)
- "No roasters found for these filters"
- "Clear filters" CTA

#### Mobile layout
- Filters collapsed in drawer (bottom sheet) triggered by "Filter" button (sticky top bar)
- Single column grid
- Sticky top: search + filter button + sort

---

### Screen 03: Roaster Profile

**URL:** `/roasters/[slug]` (e.g. `/roasters/hard-beans-opole`)
**Rendering:** ISR (revalidate 1h)
**Primary CTAs:** "Contact Roaster" + "Shop Online"

#### Layout (desktop)

**Breadcrumb:** Home > Roasters > Poland > Hard Beans

**Hero block:**
- Full-width image (16:9 or 3:1 panoramic crop) — roastery interior or beans
- Overlaid bottom-left: Roaster name (Display L, Fraunces, white text on dark gradient)
- Location: "📍 Opole, Poland" (white, smaller)
- Top-right corner: Verified badge (green background, white checkmark + "Verified Roaster")

**Main content (2-column layout, 65/35 split):**

**Left column — main content:**
- About section: H2 "About Hard Beans" + full description (body text)
- Origins section: H2 "Coffee Origins" + tag chips (Ethiopia 🇪🇹, Kenya 🇰🇪, Colombia 🇨🇴)
- Certifications section: H2 "Certifications" + badge components with icons
- Photo gallery: 2-column grid of roastery photos (lightbox on click)

**Right column — info card (sticky on scroll):**
- White card with border and subtle shadow
- Roaster name (bold)
- 🗺 Location: city, country (with flag)
- ✅ Verified badge (inline)
- Divider
- Primary CTA: "Visit Website" (accent orange, full-width)
- Secondary CTA: "Shop Online" (if shopUrl exists — outline button)
- Tertiary: Instagram link icon button
- Divider
- Contact section: email (if public)
- "Share this roaster" — ghost button with share icon
- Mini map: 200px embedded map showing location pin

**Below main content:**
- "More roasters in Poland" — 3 RoasterCards horizontal
- Back to catalog link

#### Mobile layout
- Hero image full width, taller crop
- Info card appears after description (not sticky)
- Gallery: single column
- CTAs: full-width stacked

---

### Screen 04: Map

**URL:** `/map`
**Rendering:** SSR + Client (Leaflet)

#### Layout (desktop)

**Full-screen layout (viewport height):**

**Top bar (fixed, 60px):**
- Logo (left)
- Search input: "Search city or roaster..." (center, 400px wide)
- Filter chips: Country dropdown + Certification dropdown
- "List view" toggle button (right)

**Map area (main, ~70% width):**
- Leaflet map, fullscreen
- Custom pin markers: accent orange circle with coffee cup icon
- Clustered pins when zoomed out
- On pin click: popup with minicard (roaster image + name + city + "View Profile" link)

**Right sidebar (30%, scrollable):**
- "247 roasters" count
- Scrollable list of RoasterCard (compact version — horizontal layout, image left + info right)
- Highlighted card when pin hovered on map
- Load more / infinite scroll

#### Mobile layout
- Map fills full screen
- Bottom sheet: shows list (collapsed — shows just top 2 roasters)
- Drag up: expands list to 50% screen
- Top bar collapses to icon-only

---

### Screen 05: Register Roastery

**URL:** `/register`
**Rendering:** SSR

**Multi-step form — 3 steps.**

#### Step indicator (top of form)
Horizontal stepper: ① Basic Info — ② Contact & Links — ③ Specialty Details
Active step: accent color. Completed: green checkmark.

#### Step 1: Basic Info
- Headline: "Tell us about your roastery"
- Fields:
  - Roastery name (required)
  - Country (select with search)
  - City (text input)
  - Description (textarea, 100–2000 chars, char counter shown)
- "Continue →" button (accent, right-aligned)

#### Step 2: Contact & Links
- Headline: "How can people find you?"
- Fields:
  - Website URL
  - Shop / online store URL
  - Instagram handle (@handle)
  - Email address (for contact on profile — optional public display)
- Helper text: "These will be displayed on your public profile."
- "← Back" + "Continue →"

#### Step 3: Specialty Details
- Headline: "What makes your coffee special?"
- Fields:
  - Coffee origins (multi-select tag input: type to search + add)
  - Roast styles (toggle chips: Light / Medium / Dark / Espresso / Filter)
  - Certifications (checkbox grid with icons)
  - Profile photos (drag & drop upload, max 5 photos, 5MB each)
    - Drop zone with dashed border + upload icon + "Drag photos here or click to upload"
    - Preview thumbnails with ✕ to remove
- "← Back" + "Submit for Verification"

#### Success State (after submit)
- Centered content, no form
- Large checkmark illustration (green)
- Headline: "Your profile is submitted!"
- Body: "We'll review your roastery profile within 48 hours. You'll receive an email once it's verified and live."
- CTA: "Browse other roasters while you wait →"

---

### Screen 06: Admin — Pending Queue

**URL:** `/admin/pending`
**Access:** Admin only

#### Layout (desktop, 2-panel)

**Left panel — Queue list (400px, scrollable):**
- "Pending Verification" heading + count badge "12"
- Filter tabs: All | Pending | Verified | Rejected
- List items (each):
  - Thumbnail (40px square, rounded)
  - Roaster name (bold)
  - City, Country
  - Submitted date (relative: "2 hours ago")
  - Status badge
  - Clicking selects and loads in right panel

**Right panel — Detail view (flexible):**
- Roaster name + location (header)
- Status badge (large)
- Full profile preview (description, certifications, origins, links)
- Photo gallery (submitted images)
- Admin notes (textarea + "Add Note" button)
- Action buttons (right-aligned):
  - "✓ Verify & Publish" (green, primary)
  - "✗ Reject" (red, outlined — opens reason input)
  - "Edit Profile" (ghost)

**Reject modal (on "Reject" click):**
- Title: "Reason for rejection"
- Textarea: "Please provide a brief reason..."
- "Cancel" + "Send Rejection" buttons

---

### Screen 07: SEO Landing Page

**URL:** `/country/[country]` (e.g. `/country/poland`)
**Rendering:** SSG
**Primary purpose:** Organic SEO traffic + discovery

#### Layout

**Page header:**
- Breadcrumb: Home > Roasters > Poland
- Flag emoji + H1: "🇵🇱 Specialty Coffee Roasters in Poland"
- Subtitle: "Discover {count} verified specialty coffee roasters based in Poland. From micro-roasteries in Kraków to award-winning roasters in Warsaw."
- Count badge: "8 verified roasters"

**Roaster grid:**
- Same 3-column grid as catalog
- All verified roasters from that country
- No filters (separate page from full catalog)

**Regional map (optional):**
- Small embedded map (400px height) showing only pins for this country
- Can be a static image with pins for SSG

**City sub-links:**
- "Browse by city in Poland:"
- Pill links: Warsaw (3) | Kraków (2) | Opole (1) | Wrocław (1) | ...

**"Are you a roaster in Poland?":**
- Small CTA section: "List your roastery for free →"

**Related countries:**
- "Explore roasters in other countries:"
- Flag + country name links: Germany | Czech Republic | Austria | ...

---

## 4. Component Inventory

### RoasterCard (catalog card)

**Variants:**
- Default (grid card)
- Compact (map sidebar — horizontal layout)
- Featured (slightly larger, accent border or "Featured" label)

**Anatomy:**
```
┌─────────────────────────┐
│  [Image 16:9]           │  ← Primary image or placeholder
│                 Featured│  ← Optional "Featured" pill top-right
├─────────────────────────┤
│  🇵🇱 Opole, Poland       │  ← Flag + location (Label, text-secondary)
│  Hard Beans          ✅ │  ← Name (Body L, bold) + Verified badge
│                         │
│  🌿 Direct Trade  🌱 Org│  ← Max 2 certification badges
│  Ethiopia  Kenya        │  ← Origin tags (max 3)
└─────────────────────────┘
```

**States:** Default | Hover (card lifts, shadow increases) | Loading (skeleton)

---

### VerifiedBadge

```
┌──────────────────┐
│ ✓  Verified      │  ← Green background (#2D6A4F), white text, 4px radius
└──────────────────┘
```
**Sizes:** Small (inline text), Medium (profile header), Large (card overlay)

---

### CertificationBadge

```
┌────────────────┐
│ 🌿 Direct Trade│  ← Icon + label, success-soft background, success text color
└────────────────┘
```
**All variants:** Fair Trade | Organic | Direct Trade | Rainforest Alliance | Bird Friendly | SCA Member | Demeter

---

### FilterChip

```
[  Ethiopia  ]     ← Inactive: border, transparent bg
[✓ Ethiopia  ]     ← Active: accent-soft bg, accent text, accent border
```

---

### SearchBar

```
┌─────────────────────────────────────┐
│ 🔍  Search roasters, cities...      │  ← Input with icon left, clear button right (when filled)
└─────────────────────────────────────┘
```
**States:** Empty | Typing | Results dropdown (auto-suggest: roaster names + city names) | No results

---

### MapPin

```
●  ← Filled circle, accent orange, with coffee icon inside
●  ← Hover/Selected: larger, with white ring
```
**Clustered:** Orange circle with count number inside

---

### ShareButton

```
[ ↗ Share this roaster ]   ← Ghost button, icon left
```
On click: opens native share (mobile) or clipboard copy + tooltip "Link copied!"

---

### CTAButton

```
Primary:    [  Browse Roasters  ]   ← Accent bg, white text
Secondary:  [  List Your Roastery  ]   ← Transparent bg, accent border + text
Ghost:      [  ↗ Share  ]   ← No border, accent text only
Destructive:[  Reject  ]   ← Red bg, white text (admin only)
```
**Sizes:** SM (32px h) | MD (40px h, default) | LG (48px h)
**States:** Default | Hover | Active | Disabled | Loading (spinner replaces text)

---

### StatusBadge

```
PENDING:   [ ⏳ Pending  ]   ← Warning bg (#FEF3C7), warning text
VERIFIED:  [ ✓ Verified  ]   ← Success bg, success text
REJECTED:  [ ✗ Rejected  ]   ← Error bg, error text
INACTIVE:  [ ○ Inactive  ]   ← Gray bg, gray text
```

---

### FormStep Indicator

```
① Basic Info  ──────  ② Contact & Links  ──────  ③ Specialty Details
(active — accent)     (upcoming — gray)           (upcoming — gray)
```
Completed steps show checkmark icon. Mobile: shows "Step 2 of 3" text only.

---

### NewsletterForm

```
           Stay in the loop
New roasters, curated picks, and specialty coffee news.

  ┌──────────────────────────┐  ┌─────────────┐
  │  Your email address      │  │  Subscribe  │
  └──────────────────────────┘  └─────────────┘

  I am a:  ○ Café / Buyer   ○ Coffee Enthusiast
```
**States:** Empty | Filled | Submitting (button loading) | Success ("You're subscribed! ✓") | Error

---

## 5. Navigation & Header

### Main Header (public)

```
Desktop:
┌─────────────────────────────────────────────────────────────┐
│  Roasters Hub    Browse Roasters    Map         List Roastery│
└─────────────────────────────────────────────────────────────┘
Logo left. Nav center-right. "List Roastery" is accent-colored CTA.

Mobile:
┌─────────────────────────────────────────────────────────────┐
│  Roasters Hub                                          ☰    │
└─────────────────────────────────────────────────────────────┘
Hamburger opens full-screen menu with all nav items.
```

### Admin Header

```
┌─────────────────────────────────────────────────────────────┐
│  Roasters Hub (Admin)    Pending (12)   All Roasters   ↗ Site│
└─────────────────────────────────────────────────────────────┘
```

---

## 6. UX Principles

| Principle | Implementation |
|-----------|---------------|
| **Discovery First** | Browse catalog requires no login. Every page has a path to the catalog. |
| **Trust Signals** | Verified badge is always visible. Certifications are icons, not just text. |
| **Zero Friction** | Cafés and consumers never see a login gate. Register is only for roasters. |
| **Mobile-First** | Design at 375px first. Enhance for desktop. Catalog works perfectly on mobile. |
| **Speed Perception** | Skeleton loaders (not spinners). Images always have `width`/`height` for no CLS. |
| **Progressive Disclosure** | Admin quick-actions are visible. Advanced details on click. |
| **Graceful Empty States** | Every list has a designed empty state with a CTA. |
| **Accessible** | WCAG AA contrast. All interactive elements have visible focus rings. |

---

## 7. Accessibility Requirements

- **Contrast:** All text meets WCAG AA (4.5:1 normal text, 3:1 large text)
- **Focus rings:** All buttons, links, inputs show visible focus ring (2px, accent color)
- **Touch targets:** Minimum 44×44px on mobile
- **Images:** All roaster images need descriptive alt text pattern: `"{Roaster Name} — specialty coffee roastery in {City}"`
- **Headings:** Single H1 per page. Logical H2→H3 hierarchy. No skipped levels.
- **Landmarks:** `<header>`, `<main>`, `<nav>`, `<footer>` semantic elements
- **Map:** Map has text alternative (the sidebar list) for screen reader users
- **Forms:** All inputs have visible labels (not just placeholder text)
- **Badges/Icons:** Color-coded badges also use text labels (not color alone)

---

## 8. Key Interactions

| Interaction | Behavior |
|-------------|----------|
| Catalog filter applied | URL param updates, results refresh, count updates, no full page reload |
| Roaster card click | Navigate to profile page |
| Map pin click | Popup opens with mini-card; sidebar highlights matching roaster |
| Share button click | Mobile: native share sheet. Desktop: clipboard copy + "Link copied!" tooltip |
| Newsletter submit | Inline success state (no page redirect) |
| Registration form submit | Loading state on button → success screen |
| Admin verify | Row moves from Pending to Verified with animation; count decrements |
| Image upload | Drag-and-drop zone with preview thumbnails; progress bar per image |

---

## 9. Content Strategy Notes

**Roaster name typography:** Always `Fraunces` in display contexts (profile hero, card hover state headline).

**Location format:** "City, Country" with country flag emoji. Country code badges use ISO 3166-1 alpha-2 (`PL`, `DE`, `ET`).

**Empty description placeholder:** When no description yet: *"Profile description coming soon. Visit their website to learn more."*

**CTA copy hierarchy:**
- Primary discovery: "Browse Roasters"
- Primary roaster: "List Your Roastery" (not "Sign Up" — too generic)
- Profile contact: "Visit Website" (primary) > "Shop Online" > "Instagram"
- Map: "Explore the Map"

---

*This brief covers 7 screens (P0 MVP), 13 component types, and full responsive specifications.
After generating designs in Google Stitch, extract tokens to `docs/design/design-tokens.md`
and component specifications to `docs/design/components.md`.*
