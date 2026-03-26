# Bean Map — Roadmap

> Platforma B2B łącząca palarnie kawy z kawiarniami.
> Cel: doprowadzić MVP do produkcji i pozyskać pierwszych użytkowników.

## Stan projektu (marzec 2026)

| Warstwa          | Stan        | Szczegóły                                               |
|------------------|-------------|---------------------------------------------------------|
| Dokumentacja     | **90%**     | Architektura, design brief, research — kompletne        |
| UI / Frontend    | **70%**     | Strony: home, katalog, mapa, profil, rejestracja, admin stub |
| Baza danych      | **10%**     | Schema Prisma gotowa, brak migracji, brak połączenia    |
| Backend / API    | **0%**      | Brak server actions, brak route handlers                |
| Autentykacja     | **0%**      | Brak Supabase Auth, brak middleware                     |
| Admin panel      | **5%**      | Tylko UI pending queue, brak logiki                     |
| Dashboard palarni| **0%**      | Brak stron i logiki                                     |
| Email / Newsletter| **0%**     | Brak integracji z Resend                                |

## Fazy rozwoju

### Faza 0: Fundament (obecna)
Porządkowanie projektu, branding, planowanie architektury.

- Ustalenie finalnej nazwy i branding (logo, kolory)
- Rewizja architektury pod kątem realnego MVP
- Decyzja: co wchodzi do MVP, a co do v2
- Setup Supabase (baza, auth, storage)

### Faza 1: Baza danych i autentykacja
Podłączenie backendu — bez tego nic nie działa.

- Konfiguracja Supabase (PostgreSQL + Auth + Storage)
- Uruchomienie migracji Prisma
- Seed 60 palarni z `docs/seed-roasters.md`
- Integracja Supabase Auth (magic links)
- Middleware: ochrona `/admin/*` i `/dashboard/*`

### Faza 2: Server Actions i API
Logika biznesowa — rejestracja, weryfikacja, zarządzanie profilem.

- Server actions: roaster (rejestracja, update, upload)
- Server actions: admin (verify, reject, featured)
- Server actions: tracking (eventy)
- API route: `/api/roasters` (dane dla mapy)
- Walidacja Zod na wszystkich formularzach

### Faza 3: Panele
Dashboard palarni + pełny panel admina.

- Dashboard palarni: edycja profilu, upload zdjęć, statystyki
- Admin: lista palarni, weryfikacja, notatki, featured tier
- Image upload z Supabase Storage

### Faza 4: SEO i marketing
Organiczny wzrost — strony pod SEO, newsletter, analityka.

- Landing pages: `/country/[country]`, `/country/[country]/[city]`
- Sitemap + robots.txt
- Newsletter z Resend
- Analityka (Plausible)
- Open Graph images

### Faza 5: Monetyzacja (v2)
- Kampanie sponsorowane (Stripe)
- Płatne wyróżnienie profilu
- Konta kawiarni
- Obsługa sampli

## Kryteria sukcesu MVP

- [ ] Palarnia może się zarejestrować i edytować profil
- [ ] Admin może weryfikować palarnie
- [ ] Katalog wyświetla dane z bazy (nie mock)
- [ ] Mapa działa z realnymi danymi
- [ ] Strona działa na produkcji (Vercel + Supabase)
