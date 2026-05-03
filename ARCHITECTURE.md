# BeanMap.pl — Technical Architecture Audit

**Date:** 2026-05-03  
**Author:** CTO  
**Status:** As-is audit of current platform  
**Repo:** `github.com/CorpoAI/ai-website-factory` (workspace `54e24ff3`)  
**Live site:** beanmap.pl (private beta, password: beantest)

---

## 1. Executive Summary

The current codebase is an **AI Website Factory** — a multi-tenant template system for rapidly deploying small-business websites (construction companies, restaurants) targeting the German market. It has **NOT** been adapted for BeanMap.pl's actual mission (connecting specialty coffee roasteries, cafes, and coffee lovers in Poland).

The platform is at an advanced prototype stage for its original purpose but requires significant rework to become the coffee-discovery product described in the company vision. The existing infrastructure (Next.js + Sanity + Vercel) is sound and can serve as the foundation, but the data model, components, and user-facing features must be rebuilt.

---

## 2. Current Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Framework** | Next.js (App Router) | 14.2.5 | Server components, dynamic routes |
| **Language** | TypeScript | 5.9.3 | Strict mode enabled |
| **Styling** | Tailwind CSS | 3.4.1 | Warm amber/stone color palette |
| **CMS** | Sanity.io | 3.29.0 | Headless, embedded studio at `/studio` |
| **Sanity client** | next-sanity | 7.0.0 | GROQ queries, CDN disabled |
| **State** | None (server-only) | — | No React state management |
| **Testing** | Vitest + React Testing Library | 4.1.4 | Only 2 test files, minimal coverage |
| **E2E Testing** | Playwright | 1.59.1 | Installed but no test files |
| **Linting** | ESLint (next/core-web-vitals) | 8 | Configured |
| **CI/CD** | GitHub Actions | — | Build-only (no test step) |
| **Hosting** | Vercel | — | Configured in `vercel.json` |
| **Build** | Static export attempted | — | `out/` dir exists; `next build --no-lint` |

### Key Dependencies

```
Production:
  next: 14.2.5
  react: 18.3.1
  next-sanity: 7.0.0
  @sanity/client: 6.24.1
  sanity: 3.29.0
  styled-components: 6.4.0 (Sanity dependency)

Dev:
  vitest: 4.1.4
  @testing-library/react: 16.3.2
  playwright: 1.59.1
  typescript: 5.9.3
```

---

## 3. File Structure

```
/src
  /app
    layout.tsx              # Root layout (hardcoded German metadata)
    page.tsx                 # Home page (section renderer + static fallback)
    globals.css              # Tailwind directives
    /[slug]/page.tsx         # Dynamic page from Sanity
    # NOTE: No /api routes, no /studio route file (Sanity Studio config only)
  /components               # 11 UI components (863 total lines)
    Hero.tsx                 # 57 lines — full-screen hero with CTA
    About.tsx                # 40 lines
    FAQ.tsx                  # 61 lines
    CTA.tsx                  # 34 lines
    Footer.tsx               # 75 lines — hardcoded German content
    Gallery.tsx              # 36 lines — minimal
    Reviews.tsx               # 89 lines — testimonials display
    OpeningHours.tsx         # 98 lines — restaurant hours table
    Reservation.tsx          # 144 lines — reservation form UI (no backend)
    Speisekarte.tsx          # 185 lines — menu display (German)
    Seo.tsx                  # 44 lines — meta tag component
  /lib
    sanity.ts               # Sanity client config + query helpers
  /config
    site.ts                  # Hardcoded German site config
  /sanity
    sanity.config.ts         # Studio config (basePath: /studio)
    /schemas (14 files)
      index.ts, page.ts, siteSettings.ts, seo.ts
      hero.ts, about.ts, services.ts, testimonials.ts
      faq.ts, contact.ts, cta.ts, post.ts
      gallery.ts, contactSubmission.ts
  /templates
    /construction/           # German construction template defaults
    /restaurant/             # German restaurant template defaults
  /types
    sanity.ts                # TypeScript interfaces for CMS data
  /__tests__
    components.test.ts       # 1 test
    Hero.test.tsx            # 1 test
    setup.ts                 # Vitest setup

/docs (11 files)
  architecture-proposal.md, cor-16-product-analysis.md
  deployment-guide.md, deployment-status.md
  implementation-plan.md, operator-runbook.md
  ph1-completion.md, product-model.md
  sanity-content-model.md, system-overview.md
  technical-infrastructure.md

/scripts
  seed.js                   # Seeds Sanity with template data
  setup-client.js           # Interactive client onboarding
```

