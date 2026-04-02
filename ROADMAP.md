# Roadmap

Framework: **Now / Next / Later** — nie sprinty. Maksymalnie 5 zadań w NOW.

Kanon stanu zadań: ten plik. Aktualizuj po każdej sesji (agent lub developer).

**Assignees:** `(@MN)` Marek Nadra · `(@KK)` Krzysztof Kuczkowski · `(@AGENT)` scheduled agent · `(@UNASSIGNED)` wolne do wzięcia
**Status:** `[IN PROGRESS]` · `[BLOCKED: reason]` — dodaj przed tagiem assignee

---

## NOW

### UX Consistency: Roasters ↔ Cafes — (@AGENT)

> **Session:** 2026-04-02 — Audit wykonał: Playwright MCP + kod review
> **Branch:** `feat/ux-consistency-cafes`

**HIGH Priority (krytyczne niespójności):**
- [x] [P1] **Header: Browse Cafes link** — dodać `/cafes` do nawigacji głównej (Header.tsx) — brak discovery dla kawiarni ✅
- [x] [P1] **/cafes: filtry i wyszukiwanie** — dodać filtry kraju, search, paginację — parzystość z `/roasters` ✅
- [ ] [P1] **/cafes: zdjęcia** — seed zdjęć dla kawiarni (obecnie tylko emoji ☕) — wymaga scrapera lub manualnej pracy
- [ ] [P1] **Cafe profile: "0 roasters"** — seed relacje CafeRoasterRelation — **kod gotowy** (`prisma/seed_cafe_roasters.ts`), wymaga ręcznego uruchomienia na bazie
- [x] [P1] **Cafe profile: SEO title** — napraw `<title>` z nazwą kawiarni (obecnie generic "Bean Map — Discover...") ✅

**MEDIUM Priority (ulepszenia):**
- [x] [P2] **Global search placeholder** — "Find a roaster..." → "Search roasters & cafes..." ✅
- [ ] [P2] **Homepage hero** — "Discover the world's specialty coffee roasters" → bardziej inclusive
- [ ] [P2] **Homepage stats** — dodać "X Cafes" do statystyk
- [ ] [P2] **Cafe profile: hero image** — dodać zdjęcie na górze profilu
- [ ] [P2] **Cafe profile: breadcrumbs** — Home › Cafes › [City] › Name
- [x] [P2] **Map page title** — "Coffee Roasters Map" → "Coffee Roasters & Cafes Map" ✅
- [x] [P2] **Map sidebar header** — "50 beans" → "50 roasters" ✅
- [ ] [P2] **Cafe description** — zamienić generic copy zECT na unikalne opisy

**LOW Priority (nice-to-have):**
- [ ] [P3] **Footer: Browse Cafes** — dodać link do stopki
- [ ] [P3] **Cafe verified badge** —badge weryfikacji jak przy roasters
- [ ] [P3] **Cafe amenities icons** — ikony dla Wi-Fi, Vegan, etc.
- [ ] [P3] **Register CTA** — "List Your Cafe" obok "List Your Roastery"
- [ ] [P3] **Social proof** — "X cafes serve this roaster" na profilu palarni
- [ ] [P3] **Cafe amenities filter** — filtr poamenities w katalogu

---

### Code Review — (@MN)

- [x] [P1] **CR: Server Actions** — review `web/src/actions/*.ts` — walidacja Zod, error handling, revalidatePath, auth guards (@MN)
- [x] [P1] **CR: Auth & middleware** — review `web/src/middleware.ts` + `web/src/lib/auth.ts` — route protection, edge cases, Clerk best practices (@MN)
- [x] [P2] **CR: Prisma queries** — review wszystkich `db.*` wywołań — N+1, brakujące select/include, indeksy, error handling (@MN)
- [x] [P2] **CR: Komponenty UI (agent-generated)** — review kodu generowanego przez agenta — accessibility, semantyczny HTML, reużywalność (@MN)
- [x] [P2] **CR: Security audit** — env vars exposure, CSRF w Server Actions, upload validation, XSS w user content (@MN)

---

## NEXT

### Cafe Seed — Manual Enrichment — (@MN)

- [ ] [P2] **Cafe addresses manual** — uzupełnienie adresów i coords dla 17 kawiarni (plik `.tmp/cafes_to_complete.json`), Google Maps lookup, aktualizacja SEED (~30min) (@MN)

### Cafe Profiles + Consumer Discovery — (@AGENT)

> **Spec:** `docs/superpowers/specs/2026-03-30-cafe-consumer-discovery-design.md`
> **Plan:** `docs/superpowers/plans/2026-03-30-cafe-consumer-discovery.md`
> **Wywołanie:** `/superpowers:subagent-driven-development docs/superpowers/plans/2026-03-30-cafe-consumer-discovery.md`

