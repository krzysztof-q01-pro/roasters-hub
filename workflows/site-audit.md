# Site Audit — Workflow SOP

Kompletny cykl życia auditu wizualnego strony: od uruchomienia przez tracking po cleanup.

## Kiedy uruchamiać

- Przed każdym launch checkpointem (Phase boundary)
- Na żądanie developera po większych zmianach UI
- Po zamknięciu wszystkich issues z poprzedniego auditu (nowy cykl)

## Dane wejściowe

- Działający serwer: `localhost:3000` (dev) lub Vercel preview URL
- Dev server: `cd web && npm run dev` (lub upewnij się że działa w tle)

## Jak uruchomić

```
/site-audit
```

Skill Playwright MCP automatycznie:
1. Przechodzi przez kluczowe strony (/, /roasters, /roasters/[slug], /map, /admin/pending, /sign-in)
2. Testuje viewporty: desktop (1440px), tablet (768px), mobile (375px)
3. Zapisuje screenshoty do `.tmp/screenshots/audit-YYYY-MM-DD/`
4. Generuje raport `.tmp/audit-YYYY-MM-DD.md` z issues podzielonymi na CRITICAL / HIGH / MEDIUM / LOW

## Po audicie — obowiązkowe kroki

Po każdym uruchomieniu site-audit **MUSISZ** wykonać:

1. **ROADMAP.md** — dodaj issues do odpowiednich sekcji:
   - CRITICAL + HIGH → sekcja `NOW` (max 5 zadań łącznie w NOW)
   - MEDIUM + LOW → sekcja `LATER — Phase 2`
   - Format: `- [ ] [P0/P1] **Opis** — strona, viewport`
   - Dołącz linię `Dowód: .tmp/screenshots/audit-DATE/plik.png` dla kluczowych issues

2. **PROJECT_STATUS.md** — zaktualizuj:
   - `Active Work` — wymień liczbę i kategorie issues (CRITICAL/HIGH/MEDIUM+LOW)
   - `Next Unblocked Task` — wskaż pierwszy CRITICAL/HIGH do naprawy

3. **Raport auditu** — zostaje w `.tmp/audit-YYYY-MM-DD.md` do momentu zamknięcia WSZYSTKICH issues
   - Zaznaczaj `- [x]` w raporcie gdy issue zostanie naprawione w kodzie
   - Raport jest dowodem — nie usuwaj go przed zakończeniem wszystkich `- [ ]`

## Reguły retencji i cleanup

### Screenshoty

**Reguła:** Screenshoty w `.tmp/screenshots/audit-DATE/` są potrzebne TYLKO jako dowód issues.
Gdy **wszystkie** `- [ ]` w `.tmp/audit-DATE.md` zamieniono na `- [x]` → katalog screenshotów można usunąć.

Detekcja automatyczna przez `python tools/consistency_check.py` (check C10):
```bash
python tools/consistency_check.py        # wykryje orphan screenshots
python tools/consistency_check.py --fix all  # usunie je automatycznie
```

### Raporty audit

**Reguła:** Trzymaj TYLKO najnowszy raport `.tmp/audit-*.md`. Stare usuwa C10 przy `--fix all`.

Wyjątek: jeśli stary raport ma niezamknięte `- [ ]` → C10 go NIE usunie (zachowuje jako aktywne issues).

### Inne pliki w .tmp/

- `SESSION.md` — nadpisywany co sesję, nie archiwizować
- `*.pdf`, `qr-*.png` — manualne, nie dotykaj
- `screenshots/` — zarządzane przez C10

## Weryfikacja po naprawieniu issues

Po naprawieniu issue w kodzie:
1. Otwórz `.tmp/audit-DATE.md`
2. Zamień `- [ ]` → `- [x]` dla naprawionego issue
3. Uruchom `python tools/consistency_check.py` — sprawdzi czy screenshoty można wyczyścić

Gdy wszystkie issues zamknięte:
```bash
python tools/consistency_check.py --fix all
# Usunie: .tmp/screenshots/audit-DATE/ (orphan screenshots)
# Usunie: stare .tmp/audit-*.md (jeśli jest nowszy raport)
```

## Powiązane pliki

- `workflows/consistency_check.md` — SOP dla consistency_check.py (C10)
- `tools/consistency_check.py` — implementacja C10 (audit cleanup)
- `.tmp/audit-*.md` — aktywne raporty auditu
- `.tmp/screenshots/audit-*/` — screenshoty do aktywnych auditów
