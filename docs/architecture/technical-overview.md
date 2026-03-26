# Architektura techniczna — Roasters Hub

**Wersja:** 2.0
**Data:** 2026-03-26 (zmiana stack: Vercel Postgres + Clerk + Uploadthing)
**Status:** Zatwierdzony

---

## 1. Stack techniczny

### Decyzje ostateczne

| Warstwa | Technologia | Wersja | Uzasadnienie |
|---------|-------------|--------|--------------|
| Framework | **Next.js** (App Router) | **16.2.1** | SSR/SSG/ISR krytyczne dla SEO; fullstack w jednym repo |
| Język | **TypeScript** | 5.x | Type safety end-to-end; niezbędne przy Prisma |
| Styling | **Tailwind CSS** | **4** | Utility-first, szybki development, zero custom CSS |
| Komponenty | **shadcn/ui** | latest | Radix UI + Tailwind, kopiowalne, nie zależność |
| Baza danych | **PostgreSQL** via Vercel Postgres (Neon) | 16 | Managed, brak pauzowania, auto-inject env vars w Vercel |
| ORM | **Prisma** | **7.5** | Type-safe queries, migracje, Prisma Studio |
| Auth | **Clerk** (`@clerk/nextjs`) | — | Drop-in auth; magic link + Google OAuth; 30 min setup |
| Storage | **Uploadthing** (MVP) → Cloudflare R2 | — | Obrazy profili palarni; 2GB free (UT), 10GB free + $0 egress (R2) |
| Mapa | **Leaflet** + OpenStreetMap | 1.9.x | Darmowy, wystarczający dla MVP; react-leaflet wrapper |
| Hosting | **Vercel** | — | Zero-config CI/CD, edge network, darmowy tier |
| Email | **Resend** | — | Newsletter, powiadomienia transakcyjne |
| Płatności | **Stripe** | — | Featured tier (P2 — miesiąc 6) |
| Analytics | **Plausible** | — | Privacy-first, bez cookies, GDPR compliant |

### Co NIE jest w stacku (i dlaczego)

| Odrzucone | Powód odrzucenia |
|-----------|-----------------|
| tRPC | Overhead bez wyraźnej korzyści przy Server Actions w Next.js 16 |
| Supabase (DB+Auth+Storage) | Free tier pauzuje po 7 dniach braku ruchu — agent wstaje na śpiący DB; Auth setup w Next.js 16 App Router ~3 dni vs 30 min z Clerk |
| NextAuth.js / Auth.js | Clerk ma lepszą integrację z Next.js 16 App Router — drop-in `clerkMiddleware()` |
| Drizzle ORM | Prisma ma lepszą dokumentację i Prisma Studio przydatne przy seedingu |
| Mapbox | Płatny po 50K requests/mies.; Leaflet+OSM wystarczy dla MVP |
| Cloudinary | Uploadthing wystarczy dla MVP; Cloudflare R2 dla growth ($0 egress) |

---

## 2. Rendering strategy (SEO jest priorytetem)

| Typ strony | Strategia | Uzasadnienie |
|------------|-----------|--------------|
| Homepage | **SSG** | Statyczna, rebuild przy nowych palarniach |
| Katalog `/roasters` | **SSR** | Filtry dynamiczne w URL, świeże dane |
| Profil palarni `/roasters/[slug]` | **ISR** (revalidate: 3600) | SEO + świeże dane bez full SSR |
| SEO landing pages `/country/[country]` | **SSG** z `generateStaticParams` | Lista krajów znana z góry; rebuild przy nowych |
| Mapa `/map` | **SSR** + client hydration | Dane palarni z serwera, interaktywność na kliencie |
| Panel admina `/admin/*` | **SSR** | Auth required, nie musi być SEO |
| Dashboard palarni `/dashboard/*` | **SSR** | Auth required, dane per użytkownik |

**Zasada:** wszystkie publiczne strony muszą renderować się po stronie serwera (nie client-only) dla SEO.

---

## 3. Architektura systemu

```
┌─────────────────────────────────────────────────────────┐
│                        Vercel                            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Next.js App Router                  │   │
│  │                                                  │   │
│  │  Static (SSG)    Server (SSR/ISR)   Client       │   │
│  │  ─────────────   ──────────────     ──────────   │   │
│  │  /              /roasters           Map widget   │   │
│  │  /[country]     /roasters/[slug]    Filters      │   │
│  │  /[country]/    /admin/*            Search       │   │
│  │  [city]         /dashboard/*        Share btn    │   │
│  │                                                  │   │
│  │  Server Actions (mutations)                      │   │
│  │  ─────────────────────────                       │   │
│  │  createRoasterRegistration()                     │   │
│  │  verifyRoaster() / rejectRoaster()               │   │
│  │  updateRoasterProfile()                          │   │
│  │  trackProfileEvent()                             │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                               │
└──────────────────────────┼──────────────────────────────┘
                           │
              ┌──────────┼──────────┐
              │          │          │
    ┌─────────▼────┐ ┌──▼──────┐ ┌▼─────────────────┐
    │ Vercel       │ │  Clerk  │ │     Resend        │
    │ Postgres     │ │  (auth) │ │ (email/newsletter)│
    │ (Neon)       │ └─────────┘ └───────────────────┘
    │ + Prisma ORM │
    └──────────────┘
    ┌──────────────┐
    │ Uploadthing  │ (images — MVP)
    │ → R2         │ (images — growth)
    └──────────────┘
```

---

## 4. Środowiska

### Development (lokalny)

