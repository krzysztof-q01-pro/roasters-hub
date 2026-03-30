# Testing — User Journey Map

Dokumentacja testowa roasters-hub oparta na **User Journey Map** — czytelna dla człowieka (tester manualny) i strukturalna dla Agenta AI (Playwright E2E).

## Jak używać

**Tester manualny:** Wybierz journey dla roli którą testujesz → przejdź przez kroki → zaznacz status po zakończeniu.

**Agent AI:** Załaduj wszystkie pliki z `journeys/` → parsuj sekcje jako test cases → wykonaj kroki z tabeli → weryfikuj oczekiwane wyniki.

**Deweloper:** Sprawdź Feature Visibility Matrix poniżej aby zobaczyć co jest pokryte testami, a co nie.

---

## Journeys (12 misji, 5 ról)

| Plik | Rola | Misje |
|------|------|-------|
| [01-guest.md](journeys/01-guest.md) | Anonimowy gość | A: Odkryj palarnie · B: Profil i interakcje · C: Mapa |
| [02-roaster.md](journeys/02-roaster.md) | Właściciel palarni | A: Rejestracja · B: Dashboard |
| [03-cafe.md](journeys/03-cafe.md) | Cafe buyer | A: Zapisz i zarządzaj palarniami |
| [04-admin.md](journeys/04-admin.md) | Admin | A: Weryfikacja · B: Odrzucenie · C: Moderacja recenzji |
| [05-reviewer.md](journeys/05-reviewer.md) | Recenzent | A: Zostaw recenzję |

---

## Feature Visibility Matrix

Każda funkcja systemu zmapowana na journey. Kolumna **"Gdzie w UI"** = `niewidoczny` oznacza funkcję działającą w tle — celowo wymienioną w sekcji "Ukryte efekty" danej misji.

| Funkcja | Gdzie w UI | Journey | Status |
|---------|-----------|---------|--------|
| Homepage stats (liczba palarni, krajów) | `/` | 01-A | ⬜ |
| Katalog palarni z filtrami (kraj, certyfikaty, styl) | `/roasters` | 01-A | ⬜ |
| Wyszukiwanie po nazwie | `/roasters` | 01-A | ⬜ |
| Profil palarni | `/roasters/[slug]` | 01-B | ⬜ |
| Przycisk Website / Shop / Contact | `/roasters/[slug]` | 01-B | ⬜ |
| Event tracking (kliknięcia przycisków) | niewidoczny | 01-B (ukryty efekt) | ⬜ |
| Interaktywna mapa z markerami | `/map` | 01-C | ⬜ |
| Popup markera z linkiem do profilu | `/map` | 01-C | ⬜ |
| Rejestracja — krok 1 (dane podstawowe) | `/register` | 02-A | ⬜ |
| Rejestracja — krok 2 (certyfikaty, origins) | `/register` | 02-A | ⬜ |
| Rejestracja — krok 3 (podgląd i submit) | `/register` | 02-A | ⬜ |
| Email: potwierdzenie rejestracji → palarnia | niewidoczny | 02-A (ukryty efekt) | ⬜ |
| Email: notyfikacja nowego wniosku → admin | niewidoczny | 02-A (ukryty efekt) | ⬜ |
| Dashboard palarni — edycja profilu | `/dashboard/roaster` | 02-B | ⬜ |
| Dashboard palarni — upload logo (Uploadthing) | `/dashboard/roaster` | 02-B | ⬜ |
| Dashboard palarni — statystyki (page views, kliknięcia) | `/dashboard/roaster` | 02-B | ⬜ |
| Zapis palarni do listy (Cafe) | `/roasters/[slug]` | 03-A | ⬜ |
| Dashboard cafe — lista zapisanych palarni | `/dashboard/cafe` | 03-A | ⬜ |
| Usunięcie palarni z listy | `/dashboard/cafe` | 03-A | ⬜ |
| Admin: lista oczekujących wniosków | `/admin/pending` | 04-A | ⬜ |
| Admin: weryfikacja wniosku | `/admin/pending` | 04-A | ⬜ |
| Email: potwierdzenie weryfikacji → palarnia | niewidoczny | 04-A (ukryty efekt) | ⬜ |
| ISR revalidation po weryfikacji (/, /roasters, /map) | niewidoczny | 04-A (ukryty efekt) | ⬜ |
| Admin: odrzucenie wniosku z powodem | `/admin/pending` | 04-B | ⬜ |
| Email: odrzucenie z powodem → palarnia | niewidoczny | 04-B (ukryty efekt) | ⬜ |
| Admin: lista recenzji do moderacji | `/admin/reviews` | 04-C | ⬜ |
| Admin: zatwierdzenie / odrzucenie recenzji | `/admin/reviews` | 04-C | ⬜ |
| Formularz recenzji na profilu | `/roasters/[slug]` | 05-A | ⬜ |
| Recenzja PENDING (niewidoczna publicznie) | niewidoczny | 05-A (ukryty efekt) | ⬜ |
| Partner API `/api/v1/roasters` | brak UI | — (faza 2) | 🔜 |
| Newsletter digest (cron) | brak UI | — (faza 2) | 🔜 |
| Subskrypcja newslettera (homepage) | `/` | — (faza 2) | 🔜 |
| Slug collision handling | niewidoczny | — (faza 2) | 🔜 |

**Legenda:** ⬜ nieprzetestowane · ✅ manual OK · 🤖 E2E (Playwright) · 🔜 faza 2

---

## Dane testowe (konta)

Przed testowaniem skonfiguruj konta w Clerk dla środowiska testowego:

| Rola | Email | Uwagi |
|------|-------|-------|
| Admin | `admin@test.beanmap` | Clerk metadata: `role: ADMIN` |
| Roaster (zweryfikowany) | `roaster@test.beanmap` | Powiązany VERIFIED roaster w DB |
| Cafe | `cafe@test.beanmap` | Clerk metadata: `role: CAFE` |
| Nowy użytkownik | (świeże konto Clerk) | Do testów rejestracji |

---

## E2E (faza 2)

Katalog `e2e/` jest zarezerwowany dla Playwright specs generowanych na podstawie tych journeys. Każda misja z tego pliku ma odpowiadać jednemu plikowi `*.spec.ts`.

Środowisko docelowe: Vercel Preview URL (automatyczny deploy per PR).
