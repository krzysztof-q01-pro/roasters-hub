---
name: site-audit
description: Use when systematically testing the website, reviewing pages visually for bugs and UX issues, auditing design quality, collecting issues to fix, or running a QA pass before merging. Requires Playwright MCP — see Prerequisites below.
argument-hint: "[URL — opcjonalnie, np. https://roasters-hub.vercel.app]"
---

## Co robi ten skill

Przechodzi przez wszystkie kluczowe strony aplikacji, analizuje je wizualnie i funkcjonalnie, sprawdza logi konsoli, błędy sieci, przepływy użytkownika i SEO — i zbiera listę problemów do naprawy w `.tmp/audit-YYYY-MM-DD.md`.

Wynik: raport z podzielonymi priorytetami (CRITICAL / HIGH / MEDIUM / LOW / GAPS) gotowy do wklejenia do ROADMAP.

---

## Prerequisites: Playwright MCP

Ten skill wymaga Playwright MCP. Jeśli nie jest zainstalowany:

```bash
# Instalacja (jednorazowo)
claude mcp add playwright npx @playwright/mcp@latest
```

Sprawdź czy dostępny: jeśli narzędzia `browser_navigate`, `browser_snapshot` nie są w toolsecie — zatrzymaj i poinformuj użytkownika o instalacji.

---

## Krok 1: Ustal URL

Jeśli `$ARGUMENTS` podano → użyj go jako base URL.

Jeśli nie podano:
```bash
python tools/vercel_status.py --json 2>/dev/null | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    previews = [x for x in d if x.get('environment') == 'Preview' and x.get('url')]
    print(previews[0]['url'] if previews else '')
except:
    print('')
"
```

Fallback jeśli Vercel niedostępny: zapytaj użytkownika o URL lub użyj `http://localhost:3000` jeśli dev server działa.

---

## Krok 2: Przejdź przez strony audytu

Dla każdej strony z listy poniżej wykonaj:
1. Nawiguj do URL
2. Poczekaj na pełne załadowanie (sieć idle, brak spinnerów)
3. **Zbierz logi konsoli** — uruchom `browser_console_messages`, zanotuj wszystkie `error` i podejrzane `warn`
4. **Zbierz błędy sieci** — uruchom `browser_network_requests`, zanotuj requesty ze statusem 4xx/5xx oraz brakujące zasoby (obrazki, fonty)
5. Zrób **screenshot obowiązkowo** dla każdej strony P1 × 3 viewporty (desktop 1440px, tablet 768px, mobile 375px) — zapisz do `.tmp/screenshots/audit-YYYY-MM-DD/{strona}-{viewport}.png`
6. Dla P2 stron: zrób snapshot accessibility tree
7. Przeanalizuj według checklisty (Krok 3)
8. Zanotuj wszystkie problemy z severity i lokalizacją

### Viewporty dla screenshotów
```
desktop: 1440 × 900
tablet:   768 × 1024
mobile:   375 × 812
```
Zmień viewport przed screenshotem używając `browser_resize`.

### Lista stron do sprawdzenia

| Strona | URL | Priorytet |
|--------|-----|-----------|
| Homepage | `{BASE}/` | P1 |
| Katalog palarni | `{BASE}/roasters` | P1 |
| Profil palarni | `{BASE}/roasters/[pierwszy-slug]` | P1 |
| Mapa | `{BASE}/map` | P1 |
| Formularz rejestracji | `{BASE}/register` | P1 |
| Sign-in | `{BASE}/sign-in` | P2 |
| Admin pending | `{BASE}/admin/pending` | P2 |
| Dashboard roastera | `{BASE}/dashboard/roaster` | P2 |
| SEO country page | `{BASE}/roasters/country/poland` | P2 |

Aby znaleźć pierwszy slug: przejdź do `/roasters`, kliknij pierwszą palarnię.

---

## Krok 3: Checklist analizy każdej strony

