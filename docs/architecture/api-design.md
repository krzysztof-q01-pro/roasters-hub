# Projekt API — Roasters Hub

**Wersja:** 1.0
**Data:** 2026-03-14
**Pattern:** Next.js 15 Server Actions + Route Handlers (gdzie potrzeba)

---

## 1. Filozofia

**Server Actions jako domyślny pattern** dla wszystkich mutacji (formularze, przyciski).
**Route Handlers** (`/api/*`) tylko tam gdzie Server Actions nie wystarczają:
- Webhooks (Stripe)
- Publiczne endpointy wywoływane spoza Next.js
- Operacje wymagające specjalnych nagłówków HTTP

Brak tRPC, brak osobnego backend API — wszystko w jednym Next.js repo.

---

## 2. Server Actions

Pliki w `src/actions/`. Każda akcja = eksportowana async function z dyrektywą `"use server"`.

### 2.1 `roaster.actions.ts` — rejestracja i zarządzanie profilem

```typescript
// src/actions/roaster.actions.ts
"use server"

// Rejestracja nowej palarni (publiczna — brak auth)
export async function createRoasterRegistration(
  formData: FormData
): Promise<ActionResult<{ slug: string }>>

// Aktualizacja profilu (wymaga auth — właściciel palarni)
export async function updateRoasterProfile(
  roasterId: string,
  data: UpdateRoasterInput
): Promise<ActionResult<Roaster>>

// Upload zdjęcia do profilu (wymaga auth)
export async function uploadRoasterImage(
  roasterId: string,
  formData: FormData
): Promise<ActionResult<{ url: string }>>

// Usunięcie zdjęcia (wymaga auth)
export async function deleteRoasterImage(
  imageId: string
): Promise<ActionResult<void>>

// Ustawienie głównego zdjęcia (wymaga auth)
export async function setPrimaryImage(
  roasterId: string,
  imageId: string
): Promise<ActionResult<void>>
```

### 2.2 `admin.actions.ts` — weryfikacja (wymaga roli ADMIN)

```typescript
// src/actions/admin.actions.ts
"use server"

// Weryfikacja palarni → status VERIFIED
export async function verifyRoaster(
  roasterId: string
): Promise<ActionResult<void>>

// Odrzucenie palarni → status REJECTED
export async function rejectRoaster(
  roasterId: string,
  reason: string
): Promise<ActionResult<void>>

// Dezaktywacja (np. palarnia zamknięta)
export async function deactivateRoaster(
  roasterId: string
): Promise<ActionResult<void>>

// Włączenie/wyłączenie Featured
export async function setFeatured(
  roasterId: string,
  featured: boolean,
  featuredUntil?: Date
): Promise<ActionResult<void>>

// Ręczna edycja profilu przez admina
export async function adminUpdateRoaster(
  roasterId: string,
  data: AdminUpdateRoasterInput
): Promise<ActionResult<Roaster>>

// Dodanie notatki admina
export async function addAdminNote(
  roasterId: string,
  note: string
): Promise<ActionResult<void>>
```

### 2.3 `track.actions.ts` — analytics (publiczne)

```typescript
// src/actions/track.actions.ts
"use server"

// Śledzenie zdarzeń na profilu palarni
export async function trackEvent(
  roasterId: string,
  type: EventType
): Promise<void>  // Fire-and-forget, nie blokuje UI
```

### 2.4 `newsletter.actions.ts` — newsletter

```typescript
// src/actions/newsletter.actions.ts
"use server"

export async function subscribeToNewsletter(
  email: string,
  segment: NewsletterSegment
): Promise<ActionResult<void>>

export async function unsubscribeFromNewsletter(
  token: string  // Unsubscribe token z emaila
): Promise<ActionResult<void>>
```

---

## 3. Typ ActionResult

Wszystkie Server Actions zwracają ustandaryzowany typ:

```typescript
// src/types/actions.ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
```

Użycie po stronie klienta:
```typescript
const result = await createRoasterRegistration(formData)
if (!result.success) {
  // Pokaż błąd
  return
}
// result.data jest dostępne
```

---

## 4. Route Handlers

### 4.1 `GET /api/roasters` — lista palarni (JSON dla mapy)

**Cel:** Dane dla mapy Leaflet (wszystkie piny za jednym razem).
Katalog paginowany używa Server Components — ten endpoint jest tylko dla mapy.

