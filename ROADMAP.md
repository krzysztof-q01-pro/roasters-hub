# Roadmap

Framework: **Now / Next / Later** — nie sprinty. Maksymalnie 5 zadań w NOW.

Kanon stanu zadań: ten plik. Aktualizuj po każdej sesji (agent lub developer).

---

## NOW — Phase 0: Setup (przed jakimkolwiek backendem)

- [x] [P0] ✅ **Stack potwierdzony: Vercel Postgres + Clerk + Uploadthing** (2026-03-26)
  - DB: Vercel Postgres (Neon) — brak pauzowania, auto-inject env vars
  - Auth: Clerk — drop-in `@clerk/nextjs`, 30 min setup
  - Storage: Uploadthing (MVP) → Cloudflare R2 (growth)
  - Dokumentacja zaktualizowana w tym commicie
- [x] [P0] Utwórz Vercel Postgres (dev) → skopiuj `DATABASE_URL` + `DIRECT_URL` do `web/.env.local`
- [x] [P0] Utwórz konto Clerk → skopiuj `CLERK_SECRET_KEY` + `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` do `web/.env.local`
- [x] [P0] Zweryfikuj że `prisma migrate dev` działa lokalnie — migracja `init` zastosowana (6 tabel)
- [x] [P0] GitHub Actions: `tsc --noEmit` + `eslint` na każdym PR

---

## NEXT — Phase 1: Core Backend (~2 tygodnie)

### Tydzień 1 — DB + Rejestracja
- [x] [P1] Odkomentować `web/src/lib/db.ts` — Prisma singleton (export `db`)
- [x] [P1] `prisma migrate dev --name init` — pierwsza migracja (zrobione w Phase 0)
- [x] [P1] Stworzyć `web/src/types/actions.ts` — `ActionResult<T>` + `CreateRoasterSchema` (Zod)
- [ ] [P1] Stworzyć `web/src/lib/slug.ts` — obsługa kolizji (hard-beans → hard-beans-opole → hard-beans-opole-2)
- [ ] [P1] Stworzyć `web/src/actions/roaster.actions.ts` → `createRoasterRegistration`
- [ ] [P1] Podpiąć `register/page.tsx` handleSubmit do Server Action
- [ ] [P1] Stworzyć `web/prisma/seed.ts` — 12 mock roasters → DB
- [ ] [P1] Zastąpić importy mock-data Prisma queries na wszystkich stronach

### Tydzień 2 — Auth (Clerk) + Admin
- [ ] [P1] Konfiguracja `ClerkProvider` w layout.tsx + sign-in/sign-up routes (pakiet już zainstalowany)
- [ ] [P1] Zastąpić `web/src/middleware.ts` Basic Auth → `clerkMiddleware()` z route protection
- [ ] [P1] Stworzyć `web/src/lib/auth.ts` — `requireAdmin()`, `requireRoasterOwner()` (via Clerk `auth()`)
- [ ] [P1] Stworzyć `web/src/actions/admin.actions.ts` → `verifyRoaster()`, `rejectRoaster()` + `revalidatePath()`
- [ ] [P1] Podpiąć admin panel UI do Server Actions
- [ ] [P1] Bootstrap admin user — UserProfile w DB (po ręcznym ustawieniu roli w Clerk → patrz HUMAN ONLY)
- [ ] [P1] Seed 50-100 palarni z `docs/seed-roasters.md`
- [ ] [P1] Usunąć `AUTH_USER`/`AUTH_PASSWORD` z env vars

**Launch Go/No-Go** (wszystkie muszą być ✅ przed publicznym launchem):
- [ ] Formularz rejestracji zapisuje do Vercel Postgres
- [ ] Admin może zalogować się (Clerk) i zweryfikować palarnie
- [ ] Zweryfikowane palarnie widoczne w katalogu
- [ ] Basic HTTP Auth usunięty z middleware
- [ ] Min. 50 seed palarni ze statusem VERIFIED w DB
- [ ] Error monitoring skonfigurowany (choćby Vercel logs)
- [ ] `PROJECT_STATUS.md` aktualny