**Total source files:** 37 TS/TSX/JS files  
**Total source lines:** ~1,919

---

## 4. Data Model

### Sanity Schemas (13 content types)

#### Document Types (persisted independently)
| Schema | Purpose | Fields |
|--------|---------|--------|
| `page` | Page with sections array | title, slug, sections[], seo |
| `siteSettings` | Global site config | title, logo, contactEmail, contactPhone, address, socialLinks[], defaultSeo |
| `post` | Blog post | title, slug, publishedAt, excerpt, mainImage, body[], author, categories[] |
| `contactSubmission` | Contact form data | name, email, phone, message, createdAt |

#### Object Types (embedded in page sections)
| Schema | Purpose | Fields |
|--------|---------|--------|
| `hero` | Hero section | title, subtitle, ctaText, ctaLink, backgroundImage |
| `about` | About section | title, content |
| `services` | Services listing | title, items[]{title, description, icon} |
| `testimonials` | Customer reviews | title, items[]{name, role, text, photo} |
| `faq` | FAQ section | title, items[]{question, answer} |
| `contact` | Contact info | title, subtitle, email, phone, address |
| `cta` | Call to action | title, subtitle, buttonText, buttonLink |
| `gallery` | Image gallery | title, images[]{image, alt, caption} |
| `seo` | SEO metadata | metaTitle, metaDescription, ogImage |

### Key GROQ Queries

```typescript
getPage(slug)        // *[_type == "page" && slug.current == $slug][0]
getSiteSettings()     // *[_type == "siteSettings"][0]
getAllPages()         // *[_type == "page"]{ "slug": slug.current, title }
getPosts()            // *[_type == "post"] | order(publishedAt desc)
getPost(slug)         // *[_type == "post" && slug.current == $slug][0]
```

### Data Flow

```
Sanity CMS → GROQ queries → Server Components → Rendered HTML
                                    ↓
                              Static fallback (hardcoded German defaults)
```

Pages are rendered server-side by fetching from Sanity at request time (`useCdn: false`). If Sanity returns null, the home page renders with hardcoded German restaurant defaults. There is **no ISR, no SSG, no caching layer**.

---

## 5. API Design & Auth

### Current State

| Aspect | Status | Detail |
|--------|--------|--------|
| **API routes** | None | No `/api` directory exists |
| **Contact form backend** | Referenced but missing | `contactSubmission` schema exists; `ph1-completion.md` mentions `/api/contact/route.ts` — **file does NOT exist in current tree** |
| **Authentication** | None | No auth system at all |
| **Authorization** | None | No role-based access |
| **Sanity auth** | Token-based | `SANITY_API_TOKEN` env var for write ops; Studio uses Sanity's own auth |
| **Rate limiting** | None | No protection on any endpoint |

### What Needs Building

- User authentication (roasteries, cafes, coffee lovers)
- API routes for search, discovery, reviews, favorites
- Authorization across user roles
- Rate limiting and abuse protection
- Session management

---

## 6. CI/CD & Deployment Pipeline

### Current State

```yaml
# .github/workflows/ci.yml
- Triggers: push/PR to main
- Steps: checkout → setup Node 20 → npm ci → npm run build
- Missing: lint, test, type-check, preview deploy
```

### Issues

1. **CI skips lint and tests** — `build` runs with `--no-lint` flag
2. **No preview deployments** configured
3. **No test execution** in CI pipeline
4. **No type-checking** step
5. **Deploy key** committed in repo (`deploy_key` + `deploy_key.pub`) — **SECURITY ISSUE**
6. **Vercel config** is present but deployment is manual

### Deployment

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

The site is currently live at `beanmap.pl` but the deployment mechanism from this workspace to Vercel is unclear. The `out/` directory suggests an earlier attempt at static export that was abandoned.

---

## 7. Technical Debt & Issues

### Critical

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| 1 | **Product mismatch** — codebase is a German restaurant/construction website factory, not a Polish coffee discovery platform | Must rebuild core features | Large |
| 2 | **No authentication** — no user accounts, login, or registration | Blocks all community features | Large |
| 3 | **No API routes** — no backend API beyond Sanity queries | Blocks search, reviews, favorites | Large |
| 4 | **Deploy key in repo** — `deploy_key` (private key) committed to git | Security breach risk | Small |
| 5 | **`SANITY_API_TOKEN` referenced** — write token used client-side in seed scripts | Potential credential exposure | Small |
| 6 | **Hardcoded German content** — components, fallbacks, metadata all in German | Unusable for Polish market | Medium |

