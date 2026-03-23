# Roadmap

Framework: **Now / Next / Later** — nie sprinty. Maksymalnie 5 zadań w NOW.

Kanon stanu zadań: ten plik. Aktualizuj po każdej sesji (agent lub developer).

---

## NOW — Phase 0: Setup (przed jakimkolwiek backendem)

- [ ] [P0] Utwórz projekt Supabase (dev) → skopiuj credentials do `web/.env.local`
- [ ] [P0] Utwórz projekt Supabase (prod) → dodaj zmienne do Vercel
- [ ] [P0] Zweryfikuj że `prisma migrate dev` działa lokalnie
- [ ] [P0] Branch protection na `main` (no direct push) w GitHub
- [ ] [P0] GitHub Actions: `tsc --noEmit` + `eslint` na każdym PR

---

## NEXT — Phase 1: Core Backend (~2 tygodnie)

### Tydzień 1 — DB + Rejestracja
- [ ] [P1] Odkomentować `web/src/lib/db.ts` — Prisma singleton
- [ ] [P1] `prisma migrate dev --name init` — pierwsza migracja
- [ ] [P1] Stworzyć `web/src/types/actions.ts` — `ActionResult<T>` + `CreateRoasterSchema` (Zod)
- [ ] [P1] Stworzyć `web/src/lib/slug.ts` — obsługa kolizji (hard-beans → hard-beans-opole → hard-beans-opole-2)
- [ ] [P1] Stworzyć `web/src/actions/roaster.actions.ts` → `createRoasterRegistration`
- [ ] [P1] Podpiąć `register/page.tsx` handleSubmit do Server Action
- [ ] [P1] Stworzyć `web/prisma/seed.ts` — 12 mock roasters → DB
- [ ] [P1] Zastąpić importy mock-data Prisma queries na wszystkich stronach

### Tydzień 2 — Auth + Admin
- [ ] [P1] Stworzyć `web/src/lib/supabase.ts` — server client + browser client
- [ ] [P1] Zastąpić `web/src/middleware.ts` Basic Auth → Supabase session check
- [ ] [P1] Stworzyć `web/src/lib/auth.ts` — `requireAdmin()`, `requireRoasterOwner()`
- [ ] [P1] Stworzyć `web/src/actions/admin.actions.ts` → `verifyRoaster()`, `rejectRoaster()` + `revalidatePath()`
- [ ] [P1] Podpiąć admin panel UI do Server Actions
- [ ] [P1] Bootstrap admin user — ręcznie przez Prisma Studio (udokumentować w `web/README.md`)
- [ ] [P1] Seed 50-100 palarni z `docs/seed-roasters.md`
- [ ] [P1] Usunąć `AUTH_USER`/`AUTH_PASSWORD` z middleware

**Launch Go/No-Go** (wszystkie muszą być ✅ przed publicznym launchem):
- [ ] Formularz rejestracji zapisuje do Supabase
- [ ] Admin może zalogować się i zweryfikować palarnie
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
- [ ] Image upload — Supabase Storage, max 2000px, <5MB client-side
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

## DONE

- [x] Prisma schema — 6 modeli, wszystkie indeksy, relacje
- [x] Frontend MVP — homepage, catalog, profiles, map, register form, admin UI
- [x] Design system — Tailwind v4 + shadcn/ui
- [x] Architecture documentation — `docs/architecture/`
- [x] Market research + personas — `docs/research/`
- [x] UI/UX design — Google Stitch exports + design system
- [x] Deploy — Vercel (beanmap-web.vercel.app)
- [x] Repo reorganization — PROJECT_STATUS, ROADMAP, OVERVIEW, AGENTS.md, .env.example
