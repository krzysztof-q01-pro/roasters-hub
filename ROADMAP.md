# Roadmap

Framework: **Now / Next / Later** — nie sprinty. Maksymalnie 5 zadań w NOW.

Kanon stanu zadań: ten plik. Aktualizuj po każdej sesji (agent lub developer).

**Assignees:** `(@MN)` Marek Nadra · `(@KK)` Krzysztof Kuczkowski · `(@AGENT)` scheduled agent · `(@UNASSIGNED)` wolne do wzięcia
**Status:** `[IN PROGRESS]` · `[BLOCKED: reason]` — dodaj przed tagiem assignee

---

## NOW

### Code Review — (@MN)

- [x] [P1] **CR: Server Actions** — review `web/src/actions/*.ts` — walidacja Zod, error handling, revalidatePath, auth guards (@MN)
- [x] [P1] **CR: Auth & middleware** — review `web/src/middleware.ts` + `web/src/lib/auth.ts` — route protection, edge cases, Clerk best practices (@MN)
- [x] [P2] **CR: Prisma queries** — review wszystkich `db.*` wywołań — N+1, brakujące select/include, indeksy, error handling (@MN)
- [x] [P2] **CR: Komponenty UI (agent-generated)** — review kodu generowanego przez agenta — accessibility, semantyczny HTML, reużywalność (@MN)
- [x] [P2] **CR: Security audit** — env vars exposure, CSRF w Server Actions, upload validation, XSS w user content (@MN)

---

## NEXT

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