### Funkcjonalność
- [ ] Strona ładuje się bez błędów (brak 404, 500, białego ekranu)
- [ ] Wszystkie linki nawigacyjne działają
- [ ] Dane ładują się poprawnie (nie ma "undefined", "null", pustych sekcji)
- [ ] Interaktywne elementy reagują (przyciski, filtry, formularze)
- [ ] Zdjęcia/ikony ładują się (brak broken image placeholder)
- [ ] **Brak błędów w konsoli** (sprawdzone w Krok 2)
- [ ] **Brak failed requests** (sprawdzone w Krok 2)

### Layout i design
- [ ] Brak elementów wychodzących poza viewport (overflow)
- [ ] Tekst jest czytelny (kontrast, rozmiar, nie przycina się)
- [ ] Spacing i alignment są spójne
- [ ] Brak nakładających się elementów
- [ ] Loading states są obecne (skeleton, spinner)

### Responsywność
Sprawdź w 3 viewport'ach: desktop (1440px), tablet (768px), mobile (375px):
- [ ] Layout nie łamie się
- [ ] Nawigacja działa (hamburger menu na mobile?)
- [ ] Tekst nie jest zbyt mały na mobile
- [ ] Przyciski mają odpowiedni touch target (min 44px)

### SEO (tylko strony P1)
Użyj `browser_evaluate` do sprawdzenia:
```js
({
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.content,
  h1count: document.querySelectorAll('h1').length,
  imagesWithoutAlt: [...document.querySelectorAll('img')].filter(i => !i.alt).length
})
```
- [ ] `<title>` obecny, unikalny, nie duplikuje się (nie "Bean Map | Bean Map")
- [ ] `<meta name="description">` wypełniony
- [ ] Dokładnie jeden `<h1>` na stronę
- [ ] Obrazki mają atrybut `alt`

### Gaps — brakujące lub niedokończone funkcje
Aktywnie szukaj:
- Sekcji istniejących w HTML ale pustych (np. "Products" bez zawartości, "Reviews" z 0 wpisami bez komunikatu)
- Przycisków/linków które nic nie robią (`href="#"`, brak `onClick`)
- Placeholder textu widocznego dla użytkownika ("Lorem ipsum", "Coming soon", "TODO")
- Funkcji z ROADMAP oznaczonych jako `[x]` ale wizualnie niewidocznych lub niedziałających

### Specyficzne dla roasters-hub
- [ ] Liczba palarni na homepage zgadza się z katalogiem
- [ ] Filtry na `/roasters` działają (kraj, certyfikaty)
- [ ] Mapa wyświetla markery (nie pusta mapa)
- [ ] Profil palarni pokazuje wszystkie sekcje (info, certyfikaty, produkty)
- [ ] Admin `/pending` wymaga autoryzacji (redirect do login jeśli niezalogowany)
- [ ] `/dashboard/roaster` wymaga autoryzacji

---

## Krok 3b: Testy przepływów użytkownika

Wykonaj 3 kluczowe przepływy:

### Flow 1: Katalog → Profil → Powrót
1. Otwórz `/roasters`
2. Kliknij pierwszą palarnię na liście
3. Sprawdź czy URL zmienił się na `/roasters/[slug]`
4. Kliknij breadcrumb "Roasters" → sprawdź czy wrócił do `/roasters`
5. Zanotuj: czy breadcrumb jest obecny, czy nawigacja działa

### Flow 2: Mapa → Popup → Profil
1. Otwórz `/map`
2. Kliknij dowolny marker na mapie
3. Sprawdź czy popup się pojawił (nazwa palarni, link)
4. Kliknij link do profilu → sprawdź czy nawigacja działa

### Flow 3: Rejestracja (bez wysyłki)
1. Otwórz `/register`
2. Wypełnij krok 1 testowymi danymi: name="Test Roaster", email="test@qa.example.com", city="Warsaw", country="Poland"
3. Kliknij "Next" → sprawdź czy przeszło do kroku 2
4. Sprawdź walidację: wyczyść wymagane pole i spróbuj przejść dalej → oczekiwany błąd walidacji
5. **NIE wysyłaj formularza** — zatrzymaj na kroku 2

---

