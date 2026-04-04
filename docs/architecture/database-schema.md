# Schemat bazy danych — Roasters Hub

**Wersja:** 2.0
**Data:** 2026-03-26 (zmiana: Vercel Postgres + Clerk zamiast Supabase)
**ORM:** Prisma 7.5 | **DB:** PostgreSQL 16 (Vercel Postgres / Neon)

---

## 1. Diagram encji

```
┌─────────────────┐         ┌──────────────────┐
│   UserProfile   │         │     Roaster       │
│─────────────────│    1    │──────────────────│
│ id (Clerk ext)  │────────>│ id               │
│ email           │         │ name             │
│ role            │         │ slug (unique)    │
│ createdAt       │         │ description      │
└─────────────────┘         │ country          │
                             │ city             │
                             │ lat / lng        │
                             │ website          │
                             │ email            │
                             │ instagram        │
                             │ shopUrl          │
                             │ certifications[] │
                             │ origins[]        │
                             │ status           │
                             │ featured         │
                             │ featuredUntil    │
                             │ ownerId (FK→User)│
                             │ verifiedAt       │
                             │ createdAt        │
                             │ updatedAt        │
                             └────────┬─────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                   │
          ┌─────────▼──────┐  ┌──────▼───────┐  ┌──────▼──────────┐
          │  RoasterImage  │  │ ProfileEvent │  │  AdminNote      │
          │────────────────│  │──────────────│  │─────────────────│
          │ id             │  │ id           │  │ id              │
          │ roasterId (FK) │  │ roasterId FK │  │ roasterId (FK)  │
          │ url            │  │ type         │  │ adminId (FK)    │
          │ alt            │  │ ipHash       │  │ note            │
          │ order          │  │ createdAt    │  │ createdAt       │
          │ isPrimary      │  └──────────────┘  └─────────────────┘
          └────────────────┘

┌──────────────────────────┐
│  NewsletterSubscriber    │
│──────────────────────────│
│ id                       │
│ email (unique)           │
│ segment                  │
│ confirmedAt              │
│ createdAt                │
└──────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│     Review       │  │  SavedRoaster    │  │     ApiKey       │
│──────────────────│  │──────────────────│  │──────────────────│
│ id               │  │ id               │  │ id               │
│ roasterId (FK)   │  │ userId (FK)      │  │ name             │
│ authorName       │  │ roasterId (FK)   │  │ key (unique)     │
│ rating (1-5)     │  │ createdAt        │  │ active           │
│ comment          │  └──────────────────┘  │ lastUsed         │
│ status           │                         │ createdAt        │
│ createdAt        │                         └──────────────────┘
└──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│   SavedCafe      │  │   CafeEvent      │
│──────────────────│  │──────────────────│
│ id               │  │ id               │
│ userId (FK)      │  │ cafeId (FK)      │
│ cafeId (FK)      │  │ type             │
│ createdAt        │  │ ipHash           │
└──────────────────┘  │ userAgent        │
                      │ createdAt        │
                      └──────────────────┘
```

---

## 2. Prisma schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── ENUMS ────────────────────────────────────────────────────────────────────

enum RoasterStatus {
  PENDING    // Zgłoszony, czeka na weryfikację
  VERIFIED   // Zweryfikowany, widoczny publicznie
  REJECTED   // Odrzucony przez admina
  INACTIVE   // Dezaktywowany (palarnia zamknięta lub na własną prośbę)
}

enum UserRole {
  ROASTER    // Właściciel palarni
  CAFE       // Kawiarnia / buyer
  ADMIN      // Administrator platformy
}

enum ReviewStatus {
  PENDING    // Czeka na moderację
  APPROVED   // Zatwierdzony, widoczny publicznie
  REJECTED   // Odrzucony przez admina
}

enum EventType {
  PAGE_VIEW      // Wyświetlenie profilu
  CONTACT_CLICK  // Kliknięcie w email lub formularz kontaktowy
  SHOP_CLICK     // Kliknięcie "Shop online"
  WEBSITE_CLICK  // Kliknięcie w link do strony www
  MAP_CLICK      // Kliknięcie na pinezce mapy
  SHARE_CLICK    // Kliknięcie "Share this roaster"
}

enum NewsletterSegment {
  CAFE       // Kawiarnia / buyer
  CONSUMER   // Konsument / home brewer
  ROASTER    // Palarnia (do aktualizacji platformy)
}

// ─── USER ─────────────────────────────────────────────────────────────────────