---

## LATER — Phase 2: Post-Launch (2-4 tygodnie po launchu)

- [ ] Email notifications — Resend (`createRoasterRegistration` + `verifyRoaster`)
- [ ] Roaster dashboard `/dashboard/roaster` — edycja profilu
- [ ] SEO landing pages `/roasters/country/[country]` — `generateStaticParams` z Prisma
- [ ] `trackEvent` Server Action — zapisuje `ProfileEvent` do DB
- [ ] Image upload — Uploadthing, max 2000px, <5MB client-side (→ Cloudflare R2 przy growth)
- [ ] Analytics — Plausible (jeden script tag)

**⚠️ Uwaga SEO:** `technical-overview.md` używa `/roasters/country/[country]`, `project-structure.md` używa `/country/[country]`. Zdecyduj PRZED budową.

## LATER — Phase 3: Growth (miesiąc 2-3)

- [ ] Featured tier + Stripe (webhook `/api/webhooks/stripe`, `setFeatured` action)
- [ ] Newsletter digest (Resend + `NewsletterSubscriber` — model już w schema)
- [ ] Café accounts (nowa rola UserRole, migracja)
- [ ] Reviews (nowy model, migracja)

## LATER — Phase 4: Scale (miesiąc 4+)

- [ ] API for partners (Route Handlers `/api/v1/`, API key auth)
- [ ] i18n (`next-intl`, znaczący refactor)
- [ ] Mobile (PWA first, potem React Native)

---

## 🧑 HUMAN ONLY — zadania wymagające człowieka (agent NIE wykonuje)

- [x] Dodaj env vars do Vercel (prod): DATABASE_URL, DIRECT_URL, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- [ ] Branch protection na `main` (no direct push) — GitHub Settings → Branches
- [ ] Ustawienie Clerk: Google OAuth provider — Clerk Dashboard → User & Authentication → Social connections
- [ ] Bootstrap admin user — Clerk Dashboard → ustawić `publicMetadata: { "role": "ADMIN" }`
- [ ] Domena produkcyjna — zakup + konfiguracja DNS w Vercel
- [ ] Stripe konto (Phase 3) — rejestracja + webhook secret
- [ ] Cold outreach do palarni — lista kontaktowa, maile, LinkedIn
- [ ] Decyzja SEO: URL pattern `/roasters/country/[country]` vs `/country/[country]`
- [ ] Założenie Remote Server — hosting dla scheduled agent (Claude Code remote triggers)

**⚠️ Agent: jeśli napotkasz zadanie z tej sekcji — zapisz w SESSION.md i przejdź do następnego.**

---

## DONE

- [x] Prisma schema — 6 modeli, wszystkie indeksy, relacje
- [x] Frontend MVP — homepage, catalog, profiles, map, register form, admin UI
- [x] Design system — Tailwind v4 + shadcn/ui
- [x] Architecture documentation — `docs/architecture/`
- [x] Market research + personas — `docs/research/`
- [x] UI/UX design — Google Stitch exports + design system
- [x] Deploy — Vercel (beanmap-web.vercel.app)
- [x] Repo reorganization — PROJECT_STATUS, ROADMAP, OVERVIEW, AGENTS.md, .env.example
- [x] Stack decision — Vercel Postgres + Clerk + Uploadthing (2026-03-26)
- [x] Scheduled agent config — settings.json, workflows/scheduled_run.md, CLAUDE.md entry point
- [x] Utwórz Vercel Postgres (dev) → skopiuj `DATABASE_URL` + `DIRECT_URL` do `web/.env.local`
- [x] Utwórz konto Clerk → skopiuj `CLERK_SECRET_KEY` + `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` do `web/.env.local`
- [x] Zweryfikuj że `prisma migrate dev` działa lokalnie — migracja `init` zastosowana (6 tabel)
- [x] GitHub Actions: `tsc --noEmit` + `eslint` na każdym PR
- [x] Odkomentować `web/src/lib/db.ts` — Prisma singleton (export `db`)
- [x] `prisma migrate dev --name init` — pierwsza migracja (zrobione w Phase 0)