## Krok 4: Dokumentuj problemy

Format każdego znalezionego problemu:

```
[SEVERITY] Strona: /ścieżka
Problem: opis co nie działa lub wygląda źle
Reprodukcja: krok po kroku lub viewport
Dowód: screenshot/snapshot reference lub log konsoli
```

Severity:
- **CRITICAL** — strona nie działa, dane nie ładują się, błąd blokujący użytkownika
- **HIGH** — poważny bug UX, złamany layout na popularnym viewport, failed API call
- **MEDIUM** — kosmetyczny problem wpływający na odbiór, console.error, missing alt
- **LOW** — drobna niedoskonałość, nice-to-have

Kategoria **GAPS** (osobna, nie severity):
- Brakująca funkcja która powinna istnieć według UI
- Niedokończona implementacja widoczna dla użytkownika
- Niespójność między tym co widać a tym co powinno działać

---

## Krok 5: Zapisz raport

Zapisz w `.tmp/audit-YYYY-MM-DD.md`:

```markdown
# Site Audit — YYYY-MM-DD
**URL:** [base URL]
**Przejrzane strony:** N
**Viewports:** desktop (1440px), tablet (768px), mobile (375px)
**Screenshoty:** `.tmp/screenshots/audit-YYYY-MM-DD/`

## Podsumowanie
- CRITICAL: N
- HIGH: N
- MEDIUM: N
- LOW: N
- GAPS: N

## Issues

### CRITICAL
- [ ] [opis] — `/ścieżka` — [viewport jeśli dotyczy]

### HIGH
- [ ] [opis] — `/ścieżka`

### MEDIUM
- [ ] [opis] — `/ścieżka`

### LOW
- [ ] [opis] — `/ścieżka`

## Gaps (brakujące funkcje lub niedokończone implementacje)
- [ ] [FEATURE] opis czego brakuje — `/ścieżka`

## SEO
| Strona | Title | Description | H1 | Imgs bez alt |
|--------|-------|-------------|----|--------------|
| / | ✅/❌ | ✅/❌ | N | N |

## Logi konsoli
| Strona | Errors | Warnings |
|--------|--------|----------|
| / | N | N |

## Screenshoty
[lista plików zapisanych do .tmp/screenshots/audit-YYYY-MM-DD/]
```

---

## Krok 6: Podsumuj użytkownikowi

Przedstaw:
1. Liczby: X stron przejrzanych, N problemów (CRITICAL/HIGH/MEDIUM/LOW/GAPS)
2. Top 3 najpilniejsze issues
3. Wyniki SEO — jakie strony mają braki
4. Wyniki przepływów — czy wszystkie 3 przeszły
5. Ścieżka do pełnego raportu: `.tmp/audit-YYYY-MM-DD.md`
6. Opcja: "Czy chcesz żebym dodał CRITICAL i HIGH issues do ROADMAP?"

---

## Opcja: Dodaj issues do ROADMAP

Jeśli użytkownik potwierdzi — dodaj znalezione CRITICAL i HIGH issues do sekcji NOW lub NEXT w `ROADMAP.md`:

```markdown
- [ ] [BUG] opis problemu znalezionego w audycie (audit YYYY-MM-DD)
```

NIE dodawaj automatycznie bez potwierdzenia użytkownika.

---

## Guardrails

- Nie loguj się do admina — testuj tylko publiczne strony (chyba że użytkownik poda credentials)
- Nie klikaj "Usuń", "Wyślij", "Submit" ani żadnych destruktywnych akcji
- Jeśli strona wymaga danych (formularze) — użyj testowych danych, nie produkcyjnych
- Screenshoty zapisuj do `.tmp/screenshots/audit-YYYY-MM-DD/` (gitignored)
- Console errors z Clerk devmode ("Clerk has been loaded...") — ignoruj
- Console errors z Next.js dev overlay — ignoruj; liczy się tylko produkcja lub preview
- Jeśli Playwright MCP niedostępny — uruchom tylko `python tools/smoke_test.py` jako fallback i poinformuj o ograniczeniach