### High

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| 7 | **No ISR/caching** — every request hits Sanity directly | Slow pages, high API usage | Medium |
| 8 | **No error boundaries** — Sanity failure = blank page or fallback only on home | Poor UX on failure | Small |
| 9 | **No `notFound()` handling** — dynamic pages show inline 404 div, not proper 404 response | SEO and UX issue | Small |
| 10 | **`useCdn: false`** — Sanity client always hits API directly | Wastes API quota | Small |
| 11 | **Mixed schema export styles** — some schemas use `defineType`/`defineField`, others use raw objects | Inconsistent, harder to maintain | Small |
| 12 | **No 404 page** — missing `not-found.tsx` | Poor UX for invalid routes | Small |
| 13 | **No loading states** — no Suspense boundaries or loading UI | Perceived slowness | Medium |

### Medium

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| 14 | **Test coverage ~0%** — 2 trivial test files, no meaningful assertions | Regressions undetected | Medium |
| 15 | **CI doesn't run lint or tests** — only builds | Quality gate absent | Small |
| 16 | **No `next/image` usage** — components use raw `<img>` tags (ESLint warns) | No image optimization | Medium |
| 17 | **No blog listing page** — `post` schema exists but no `/blog` route | Features incomplete | Medium |
| 18 | **No contact form API route** — schema exists, UI missing, API missing | Contact form doesn't work | Small |
| 19 | **`styled-components` dependency** — pulled in by Sanity Studio only, adds bundle size | Performance | Small |
| 20 | **No environment validation** — missing env vars silently default to `'demo'` | Hard to debug config issues | Small |

### Low

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| 21 | **`any` types throughout** — ` SECTION_COMPONENTS` uses `React.ComponentType<any>`, page sections cast as `any` | Type safety gaps | Small |
| 22 | **No `generateStaticParams`** — no SSG of known pages | Missed performance optimization | Small |
| 23 | **No sitemap/robots.txt** | SEO gap | Small |
| 24 | **No analytics integration** | No visitor insights | Small |
| 25 | **Template defaults in `/src/templates`** — referenced but not imported or used dynamically | Dead code or incomplete feature | Small |

---

## 8. Architecture Assessment for BeanMap.pl

### What's Reusable

| Component | Reusability | Notes |
|-----------|-------------|-------|
| Next.js + App Router setup | **High** | Solid foundation |
| Tailwind config | **Medium** | Colors need rebrand from amber/stone to coffee-appropriate palette |
| Sanity client integration | **High** | Well-structured, needs schema changes |
| Component pattern (props + defaults) | **Medium** | Pattern is good; specific components need replacing |
| Dynamic page routing (`/[slug]`) | **High** | Works well |
| Seed script approach | **Medium** | Useful pattern for initial data |
| Deployment/Vercel config | **High** | Ready to use |

### What Must Be Rebuilt

| Area | Why |
|------|-----|
| **Data model** | Current schemas (restaurant menu, construction services) are irrelevant to coffee discovery |
| **Components** | Speisekarte, OpeningHours, Reservation are restaurant-specific |
| **Site config** | Hardcoded German defaults, no i18n for Polish |
| **Auth system** | Entirely missing; needed for roasteries, cafes, and users |
| **API layer** | No search, geolocation, reviews, favorites, or user-generated content |
| **Layout & metadata** | Hardcoded German SEO, wrong business name/domain |
| **Homepage** | Static fallback shows "Zum goldenen Hirschen" restaurant |

---

## 9. 90-Day Technical Roadmap

### Phase 1: Foundation & Rebrand (Days 1–14)

**Goal:** Transform the codebase from a German website factory into the BeanMap.pl platform skeleton.

| Task | Priority | Effort | Depends on |
|------|----------|--------|------------|
| Remove deploy keys from repo and rotate credentials | Critical | 0.5 day | — |
| Add `.env.validation.ts` or runtime env checks | High | 0.5 day | — |
| Rebrand Tailwind palette (coffee tones, Polish locale) | High | 1 day | — |
| Replace component defaults (Polish, coffee context) | High | 2 days | — |
| Update root layout metadata for BeanMap.pl | High | 0.5 day | — |
| Create BeanMap data model in Sanity (roastery, cafe, user) | Critical | 3 days | — |
| Remove restaurant/construction-specific schemas | High | 1 day | New schemas |
| Build core BeanMap components (cafe card, roastery listing, map placeholder) | High | 3 days | New schemas |
| Add 404 page and error boundaries | Medium | 1 day | — |
| Fix CI pipeline: add lint + type-check + test steps | High | 1 day | — |