```
GET /api/roasters?format=map

Response 200:
[
  {
    "id": "clx...",
    "name": "Hard Beans",
    "slug": "hard-beans-opole",
    "city": "Opole",
    "country": "Poland",
    "countryCode": "PL",
    "lat": 50.6751,
    "lng": 17.9213,
    "imageUrl": "https://..."
  },
  ...
]
```

Cache: `revalidate = 3600` (odświeżenie co godzinę).

### 4.2 `POST /api/webhooks/stripe` — Stripe webhook (P2)

```
POST /api/webhooks/stripe
Headers: stripe-signature: ...

Body: Stripe Event object

Obsługiwane eventy:
- checkout.session.completed → aktywacja Featured
- invoice.payment_failed → dezaktywacja Featured
- customer.subscription.deleted → dezaktywacja Featured
```

### 4.3 `GET /api/og/[slug]` — Open Graph image

```
GET /api/og/hard-beans-opole

Response: PNG 1200×630
Generuje dynamiczny OG image dla "Share this roaster"
Zawiera: nazwa palarni, miasto, kraj, logo (jeśli dostępne)
```

---

## 5. Data fetching (Server Components)

Bezpośrednie wywołania Prisma w Server Components — bez pośredniego API.

```typescript
// app/roasters/page.tsx (Server Component)
import { prisma } from "@/lib/db"

export default async function CatalogPage({ searchParams }) {
  const roasters = await prisma.roaster.findMany({
    where: {
      status: "VERIFIED",
      ...(searchParams.country && { countryCode: searchParams.country }),
    },
    // ...
  })

  return <RoasterCatalog roasters={roasters} />
}
```

**Zasada:** Nigdy nie fetch przez HTTP w Server Component — zawsze bezpośrednio przez Prisma lub Supabase SDK.

---

## 6. Auth — flow w Next.js

### Middleware (sprawdzanie sesji)

```typescript
// src/middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  // Sprawdź sesję Supabase
  // Chroń /admin/* → wymaga roli ADMIN
  // Chroń /dashboard/* → wymaga zalogowania
  // Wszystko inne → publiczne
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
}
```

### Sprawdzanie roli w Server Action

```typescript
// src/lib/auth.ts
export async function requireAdmin() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
  })
  if (profile?.role !== "ADMIN") throw new Error("Forbidden")

  return { user, profile }
}

export async function requireRoasterOwner(roasterId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
  })
  if (profile?.roasterId !== roasterId && profile?.role !== "ADMIN") {
    throw new Error("Forbidden")
  }

  return { user, profile }
}
```

---

## 7. Walidacja danych

Używamy **Zod** do walidacji wejścia w Server Actions.

```typescript
// src/lib/validations/roaster.ts
import { z } from "zod"

export const CreateRoasterSchema = z.object({
  name:          z.string().min(2).max(100),
  description:   z.string().min(100).max(2000).optional(),
  country:       z.string().min(2).max(60),
  countryCode:   z.string().length(2),
  city:          z.string().min(2).max(100),
  website:       z.string().url().optional().or(z.literal("")),
  email:         z.string().email().optional().or(z.literal("")),
  instagram:     z.string().regex(/^[a-zA-Z0-9._]+$/).optional(),
  shopUrl:       z.string().url().optional().or(z.literal("")),
  certifications: z.array(z.enum(CERTIFICATIONS)).max(10),
  origins:       z.array(z.string().min(2).max(50)).max(20),
  roastStyles:   z.array(z.enum(["Light","Medium","Dark","Espresso","Filter"])),
})

export type CreateRoasterInput = z.infer<typeof CreateRoasterSchema>
```

---

## 8. Error handling w Server Actions

```typescript
export async function createRoasterRegistration(
  formData: FormData
): Promise<ActionResult<{ slug: string }>> {
  try {
    const raw = Object.fromEntries(formData)
    const parsed = CreateRoasterSchema.safeParse(raw)

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      }
    }

    // ... logika
    const roaster = await prisma.roaster.create({ data: parsed.data })

    return { success: true, data: { slug: roaster.slug } }

  } catch (error) {
    console.error("[createRoasterRegistration]", error)
    return { success: false, error: "Internal server error" }
  }
}
```

---

## 9. Rate limiting

Dla publicznych akcji (trackEvent, subscribeToNewsletter) — rate limiting przez Vercel Edge Middleware lub upstash/ratelimit.

```typescript
// Przykład dla trackEvent: max 10 eventów / IP / godzinę
// Implementacja: Vercel KV + upstash/ratelimit (P1)
// MVP: brak rate limitingu (zbyt mało ruchu, by było potrzebne)
```