// UserProfile uzupełnia Clerk Auth
// id = Clerk externalId (user_xxx)
model UserProfile {
  id        String    @id // = Clerk userId (user_xxx)
  email     String    @unique
  role      UserRole  @default(ROASTER)
  roaster   Roaster?  @relation(fields: [roasterId], references: [id])
  roasterId String?   @unique
  createdAt DateTime  @default(now())

  adminNotes    AdminNote[]
  savedRoasters SavedRoaster[]

  @@map("user_profiles")
}

// ─── ROASTER ──────────────────────────────────────────────────────────────────

model Roaster {
  id          String        @id @default(cuid())
  name        String
  slug        String        @unique
  description String?       @db.Text
  country     String        // "Poland", "Germany", "Ethiopia" — pełna nazwa
  countryCode String        // "PL", "DE", "ET" — ISO 3166-1 alpha-2
  city        String
  lat         Float?        // Szerokość geograficzna (dla mapy)
  lng         Float?        // Długość geograficzna (dla mapy)

  // Kontakt
  website     String?
  email       String?
  instagram   String?       // @handle bez @
  facebook    String?
  shopUrl     String?       // Link "Shop online"

  // Specialty data (tablice — PostgreSQL native arrays)
  certifications String[]   // ["FAIR_TRADE", "ORGANIC", "DIRECT_TRADE", ...]
  origins        String[]   // ["Ethiopia", "Kenya", "Colombia", ...]
  roastStyles    String[]   // ["Light", "Medium", "Dark", "Espresso", "Filter"]

  // Status
  status       RoasterStatus @default(PENDING)
  featured     Boolean       @default(false)
  featuredUntil DateTime?    // Null = nie featured lub featured bezterminowo

  // Relacje
  images       RoasterImage[]
  events       ProfileEvent[]
  reviews      Review[]
  adminNotes   AdminNote[]
  savedBy      SavedRoaster[]
  owner        UserProfile?

  // Metadata
  verifiedAt   DateTime?
  rejectedAt   DateTime?
  rejectedReason String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([status])
  @@index([country])
  @@index([countryCode])
  @@index([city])
  @@index([featured])
  @@index([status, featured])
  @@map("roasters")
}

// ─── ROASTER IMAGE ─────────────────────────────────────────────────────────────

model RoasterImage {
  id         String   @id @default(cuid())
  roaster    Roaster  @relation(fields: [roasterId], references: [id], onDelete: Cascade)
  roasterId  String
  url        String   // Uploadthing URL (MVP) / Cloudflare R2 URL (growth)
  alt        String?
  order      Int      @default(0)
  isPrimary  Boolean  @default(false) // Główne zdjęcie w listingu (nie logo)

  @@index([roasterId])
  @@map("roaster_images")
}

// ─── ANALYTICS ─────────────────────────────────────────────────────────────────

model ProfileEvent {
  id        String    @id @default(cuid())
  roaster   Roaster   @relation(fields: [roasterId], references: [id], onDelete: Cascade)
  roasterId String
  type      EventType
  ipHash    String?   // SHA256(IP) — privacy-first, nie przechowujemy surowego IP
  userAgent String?
  createdAt DateTime  @default(now())

  @@index([roasterId])
  @@index([roasterId, type])
  @@index([createdAt])
  @@map("profile_events")
}

// ─── ADMIN NOTES ───────────────────────────────────────────────────────────────

model AdminNote {
  id        String      @id @default(cuid())
  roaster   Roaster     @relation(fields: [roasterId], references: [id], onDelete: Cascade)
  roasterId String
  admin     UserProfile @relation(fields: [adminId], references: [id])
  adminId   String
  note      String      @db.Text
  createdAt DateTime    @default(now())

  @@index([roasterId])
  @@map("admin_notes")
}

// ─── NEWSLETTER ─────────────────────────────────────────────────────────────────

model NewsletterSubscriber {
  id           String              @id @default(cuid())
  email        String              @unique
  segment      NewsletterSegment   @default(CONSUMER)
  confirmedAt  DateTime?           // Null = unconfirmed (double opt-in)
  createdAt    DateTime            @default(now())

  @@map("newsletter_subscribers")
}

// ─── REVIEWS ────────────────────────────────────────────────────────────────

model Review {
  id         String       @id @default(cuid())
  roaster    Roaster      @relation(fields: [roasterId], references: [id], onDelete: Cascade)
  roasterId  String
  authorName String
  rating     Int          // 1-5
  comment    String?      @db.Text
  status     ReviewStatus @default(PENDING)
  createdAt  DateTime     @default(now())

  @@index([roasterId])
  @@index([roasterId, status])
  @@map("reviews")
}

