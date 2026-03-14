# Struktura projektu — Roasters Hub

**Wersja:** 1.0
**Data:** 2026-03-14
**Framework:** Next.js 15 (App Router)

---

## 1. Pełna struktura katalogów

```
roasters-hub/                          # Korzeń repo (git)
│
├── src/                               # Cały kod aplikacji
│   ├── app/                           # Next.js App Router — strony i layouty
│   │   ├── layout.tsx                 # Root layout (HTML, fonts, providers)
│   │   ├── page.tsx                   # Homepage (SSG)
│   │   ├── not-found.tsx              # Strona 404
│   │   ├── sitemap.ts                 # Dynamiczny sitemap.xml
│   │   ├── robots.ts                  # robots.txt
│   │   │
│   │   ├── roasters/                  # Katalog i profile palarni
│   │   │   ├── page.tsx               # /roasters — lista z filtrami (SSR)
│   │   │   ├── loading.tsx            # Skeleton loading
│   │   │   └── [slug]/
│   │   │       ├── page.tsx           # /roasters/[slug] — profil (ISR)
│   │   │       └── opengraph-image.tsx # OG image per profil
│   │   │
│   │   ├── map/
│   │   │   └── page.tsx               # /map — mapa palarni (SSR + client)
│   │   │
│   │   ├── country/                   # SEO landing pages
│   │   │   └── [country]/
│   │   │       ├── page.tsx           # /country/poland — roasters in Poland
│   │   │       └── [city]/
│   │   │           └── page.tsx       # /country/poland/krakow
│   │   │
│   │   ├── register/
│   │   │   └── page.tsx               # /register — formularz rejestracji palarni
│   │   │
│   │   ├── dashboard/                 # Panel palarni (protected)
│   │   │   ├── layout.tsx             # Dashboard layout z sidebar
│   │   │   ├── page.tsx               # /dashboard — przegląd
│   │   │   ├── profile/
│   │   │   │   └── page.tsx           # /dashboard/profile — edycja profilu
│   │   │   └── stats/
│   │   │       └── page.tsx           # /dashboard/stats — statystyki (P1)
│   │   │
│   │   ├── admin/                     # Panel admina (protected, rola ADMIN)
│   │   │   ├── layout.tsx             # Admin layout
│   │   │   ├── page.tsx               # /admin — dashboard admina
│   │   │   ├── pending/
│   │   │   │   └── page.tsx           # /admin/pending — kolejka weryfikacji
│   │   │   └── roasters/
│   │   │       └── [id]/
│   │   │           └── page.tsx       # /admin/roasters/[id] — edycja palarni
│   │   │
│   │   └── api/                       # Route Handlers
│   │       ├── roasters/
│   │       │   └── route.ts           # GET /api/roasters?format=map
│   │       └── webhooks/
│   │           └── stripe/
│   │               └── route.ts       # POST /api/webhooks/stripe (P2)
│   │
│   ├── components/                    # Komponenty React
│   │   ├── ui/                        # shadcn/ui components (kopiowane, nie edytować)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   │
│   │   ├── roasters/                  # Komponenty związane z palarniami
│   │   │   ├── RoasterCard.tsx        # Karta w katalogu (Server Component)
│   │   │   ├── RoasterCatalog.tsx     # Lista kart z paginacją
│   │   │   ├── RoasterFilters.tsx     # Filtry (Client Component — interaktywne)
│   │   │   ├── RoasterProfile.tsx     # Pełny profil palarni
│   │   │   ├── RoasterMap.tsx         # Mapa Leaflet (Client Component)
│   │   │   ├── RoasterImages.tsx      # Galeria zdjęć
│   │   │   ├── VerifiedBadge.tsx      # Badge "Verified Roaster"
│   │   │   ├── ShareButton.tsx        # "Share this roaster" (Client Component)
│   │   │   └── CertificationBadge.tsx # Ikonka certyfikatu
│   │   │
│   │   ├── admin/                     # Komponenty panelu admina
│   │   │   ├── PendingQueue.tsx       # Lista oczekujących weryfikacji
│   │   │   ├── RoasterEditor.tsx      # Formularz edycji palarni
│   │   │   └── VerifyActions.tsx      # Przyciski weryfikuj/odrzuć
│   │   │
│   │   ├── dashboard/                 # Komponenty dashboardu palarni
│   │   │   ├── ProfileForm.tsx        # Formularz edycji profilu
│   │   │   ├── ImageUpload.tsx        # Upload zdjęć
│   │   │   └── StatsWidget.tsx        # Widget statystyk (P1)
│   │   │
│   │   └── shared/                    # Komponenty współdzielone
│   │       ├── Header.tsx             # Główna nawigacja
│   │       ├── Footer.tsx             # Stopka
│   │       ├── NewsletterForm.tsx     # Formularz zapisu do newslettera
│   │       ├── CountryFlag.tsx        # Flaga kraju (emoji + label)
│   │       └── LoadingSpinner.tsx
│   │
│   ├── actions/                       # Server Actions
│   │   ├── roaster.actions.ts         # CRUD palarni
│   │   ├── admin.actions.ts           # Weryfikacja, admin ops
│   │   ├── track.actions.ts           # Analytics events
│   │   └── newsletter.actions.ts      # Newsletter
│   │
│   ├── lib/                           # Utilitki i konfiguracja
│   │   ├── db.ts                      # Prisma client (singleton)
│   │   ├── supabase.ts                # Supabase client (server + client)
│   │   ├── auth.ts                    # Auth helpers (requireAdmin, etc.)
│   │   ├── slug.ts                    # Generowanie slugów
│   │   ├── geocode.ts                 # Geocoding (dla seed scriptu)
│   │   └── utils.ts                   # cn(), formatDate(), etc.
│   │
│   ├── types/                         # TypeScript typy
│   │   ├── index.ts                   # Re-eksport wszystkich typów
│   │   ├── actions.ts                 # ActionResult<T>
│   │   ├── certifications.ts          # CERTIFICATIONS const + type
│   │   └── database.ts                # Typy Prisma + custom
│   │
│   ├── hooks/                         # React hooks (Client Components)
│   │   ├── useRoasterFilters.ts       # Stan filtrów (URL params)
│   │   └── useMapData.ts              # Fetch danych dla mapy
│   │
│   └── middleware.ts                  # Auth middleware (ochrona /admin, /dashboard)
│
├── prisma/
│   ├── schema.prisma                  # Definicja schematu (source of truth)
│   ├── migrations/                    # Historia migracji (auto-generowana)
│   └── seed.ts                        # Seed script (import z docs/seed-roasters.md)
│
├── public/                            # Statyczne assety
│   ├── logo.svg
│   ├── og-default.png                 # Domyślny OG image
│   └── icons/
│       └── certifications/            # Ikony certyfikatów
│
├── docs/                              # Dokumentacja projektu
│   ├── concept.md
│   ├── prd.md
│   ├── seed-roasters.md
│   ├── architecture/
│   │   ├── technical-overview.md
│   │   ├── database-schema.md
│   │   ├── api-design.md
│   │   └── project-structure.md       # Ten plik
│   ├── stories/
│   └── research/
│
├── workflows/                         # WAT Framework SOPs
├── tools/                             # WAT Framework scripts
│
├── .env.local                         # Lokalne zmienne (gitignored)
├── .env.example                       # Template zmiennych środowiskowych
├── next.config.ts                     # Konfiguracja Next.js
├── tailwind.config.ts                 # Konfiguracja Tailwind
├── tsconfig.json                      # Konfiguracja TypeScript
├── components.json                    # Konfiguracja shadcn/ui
├── .eslintrc.json                     # ESLint
├── .prettierrc                        # Prettier
├── package.json
└── CLAUDE.md                          # Instrukcje dla Claude Code (WAT framework)
```