### Phase 2: Authentication & User System (Days 15–30)

**Goal:** Enable roasteries, cafes, and coffee lovers to create accounts and manage profiles.

| Task | Priority | Effort | Depends on |
|------|----------|--------|------------|
| Choose & implement auth solution (NextAuth.js / Clerk / Supabase Auth) | Critical | 3 days | — |
| User model: roles (roastery_owner, cafe_owner, coffee_lover) | Critical | 2 days | Auth |
| Registration & login flows | Critical | 2 days | Auth + User model |
| Roastery profile CRUD (owner can create/edit their roastery) | High | 3 days | Auth + Roastery schema |
| Cafe profile CRUD (owner can create/edit their cafe) | High | 3 days | Auth + Cafe schema |
| Basic search API (name, city, specialty) | High | 2 days | New schemas |
| Contact form API route (fix missing backend) | Medium | 0.5 day | — |

### Phase 3: Discovery & Community (Days 31–60)

**Goal:** Enable coffee discovery, reviews, and the core value proposition.

| Task | Priority | Effort | Depends on |
|------|----------|--------|------------|
| Map integration (Leaflet/MapBox — lightweight, free tier) | High | 3 days | Cafe/roastery geodata |
| Search & filter (by city, roast level, brewing method) | High | 3 days | Data model |
| Review & rating system (coffee lovers review cafes) | High | 3 days | Auth + Cafe schema |
| Favorites / bookmarking | Medium | 2 days | Auth |
| Cafe detail page with full profile | High | 2 days | Cafe schema |
| Roastery detail page with full profile | High | 2 days | Roastery schema |
| ISR / revalidation for Sanity content | Medium | 1 day | — |
| Polish language i18n (next-intl or similar) | Medium | 3 days | — |
| Image optimization (`next/image` migration) | Medium | 1 day | — |
| Sitemap & robots.txt | Low | 0.5 day | — |

### Phase 4: Polish & Launch Prep (Days 61–90)

**Goal:** Production-ready platform ready for public launch.

| Task | Priority | Effort | Depends on |
|------|----------|--------|------------|
| SEO meta tags per page (using Seo component + Sanity data) | High | 2 days | — |
| Performance audit (Core Web Vitals) | High | 2 days | — |
| Analytics integration (Plausible/PostHog — privacy-friendly) | Medium | 1 day | — |
| Rate limiting & security middleware | High | 1 day | — |
| E2E test suite (Playwright, critical paths) | Medium | 3 days | Auth + search |
| Increase unit test coverage to 60%+ | Medium | 3 days | Stable component set |
| Admin dashboard for content moderation | Medium | 3 days | Auth + Review system |
| Email notifications (new reviews, account setup) | Low | 2 days | — |
| Production deployment & domain configuration on Vercel | High | 1 day | — |
| Documentation update (operator runbook for BeanMap) | Medium | 1 day | — |
| Load testing & performance tuning | Medium | 1 day | — |

---

## 10. Recommended Immediate Actions

1. **Rotate and remove the committed deploy key** — this is a live security risk
2. **Define the BeanMap data model** — roastery, cafe, coffee, user, review schemas in Sanity
3. **Choose an auth provider** — recommend NextAuth.js (self-hosted, free) or Clerk (managed, faster setup)
4. **Rebrand the codebase** — remove German restaurant content, update Tailwind theme to coffee-appropriate palette, set Polish locale
5. **Fix the CI pipeline** — add lint, type-check, and test steps; stop building with `--no-lint`

---

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Data model redesign requires full content re-entry | High | Medium | Keep migration path; seed script for initial data |
| Auth choice is hard to change later | High | High | Evaluate NextAuth.js vs Clerk before Day 15; pick one and commit |
| Vercel free tier limits | Low | Medium | Monitor usage; consider Cloudflare Pages as alternative |
| Sanity API quota exceeded during dev | Medium | High | Enable CDN mode for reads; add revalidation |
| Scope creep from factory features | Medium | Medium | Remove restaurant/construction templates entirely; clean slate |
| No domain-specific expertise (coffee) | Low | Medium | Partner with CEO/market experts for roastery/cafe schema design |