// ─── SAVED ROASTERS ─────────────────────────────────────────────────────────

model SavedRoaster {
  id        String      @id @default(cuid())
  user      UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  roaster   Roaster     @relation(fields: [roasterId], references: [id], onDelete: Cascade)
  roasterId String
  createdAt DateTime    @default(now())

  @@unique([userId, roasterId])
  @@index([userId])
  @@map("saved_roasters")
}

// ─── API KEYS ───────────────────────────────────────────────────────────────

model ApiKey {
  id        String   @id @default(cuid())
  name      String
  key       String   @unique
  createdAt DateTime @default(now())
  lastUsed  DateTime?
  active    Boolean  @default(true)

  @@map("api_keys")
}
```

---

## 3. Decyzje projektowe i uzasadnienia

### Dlaczego `certifications` i `origins` jako `String[]` (nie relacje)

**Opcja A (wybrana):** `String[]` PostgreSQL array
```prisma
certifications String[] // ["FAIR_TRADE", "ORGANIC"]
origins        String[] // ["Ethiopia", "Kenya"]
```

**Opcja B:** Osobna tabela relacyjna (wiele-do-wielu)

**Uzasadnienie wyboru A:**
- Lista certyfikatów jest zamknięta i rzadko zmienia się (enum-like)
- Filtrowanie przez PostgreSQL ANY operator — wydajne z indeksem GIN
- Mniej JOIN-ów = prostsze queries
- Prisma obsługuje scalar lists natywnie dla PostgreSQL

**Indeks GIN dla filtrowania:**
```sql
-- Dodać w migracji manualnie (Prisma nie generuje GIN automatycznie)
CREATE INDEX roasters_certifications_gin ON roasters USING GIN (certifications);
CREATE INDEX roasters_origins_gin ON roasters USING GIN (origins);
```

### Dlaczego `lat`/`lng` na modelu Roaster (nie PostGIS)

Dla MVP, liczba palarni (100–500) nie wymaga PostGIS — zwykłe `Float` + filtrowanie bounding box po stronie aplikacji jest wystarczające i prostsze. PostGIS można dodać w P2 jeśli potrzeba wyszukiwania "w promieniu X km".

### Dlaczego `UserProfile` zamiast polegania wyłącznie na Clerk

Clerk zarządza użytkownikami zewnętrznie (poza naszą DB). `UserProfile` jest lokalną tabelą powiązaną przez `id` (= Clerk `userId`, format `user_xxx`). Dzięki temu:
- Prisma może tworzyć relacje (FK do Roaster, AdminNote)
- Dane użytkownika są w naszej DB — migracja z Clerk nie wymaga eksportu danych
- Role (`UserRole`) przechowywane w obu miejscach (Clerk `publicMetadata` + DB) dla redundancji

### Dlaczego `ipHash` w `ProfileEvent`

Surowe IP = dane osobowe (RODO). SHA256(IP + salt) daje wystarczającą unikalność do deduplicacji wyświetleń bez przechowywania danych osobowych. Alternatywnie — analytics przez Plausible (brak problemu).

### Review, SavedRoaster, ApiKey (Phase 3)

Dodane w sprincie agenta (2026-03-29):
- **Review** — moderowane recenzje (PENDING → APPROVED/REJECTED), powiązane z Roaster
- **SavedRoaster** — relacja M:N UserProfile↔Roaster z unique constraint (userId, roasterId)
- **ApiKey** — uwierzytelnianie partnerów API (klucz w plaintext — do hashowania w przyszłości)

### Cafe, CafeRoasterRelation (Phase 4 — Cafe Profiles)

Dodane 2026-03-30:
- **Cafe** — profil kawiarni (analogiczny do Roaster): status PENDING/VERIFIED/REJECTED, pola lokalizacyjne, owner → UserProfile (1:1 via cafeId), featured flag
- **CafeRoasterRelation** — relacja M:N Cafe↔Roaster (które palnie serwuje dana kawiarnia), z unique constraint (cafeId, roasterId) i cascade delete
- **Review** rozszerzony: roasterId stał się nullable; dodano cafeId — recenzja dotyczy albo palarni albo kawiarni (aplikacyjny constraint: dokładnie jedno z nich != null)
- **UserProfile** rozszerzony: dodano cafeId (unique) — właściciel kawiarni analogicznie do właściciela palarni
- **Roaster** rozszerzony: dodano servedAt (CafeRoasterRelation[]) — lista kawiarni serwujących daną palarnię

### SavedCafe, CafeEvent (UX Polish — 2026-04-04)

Dodane 2026-04-04:
- **SavedCafe** — relacja M:N UserProfile↔Cafe z unique constraint (userId, cafeId), analogiczny do SavedRoaster
- **CafeEvent** — śledzenie analityki dla profili kawiarni (PAGE_VIEW, WEBSITE_CLICK, CONTACT_CLICK), analogiczny do ProfileEvent
- **UserProfile** rozszerzony: dodano savedCafes SavedCafe[]
- **Cafe** rozszerzony: dodano savedBy SavedCafe[] i events CafeEvent[]

---

## 4. Wartości dla `certifications[]`

Oficjalna lista obsługiwanych certyfikatów (walidacja po stronie aplikacji):

```typescript
// src/types/certifications.ts
export const CERTIFICATIONS = [
  "FAIR_TRADE",
  "ORGANIC",
  "RAINFOREST_ALLIANCE",
  "UTZ",
  "BIRD_FRIENDLY",
  "DIRECT_TRADE",       // Nie certyfikat formalny, ale kluczowa wartość dla specialty
  "SCA_MEMBER",
  "DEMETER",
] as const