- [x] [P1] **DB: Cafe + CafeRoasterRelation** — Prisma schema (Cafe, CafeRoasterRelation models), extend Review z cafeId, extend UserProfile z cafeId, extend Roaster z servedAt, migracja (@MN)
- [x] [P1] **Actions: cafe CRUD + admin + relations** — createCafe, updateCafe, verifyCafe, rejectCafe, addCafeRoasterRelation, removeCafeRoasterRelation, extend review.actions dla kawiarni — z testami Vitest (@MN)
- [x] [P1] **UI: /cafes catalog + /cafes/[slug] profile** — CafeCard, CafeReviewForm, CafeReviewList, ISR 3600s (@MN)
- [x] [P1] **UI: /register/cafe wizard** — 3-step analogiczny do /register/roaster (@MN)
- [x] [P2] **UI: Admin /admin/cafes + extend /admin/reviews** — panel moderacji kawiarni, zakładka "Kawiarnie" w reviews (@MN)
- [x] [P2] **UI: /dashboard/cafe owner panel** — zarządzanie relacjami z palarniami, przeniesienie saved-roasters na /dashboard/saved-roasters (@MN)
- [x] [P2] **UI: Mapa + Roaster profile + Homepage** — piny kawiarni z toggle, sekcja "Gdzie wypić" na /roasters/[slug], CTA na homepage (@MN)

### Admin Dashboard — (@KK)

- [ ] [P1] **Admin: dashboard statystyk** — widok `/admin` z liczbą palarni (pending/verified/rejected), łączna liczba odsłon profili, ostatnie rejestracje (read-only monitoring) (@KK)
- [ ] [P2] **Admin: panel palarni** — lista wszystkich palarni z filtrem statusu, sortowanie po dacie, podgląd szczegółów (@KK)
- [ ] [P2] **Admin: logi aktywności** — ostatnie rejestracje, zmiany statusu, top profile (click-through) (@KK)

### Logotyp — (@KK)

- [ ] [P1] **Logotyp Bean Map** — projekt + implementacja SVG (wariant jasny / ciemny), podmiana placeholder w Header i favicon (@KK)

### Look & Feel — (@KK)

- [ ] [P2] **Typography: custom font pair** — dobór i implementacja (display + body), zastąpienie domyślnego system font (@KK)
- [ ] [P2] **UI polish: hover states + transitions** — spójne micro-animations na kartach, buttonach, nawigacji (@KK)
- [ ] [P3] **Dark mode** — Tailwind dark: variant, persystencja preferencji (localStorage + system pref) (@KK)

### SEO & Meta — (@MN)

- [ ] [P3] **CR: SEO & meta** — review `generateMetadata`, canonical URLs, structured data (JSON-LD), sitemap completeness (@MN)

### Testing — (@MN)

- [ ] [P2] **Coverage reporting** — `vitest --coverage` (v8 provider) + Codecov (free) → % pokrycia widoczny w każdym PR (~1h) (@MN)
- [ ] [P2] **Testy Server Actions** — integration testy dla `createRoaster`, `verifyRoaster`, `rejectRoaster` — mock Clerk + prawdziwa baza Neon (~4h) (@MN)
- [ ] [P3] **E2E Playwright** — implementacja specs na bazie `docs/testing/journeys/` (22 misji, 5 ról); środowisko: Vercel Preview URL; CI job na `push: main`; plan w `docs/testing/e2e/README.md` (@MN)
- [BLOCKED: wymaga Krzysztofa — GitHub integration w Neon Console (Settings → Integrations → GitHub → Add) lub płatnego Neon] **Neon Preview Branches** — izolowana baza per PR/preview deployment (@MN)

### Testing Documentation — (@UNASSIGNED)

- [ ] [P2] **Testing docs: Feature Matrix** — dodanie 14+ wpisów cafe w `docs/testing/README.md` Feature Visibility Matrix (@UNASSIGNED)
- [ ] [P2] **Testing docs: Journey 03 rewrite** — przepisanie `docs/testing/journeys/03-cafe.md` z 4 nowymi misjami (rejestracja, dashboard, relacje, saved roasters) (@UNASSIGNED)
- [ ] [P2] **Testing docs: Journey 01 extend** — dodanie misji D (katalog kawiarni), E (profil kawiarni), rozszerzenie C (map toggle) w `docs/testing/journeys/01-guest.md` (@UNASSIGNED)
- [ ] [P3] **Testing docs: Journey 02 extend** — dodanie misji C ("Gdzie wypić") w `docs/testing/journeys/02-roaster.md` (@UNASSIGNED)
- [ ] [P2] **Testing docs: Journey 04 extend** — dodanie misji D (weryfikacja kawiarni), E (odrzucenie kawiarni), rozszerzenie C (cafe reviews tab) w `docs/testing/journeys/04-admin.md` (@UNASSIGNED)
- [ ] [P3] **Testing docs: Journey 05 extend** — dodanie misji B (recenzja kawiarni) w `docs/testing/journeys/05-reviewer.md` (@UNASSIGNED)
- [ ] [P2] **Testing docs: E2E README** — aktualizacja mapy specs o cafe-registration, cafe-dashboard, admin-cafes, guest-cafes, cafe-review w `docs/testing/e2e/README.md` (@UNASSIGNED)
- [ ] [P3] **Testing docs: E2E skeletons** — szkielety speców: `cafe-registration.spec.ts`, `admin-cafes.spec.ts`, `guest-cafes.spec.ts`, `cafe-review.spec.ts` w `docs/testing/e2e/` (@UNASSIGNED)