---

## 2. Konwencje nazewnictwa

### Pliki i katalogi

| Typ | Konwencja | Przykład |
|-----|-----------|---------|
| Strony (app/) | `page.tsx`, `layout.tsx` | `app/roasters/page.tsx` |
| Komponenty | `PascalCase.tsx` | `RoasterCard.tsx` |
| Server Actions | `camelCase.actions.ts` | `roaster.actions.ts` |
| Utilitki | `camelCase.ts` | `slug.ts` |
| Typy | `camelCase.ts` | `certifications.ts` |
| Hooki | `usePascalCase.ts` | `useRoasterFilters.ts` |
| Katalogi komponentów | `kebab-case/` lub `camelCase/` | `roasters/` |

### Komponenty — Server vs Client

```typescript
// Server Component (domyślne — bez dyrektywy)
// RoasterCard.tsx
export function RoasterCard({ roaster }: Props) { ... }

// Client Component (tylko gdy potrzeba interaktywności/hooks)
// RoasterFilters.tsx
"use client"
export function RoasterFilters({ ... }) { ... }
```

**Zasada:** Domyślnie Server Component. `"use client"` tylko gdy:
- `useState`, `useEffect`, `useRouter`
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, geolocation)
- Leaflet/biblioteki map

### Import paths (z `@/` alias)