export type Certification = typeof CERTIFICATIONS[number]

export const CERTIFICATION_LABELS: Record<Certification, string> = {
  FAIR_TRADE:          "Fair Trade",
  ORGANIC:             "Organic",
  RAINFOREST_ALLIANCE: "Rainforest Alliance",
  UTZ:                 "UTZ Certified",
  BIRD_FRIENDLY:       "Bird Friendly",
  DIRECT_TRADE:        "Direct Trade",
  SCA_MEMBER:          "SCA Member",
  DEMETER:             "Demeter",
}
```

---

## 5. Seed data structure

Import z `docs/seed-roasters.md` → tabela `roasters`. Każdy rekord seedowany jako:

```typescript
{
  name:           "Hard Beans",
  slug:           "hard-beans-opole",        // auto-generated
  description:    "...",
  country:        "Poland",
  countryCode:    "PL",
  city:           "Opole",
  lat:            50.6751,                   // geocoded przy imporcie
  lng:            17.9213,
  website:        "https://hardbeans.pl",
  instagram:      "hardbeansroastery",
  shopUrl:        "https://hardbeans.pl/sklep",
  certifications: ["DIRECT_TRADE", "SCA_MEMBER"],
  origins:        ["Ethiopia", "Kenya", "Colombia"],
  roastStyles:    ["Light", "Filter"],
  status:         "VERIFIED",               // seed = od razu verified
  featured:       false,
  verifiedAt:     new Date(),
}
```

---

## 6. Queries — najważniejsze wzorce

### Lista palarni z filtrami (katalog)

```typescript
const roasters = await prisma.roaster.findMany({
  where: {
    status: "VERIFIED",
    ...(country && { countryCode: country }),
    ...(certification && { certifications: { has: certification } }),
    ...(origin && { origins: { has: origin } }),
    ...(featured && { featured: true }),
  },
  select: {
    id: true, name: true, slug: true,
    city: true, country: true, countryCode: true,
    certifications: true, origins: true,
    featured: true,
    images: {
      where: { isPrimary: true },
      take: 1,
      select: { url: true, alt: true },
    },
  },
  orderBy: [
    { featured: "desc" },  // Featured palarnie zawsze pierwsze
    { name: "asc" },
  ],
  take: 24,
  skip: (page - 1) * 24,
})
```

### Profil palarni (pełne dane)

```typescript
const roaster = await prisma.roaster.findUnique({
  where: { slug, status: "VERIFIED" },
  include: {
    images: { orderBy: { order: "asc" } },
  },
})
```

### Statystyki per palarnia (admin/dashboard)

```typescript
const stats = await prisma.profileEvent.groupBy({
  by: ["type"],
  where: {
    roasterId,
    createdAt: { gte: startDate },
  },
  _count: { type: true },
})
```

### Dane dla mapy (lekkie — tylko lat/lng)

```typescript
const mapData = await prisma.roaster.findMany({
  where: { status: "VERIFIED", lat: { not: null } },
  select: {
    id: true, name: true, slug: true,
    city: true, country: true,
    lat: true, lng: true,
    images: {
      where: { isPrimary: true },
      take: 1,
      select: { url: true },
    },
  },
})
```