---

## LATER — Phase 3: Growth (miesiąc 2-3)

- [ ] Featured tier + Stripe (webhook `/api/webhooks/stripe`, `setFeatured` action) (@UNASSIGNED)

## LATER — Phase 4: Scale (miesiąc 4+)

- [ ] i18n (`next-intl`, znaczący refactor) (@UNASSIGNED)

---

## 🧑 HUMAN ONLY — zadania wymagające człowieka (agent NIE wykonuje)

- [ ] Branch protection na `main` (no direct push) — GitHub Settings → Branches (@MN)
- [ ] Domena produkcyjna — zakup + konfiguracja DNS w Vercel (@MN)
- [ ] Stripe konto (Phase 3) — rejestracja + webhook secret (@UNASSIGNED)
- [ ] Cold outreach do palarni — lista kontaktowa, maile, LinkedIn (@UNASSIGNED)
- [ ] Założenie Remote Server — hosting dla scheduled agent (Claude Code remote triggers) (@MN)

**⚠️ Agent: jeśli napotkasz zadanie z tej sekcji — zapisz w SESSION.md i przejdź do następnego.**

---

## DONE

- [x] Prisma schema — 9 modeli (+ Review, SavedRoaster, ApiKey), wszystkie indeksy, relacje
- [x] Frontend MVP — homepage, catalog, profiles, map, register form, admin UI
- [x] Design system — Tailwind v4 + shadcn/ui
- [x] Architecture documentation — `docs/architecture/`
- [x] Market research + personas — `docs/research/`
- [x] UI/UX design — Google Stitch exports + design system
- [x] Deploy — Vercel (beanmap-web.vercel.app)
- [x] Repo reorganization — PROJECT_STATUS, ROADMAP, OVERVIEW, AGENTS.md, .env.example
- [x] Stack decision — Vercel Postgres + Clerk + Uploadthing (2026-03-26)
- [x] Scheduled agent config — settings.json, workflows/scheduled_run.md, CLAUDE.md entry point
- [x] Vercel Postgres provisioned + env vars
- [x] Clerk auth configured + Google OAuth
- [x] Prisma migrations (init + reviews + cafe + api_keys)
- [x] Prisma singleton (`db`) + Neon adapter
- [x] ClerkProvider + sign-in/sign-up routes
- [x] clerkMiddleware — route protection
- [x] Auth helpers — requireAdmin, requireRoasterOwner
- [x] Server Actions — createRoasterRegistration, verifyRoaster, rejectRoaster
- [x] Admin panel connected to Server Actions
- [x] Bootstrap admin user
- [x] Seed 50 palarni (PL+DE+DK+SE+NL+FR+CZ+UK+US+CA+AU+JP+ET+KE+BR)
- [x] Removed Basic HTTP Auth
- [x] GitHub Actions CI (tsc + eslint)
- [x] Homepage ISR + Prisma queries
- [x] Catalog `/roasters` — ISR, filters, search, pagination
- [x] Roaster profiles `/roasters/[slug]` — ISR, related roasters
- [x] Interactive map `/map` — ISR, Leaflet, markers
- [x] Registration form → Server Action (PENDING roaster)
- [x] Profile event tracking (PAGE_VIEW, WEBSITE_CLICK, etc.)
- [x] SEO country pages `/roasters/country/[country]`
- [x] Roaster dashboard `/dashboard/roaster` — profile editing, analytics
- [x] Email notifications — Resend (registration, verify, reject)
- [x] Reviews — submit, approve/reject moderation, display on profiles
- [x] Cafe accounts — CAFE role, save/unsave roasters
- [x] Partner API — `GET /api/v1/roasters`, ApiKey auth
- [x] Newsletter digest — `POST /api/newsletter/digest`
- [x] PWA — manifest.json, apple-web-app meta
- [x] Image upload — Uploadthing, dashboard dropzone
- [x] Analytics — Plausible script tag
- [x] Versioning — package.json version in footer
- [x] Map mobile sidebar — floating toggle + slide-in drawer
- [x] Roaster filters mobile — collapsible toggle
- [x] Sign-in page — Header + layout wrapper
- [x] ImageWithFallback — graceful degradation for broken images
- [x] Homepage stats — dynamic from DB
- [x] Map `<h1>` SEO — sr-only
- [x] Register `<title>` + `<h1>` SEO
- [x] Homepage stat "Verified Profiles" — fixed number display
- [x] Broken images — fixed URLs in DB + seed.ts
- [x] Breadcrumb separator unified
- [x] Footer links — replaced placeholder hrefs
- [x] Map `<title>` — "Coffee Roasters Map | Bean Map"
- [x] Hero mobile — central image
- [x] Empty state at 0 filter results
- [x] Tablet roasters sidebar collapsible
- [x] Env vars added to Vercel (prod)
- [x] Google OAuth in Clerk
- [x] SEO URL decision: `/roasters/country/[country]`
