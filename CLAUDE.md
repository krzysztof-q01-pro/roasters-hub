# Agent Instructions

## Scheduled Run Entry Point

Jeśli budzisz się ze scheduled task (loop, cron, remote trigger):
1. **NAJPIERW czytaj:** `.tmp/SESSION.md` (jeśli istnieje) → `PROJECT_STATUS.md` → `ROADMAP.md`
2. **POTEM uruchom:** `/scheduled-run` — kompletny SOP co robić dalej
3. **NIE czytaj** całej dokumentacji arch. — tylko jeśli potrzebne do bieżącego zadania

Uprawnienia do narzędzi (git, npm, Read, Write) są auto-approved w `.claude/settings.json`.

---

## Scheduled Run — Branch Strategy

Agenty autonomiczne (nocne/scheduled) **MUSZĄ** pracować na tygodniowym feature branchu:

**Schemat nazewnictwa:** `feat/agent-YYYY-WW` (ISO week, np. `feat/agent-2026-13`)

```bash
YEAR=$(date +%Y) && WEEK=$(date +%V) && BRANCH="feat/agent-${YEAR}-${WEEK}"
git fetch origin
git ls-remote --exit-code --heads origin "$BRANCH" > /dev/null 2>&1 \
  && (git checkout "$BRANCH" && git pull origin "$BRANCH") \
  || (git checkout main && git pull origin main && git checkout -b "$BRANCH")
```

- Cała praca w tym samym tygodniu ISO trafia na **ten sam branch** — jedna PR per tydzień
- NIGDY nie commituj bezpośrednio do main
- Po zakończeniu pracy: `git push origin "$BRANCH"` + uruchom `bash tools/create_agent_pr.sh`

**Review brancha przed merge:** Czytaj `workflows/review_agent_branch.md` — kompletny SOP.
Kluczowe: każde `[x]` w ROADMAP musi mieć fizyczny dowód w kodzie (istniejący plik, import, wywołanie).

---

## Post-Task Checklist (OBOWIĄZKOWE po każdym wykonanym zadaniu)

Po KAŻDYM ukończonym zadaniu — zanim powiesz użytkownikowi że skończyłeś:
1. `ROADMAP.md` — zaznacz `[ ]` → `[x]` przy wykonanym zadaniu
2. `PROJECT_STATUS.md` — zaktualizuj "Active Work" i "Next Unblocked Task"
3. Jeśli stworzono nowy plik/katalog — usuń go z "Does NOT Exist Yet"
4. **Wersja** — jeśli zmiana jest widoczna dla użytkownika, podbij `npm run version:patch` w `web/`

**Commituj aktualizację stanu W TYM SAMYM COMMICIE co zadanie, nie osobno.**

---

## Consistency Rules (zapobieganie driftowi)

**Reguła 1 — ISR:** Każda nowa strona z `db.*` MUSI mieć `export const revalidate = 3600`.
**Reguła 2 — Revalidation:** Każdy Server Action zmieniający dane MUSI wywołać `revalidatePath()` dla wszystkich stron wyświetlających te dane. Patrz pełna lista w `web/AGENTS.md`.
**Reguła 3 — Docs arch. ≠ rzeczywistość:** NIE traktuj `docs/architecture/` jako source of truth. To blueprint, nie dokumentacja stanu. Rzeczywistość → `PROJECT_STATUS.md`.
**Reguła 4 — Nie dokumentuj przyszłości jako teraźniejszości:** W `PROJECT_STATUS.md` wpisuj TYLKO to co istnieje w kodzie. Plany → `ROADMAP.md`.

---

## Codebase Quick Reference

**Ground truth:** Czytaj `/PROJECT_STATUS.md` jako PIERWSZE — opisuje rzeczywistość, nie intencję.
**Zadania:** `/ROADMAP.md` — kanoniczne źródło stanu zadań (NOW / NEXT / LATER / DONE).
**Nawigacja docs:** `/docs/OVERVIEW.md` — mapa do całej dokumentacji.

| Obszar | Gdzie szukać |
|--------|-------------|
| Aplikacja web | `web/` — Next.js app |
| Instrukcje agenta (web) | `web/AGENTS.md` |
| Architektura techniczna | `docs/architecture/` |
| Design UI/UX | `docs/design/stitch-brief.md` |
| Narzędzia Python | `tools/` + `tools/README.md` |
| Kontrola spójności | `workflows/consistency_check.md` + `tools/consistency_check.py` |
| Workflow SOPs | `workflows/` |

---

## WAT Framework

Projekt używa architektury Workflows → Agents → Tools:
- `workflows/` — Markdown SOPs (cel, wejście, narzędzia, obsługa błędów)
- `tools/` — Python scripts (deterministyczne wykonanie: API, DB, pliki)

Przed każdym nowym zadaniem sprawdź `tools/` — jeśli tool istnieje, użyj go zamiast robić ręcznie. Gdy coś się psuje: napraw script → zweryfikuj → zaktualizuj workflow. Nie twórz ani nie nadpisuj workflows bez pytania.
