# Bean Map — Zadania

> Szczegóły strategii: [ROADMAP.md](ROADMAP.md)

## Faza 0: Fundament

### Branding & Design
- [ ] Przygotować logo Bean Map
- [ ] Ujednolicić nazwę (Bean Map vs Roasters Hub) w całym projekcie
- [ ] Stworzyć favicon i social media assets
- [ ] Wyeksportować design tokens do dokumentacji

### Architektura
- [ ] Zaplanować na nowo architekturę rozwiązania (rewizja obecnego stacku)
- [ ] Zdecydować co wchodzi do MVP, a co do v2+
- [ ] Rozwiązać niespójności między dokumentacją a kodem

### Już zrobione w tej fazie
- [x] Dokumentacja architektury (technical overview, project structure, API design, DB schema)
- [x] Design brief i visual identity (kolory, typografia, komponenty)
- [x] Market research i analiza konkurencji
- [x] Seed data — 60 palarni z całego świata
- [x] Schema Prisma (UserProfile, Roaster, RoasterImage, ProfileEvent, AdminNote)
- [x] Design system: CSS variables, responsive layout, custom fonts
- [x] Konfiguracja Next.js 16 + Tailwind v4 + TypeScript

## Faza 1: Baza danych i autentykacja

### Baza danych
- [ ] Założyć projekt Supabase (PostgreSQL + Auth + Storage)
- [ ] Uzupełnić `.env.local` o prawdziwe dane Supabase
- [ ] Odkomentować i uruchomić Prisma client w `src/lib/db.ts`
- [ ] Uruchomić migracje Prisma (`prisma migrate dev`)
- [ ] Napisać `prisma/seed.ts` na bazie `docs/seed-roasters.md`
- [ ] Zasilić bazę 60 palarniami
- [ ] Dodać GIN indexy na pola tablicowe (certifications, origins)

### Autentykacja
- [ ] Zintegrować Supabase Auth (magic links + opcjonalnie Google OAuth)
- [ ] Stworzyć `src/lib/supabase.ts` (klient server + browser)
- [ ] Stworzyć `src/lib/auth.ts` (requireAdmin, requireRoasterOwner)
- [ ] Zaimplementować middleware ochrony tras `/admin/*` i `/dashboard/*`

## Faza 2: Backend / Server Actions

- [ ] `src/actions/roaster.actions.ts` — rejestracja, update profilu, upload zdjęć
- [ ] `src/actions/admin.actions.ts` — verify, reject, deactivate, featured
- [ ] `src/actions/track.actions.ts` — event tracking
- [ ] `src/actions/newsletter.actions.ts` — subscribe/unsubscribe
- [ ] API route: `GET /api/roasters?format=map`
- [ ] Dodać walidację Zod do wszystkich formularzy
- [ ] Zastąpić MOCK_ROASTERS prawdziwymi zapytaniami do bazy

## Faza 3: Panele

### Panel admina
- [ ] Zaplanować moduły panelu administratora
- [ ] Implementacja: lista palarni z filtrowaniem
- [ ] Implementacja: weryfikacja / odrzucanie palarni
- [ ] Implementacja: notatki admina
- [ ] Implementacja: zarządzanie featured tier

### Dashboard palarni
- [ ] Strona edycji profilu
- [ ] Komponent upload zdjęć (Supabase Storage)
- [ ] Strona statystyk (wyświetlenia profilu, kliknięcia)

## Faza 4: SEO, marketing i polish

- [ ] Landing pages `/country/[country]` i `/country/[country]/[city]`
- [ ] Generowanie sitemap.xml
- [ ] robots.txt
- [ ] Dynamic OG images (`/api/og/[slug]`)
- [ ] Loading states / skeleton loaders
- [ ] Error boundaries
- [ ] Strona 404
- [ ] `NewsletterForm`
- [ ] `ShareButton`
- [ ] `ImageUpload`

### Już zrobione (UI)
- [x] Homepage z hero, stats, featured roasters
- [x] Katalog palarni z filtrowaniem
- [x] Profil palarni (detail page)
- [x] Interaktywna mapa Leaflet z klastrowanymi pinami
- [x] Formularz rejestracji (3-step, UI only)
- [x] Admin pending queue (stub)
