---
name: site-audit
description: Use when systematically testing the website, reviewing pages visually for bugs and UX issues, auditing design quality, collecting issues to fix, or running a QA pass before merging. Requires Playwright MCP — see Prerequisites below.
context: fork
argument-hint: "[URL — opcjonalnie, np. https://roasters-hub.vercel.app]"
---

## Co robi ten skill

Przechodzi przez wszystkie kluczowe strony aplikacji, analizuje je wizualnie i funkcjonalnie, i zbiera listę problemów do naprawy w `.tmp/audit-YYYY-MM-DD.md`.

Wynik: raport z podzielonymi priorytetami (CRITICAL / HIGH / MEDIUM / LOW) gotowy do wklejenia do ROADMAP.

---

## Prerequisites: Playwright MCP

Ten skill wymaga Playwright MCP. Jeśli nie jest zainstalowany:

```bash
# Instalacja (jednorazowo)
claude mcp add playwright npx @playwright/mcp@latest
```

Sprawdź czy dostępny: jeśli narzędzia `playwright_navigate`, `playwright_screenshot` nie są w toolsecie — zatrzymaj i poinformuj użytkownika o instalacji.

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
3. Zrób snapshot accessibility tree (domyślnie) lub screenshot (jeśli potrzebna analiza wizualna)
4. Przeanalizuj według checklisty dla tej strony
5. Zanotuj wszystkie problemy z severity i lokalizacją

### Lista stron do sprawdzenia

| Strona | URL | Priorytet |
|--------|-----|-----------|
| Homepage | `{BASE}/` | P1 |
| Katalog palarni | `{BASE}/roasters` | P1 |
| Profil palarni | `{BASE}/roasters/[pierwszy-slug]` | P1 |
| Mapa | `{BASE}/map` | P1 |
| Admin pending | `{BASE}/admin/pending` | P2 |

Aby znaleźć pierwszy slug: przejdź do `/roasters`, kliknij pierwszą palarnię.

---

## Krok 3: Checklist analizy każdej strony

### Funkcjonalność
- [ ] Strona ładuje się bez błędów (brak 404, 500, białego ekranu)
- [ ] Wszystkie linki nawigacyjne działają
- [ ] Dane ładują się poprawnie (nie ma "undefined", "null", pustych sekcji)
- [ ] Interaktywne elementy reagują (przyciski, filtry, formularze)
- [ ] Zdjęcia/ikony ładują się (brak broken image placeholder)

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

### Specyficzne dla roasters-hub
- [ ] Liczba palarni na homepage zgadza się z katalogiem
- [ ] Filtry na `/roasters` działają (jeśli zaimplementowane)
- [ ] Mapa wyświetla markery (nie pusta mapa)
- [ ] Profil palarni pokazuje wszystkie sekcje (info, certyfikaty, produkty)
- [ ] Admin `/pending` wymaga autoryzacji (redirect do login jeśli niezalogowany)

---

## Krok 4: Dokumentuj problemy

Format każdego znalezionego problemu:

```
[SEVERITY] Strona: /ścieżka
Problem: opis co nie działa lub wygląda źle
Reprodukcja: krok po kroku lub viewport
Dowód: screenshot/snapshot reference
```

Severity:
- **CRITICAL** — strona nie działa, dane nie ładują się, błąd blokujący
- **HIGH** — poważny bug UX, złamany layout na popularnym viewport
- **MEDIUM** — kosmetyczny problem wpływający na odbiór
- **LOW** — drobna niedoskonałość, nice-to-have

---

## Krok 5: Zapisz raport

Zapisz w `.tmp/audit-YYYY-MM-DD.md`:

```markdown
# Site Audit — YYYY-MM-DD
**URL:** [base URL]
**Przejrzane strony:** N
**Viewports:** desktop (1440px), tablet (768px), mobile (375px)

## Podsumowanie
- CRITICAL: N
- HIGH: N
- MEDIUM: N
- LOW: N

## Issues

### CRITICAL
- [ ] [opis] — `/ścieżka` — [viewport jeśli dotyczy]

### HIGH
- [ ] [opis] — `/ścieżka`

### MEDIUM
- [ ] [opis] — `/ścieżka`

### LOW
- [ ] [opis] — `/ścieżka`

## Screenshoty
[lista plików jeśli zapisano do .tmp/screenshots/]
```

---

## Krok 6: Podsumuj użytkownikowi

Przedstaw:
1. Liczby: X stron przejrzanych, N problemów (X/Y/Z/W wg severity)
2. Top 3 najpilniejsze issues
3. Ścieżka do pełnego raportu: `.tmp/audit-YYYY-MM-DD.md`
4. Opcja: "Czy chcesz żebym dodał CRITICAL i HIGH issues do ROADMAP?"

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
- Nie klikaj "Usuń", "Wyślij" ani żadnych destruktywnych akcji
- Jeśli strona wymaga danych (formularze) — użyj testowych danych, nie produkcyjnych
- Screenshoty zapisuj do `.tmp/screenshots/audit-YYYY-MM-DD/` (gitignored)
- Jeśli Playwright MCP niedostępny — uruchom tylko `python tools/smoke_test.py` jako fallback i poinformuj o ograniczeniach