```typescript
// Zawsze używaj @/ aliasu, nigdy relatywnych ścieżek przez kilka poziomów
import { prisma } from "@/lib/db"
import { RoasterCard } from "@/components/roasters/RoasterCard"
import type { ActionResult } from "@/types/actions"
```

---

## 3. Kluczowe pliki — co gdzie trafia

### `src/lib/db.ts` — Prisma singleton

```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
```

### `src/lib/supabase.ts` — Supabase clients

```typescript
// Server-side client (dla Server Components i Server Actions)
export function createServerSupabaseClient()

// Client-side client (dla Client Components)
export function createClientSupabaseClient()
```

### `src/middleware.ts` — ochrona tras

```typescript
// Chroni /admin/* → rola ADMIN
// Chroni /dashboard/* → zalogowany użytkownik
// Wszystkie inne → publiczne (brak middleware)
```

---

## 4. Routing — pełna mapa URL

| URL | Plik | Rendering | Opis |
|-----|------|-----------|------|
| `/` | `app/page.tsx` | SSG | Homepage |
| `/roasters` | `app/roasters/page.tsx` | SSR | Katalog z filtrami |
| `/roasters/[slug]` | `app/roasters/[slug]/page.tsx` | ISR 1h | Profil palarni |
| `/map` | `app/map/page.tsx` | SSR + CSR | Mapa palarni |
| `/country/[country]` | `app/country/[country]/page.tsx` | SSG | Palarnie w kraju |
| `/country/[country]/[city]` | `app/country/[country]/[city]/page.tsx` | SSG | Palarnie w mieście |
| `/register` | `app/register/page.tsx` | SSR | Rejestracja palarni |
| `/dashboard` | `app/dashboard/page.tsx` | SSR (auth) | Panel palarni |
| `/dashboard/profile` | `app/dashboard/profile/page.tsx` | SSR (auth) | Edycja profilu |
| `/admin` | `app/admin/page.tsx` | SSR (admin) | Panel admina |
| `/admin/pending` | `app/admin/pending/page.tsx` | SSR (admin) | Kolejka weryfikacji |
| `/admin/roasters/[id]` | `app/admin/roasters/[id]/page.tsx` | SSR (admin) | Edycja palarni |

---

## 5. Environment variables — pełna lista

```bash
# .env.example

# Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# App
NEXT_PUBLIC_APP_URL="https://roastershub.com"  # lub http://localhost:3000 lokalnie

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="hello@roastershub.com"

# Analytics (Plausible)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="roastershub.com"

# Stripe (P2 - Featured tier)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
```

---

## 6. Zasady dla Claude Code

Przy pracy na tym projekcie Claude Code powinien:

1. **Zawsze** używać `@/` aliasów importów (nie `../../`)
2. **Domyślnie** pisać Server Components (bez `"use client"`)
3. **Dodawać** `"use client"` tylko gdy komponent wymaga hooków lub event handlers
4. **Nie duplikować** logiki Prisma — queries w Server Components lub Server Actions, nigdy w Client Components
5. **Używać** `ActionResult<T>` jako typ zwracany przez wszystkie Server Actions
6. **Walidować** wejście przez Zod przed każdą mutacją w Server Actions
7. **Nie tworzyć** nowych plików w `components/ui/` — te są zarządzane przez shadcn CLI
8. **Umieszczać** nowe komponenty w odpowiednim podkatalogu (`roasters/`, `admin/`, `dashboard/`, `shared/`)
9. **Każda nowa tabela** → nowa migracja Prisma (`prisma migrate dev --name nazwa`)
10. **Testy** — nie są wymagane dla MVP; priorytet to szybkość iteracji