```bash
# .env.local
DATABASE_URL="postgresql://..."                       # Vercel Postgres (Neon) — pooled connection
DIRECT_URL="postgresql://..."                         # Vercel Postgres (Neon) — direct (dla migracji)
CLERK_SECRET_KEY="sk_test_..."                        # Clerk — server-side
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."       # Clerk — client-side
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
RESEND_API_KEY="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Staging (Vercel Preview)

- Vercel Preview Deployments — każdy PR dostaje osobny URL
- Ta sama Vercel Postgres (dev) — preview branches używają dev DB
- Clerk: osobna instancja test/development

### Production

```bash
# Vercel Environment Variables (produkcja)
DATABASE_URL="postgresql://..."                       # Vercel Postgres (prod) — pooled
DIRECT_URL="postgresql://..."                         # Vercel Postgres (prod) — direct
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
RESEND_API_KEY="..."
NEXT_PUBLIC_APP_URL="https://roastershub.com"
STRIPE_SECRET_KEY="..."                               # P2
STRIPE_WEBHOOK_SECRET="..."                            # P2
```

---

## 5. Auth flow

### Palarnia (roaster)

```
1. Rejestracja: formularz → Server Action createRoasterRegistration()
   → tworzy rekord Roaster (status: PENDING)
   → wysyła email do admina (Resend)

2. Admin weryfikuje i aktywuje profil (status: VERIFIED)
   → email do palarni: "Twój profil jest aktywny"

3. Palarnia chce zarządzać profilem:
   → klik "Claim your profile" → Clerk sign-in (magic link lub Google OAuth)
   → po login: sprawdzenie czy email pasuje do profilu palarni
   → UserProfile tworzony via Clerk webhook lub on-demand
   → dostęp do /dashboard/roaster

4. Powracające logowanie:
   → Clerk sign-in → auth() w Server Components sprawdza session
```

### Admin

```
1. Admin loguje się przez Clerk (email/hasło lub magic link)
2. Rola ADMIN ustawiona w Clerk publicMetadata + tabeli UserProfile
3. clerkMiddleware() sprawdza rolę → access /admin/*
```

### Kawiarnie i konsumenci

Brak kont w MVP — przeglądają bez rejestracji.

---

## 6. Bezpieczeństwo

| Aspekt | Implementacja |
|--------|--------------|
| SQL Injection | Niemożliwe — Prisma używa prepared statements |
| Auth | Clerk session + role-based access w middleware i Server Actions |
| Admin access | `clerkMiddleware()` sprawdza `publicMetadata.role === "ADMIN"` przed /admin/* |
| API rate limiting | Vercel Edge Middleware — limit per IP dla /api/track i /api/newsletter |
| Image upload | Walidacja rozmiaru (<5MB) i typu (jpg/png/webp) przed uploadem do Uploadthing |
| CSRF | Server Actions mają wbudowaną ochronę CSRF w Next.js |
| Dane osobowe | Plausible nie zbiera IP ani cookies; tracking tylko ipHash (SHA256) |

---

## 7. Performance targets

| Metryka | Target | Jak osiągnąć |
|---------|--------|--------------|
| LCP (Largest Contentful Paint) | < 2.5s | ISR + obrazy w Uploadthing CDN |
| CLS (Cumulative Layout Shift) | < 0.1 | Reservacja miejsca dla obrazów (width/height) |
| Rozmiar bundle (JS) | < 150KB initial | Server Components; lazy load mapy i filtrów |
| Katalog (lista palarni) | < 200ms TTFB | SSR + indeksy DB na country, status, featured |
| Profil palarni | < 100ms TTFB | ISR — cached, revalidate 1h |
| Mapa | < 3s do interaktywności | Lazy load Leaflet; render tylko visible viewport |

---

## 8. SEO strategy

### URL structure

```
/                                    # Homepage
/roasters                            # Pełny katalog
/roasters/[slug]                     # Profil palarni (np. /roasters/hard-beans-opole)
/map                                 # Mapa palarni
/roasters/country/[country]          # SEO: coffee roasters in Poland
/roasters/country/[country]/[city]   # SEO: coffee roasters in Kraków
/register                            # Rejestracja palarni
/admin                               # Panel admina (protected)
/dashboard                           # Dashboard palarni (protected)
```

### Slug generation

`slug` generowany z nazwy palarni: `Hard Beans` → `hard-beans` + lokalizacja jeśli konflikt: `hard-beans-opole`. Unikalny w DB (`@unique`).

### Meta tags per strona

| Strona | title | description |
|--------|-------|-------------|
| Profil palarni | `{name} — Specialty Coffee Roaster in {city}` | `{description[:160]}` |
| Kraj | `Specialty Coffee Roasters in {Country} — Roasters Hub` | `Discover {count} verified specialty coffee roasters in {Country}.` |
| Miasto | `Specialty Coffee Roasters in {City}, {Country}` | `Find specialty coffee roasters in {City}. Browse verified profiles.` |

### Sitemap

Automatyczny `/sitemap.xml` generowany przez Next.js z listy aktywnych palarni i landing pages.

---

## 9. CI/CD pipeline

```
Developer push → GitHub
    ↓
GitHub Actions:
  - TypeScript check (tsc --noEmit)
  - ESLint
  - Prisma schema validation
    ↓
Vercel Preview Deploy (na każdy PR)
    ↓
Code review + merge to main
    ↓
Vercel Production Deploy
    ↓
Prisma migrate deploy (automatycznie przed buildem)
```

**Prisma migrations:** `prisma migrate deploy` uruchamiane jako build step w Vercel (`prisma generate && prisma migrate deploy && next build`).
