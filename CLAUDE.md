# Agent Instructions

## Entry Point (Scheduled / Autonomous)

**Bootstrap (czyste środowisko — nowy Codespace, agent nocny):**
1. `cd web && npm install` — instaluje zależności + generuje Prisma client (via postinstall)
2. MCP serwery (Playwright + Context7) są skonfigurowane w `.claude/settings.json` — startują automatycznie

**Orientacja (KAŻDA sesja):**
1. Czytaj `.tmp/SESSION.md` (jeśli istnieje) → `PROJECT_STATUS.md` → `ROADMAP.md`
2. Uruchom `/scheduled-run` — kompletny SOP co robić dalej
3. NIE czytaj dokumentacji arch. — tylko jeśli potrzebne do bieżącego zadania

Uprawnienia do narzędzi (git, npm, Read, Write) są auto-approved w `.claude/settings.json`.

---

## Branch Strategy

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

## Skills — Quick Reference

### Obowiązkowe (zawsze uruchamiaj)

| Kiedy | Skill | Uwaga |
|-------|-------|-------|
| Po KAŻDEJ zmianie kodu | `/lint-and-validate` | NIE commituj jeśli lint/tsc fails |
| Złożone zadanie (>5 tool calls) | `/planning-with-files` | Tworzy task_plan.md + progress.md w .tmp/ |
| Bug lub test failure | `/systematic-debugging` | PRZED proponowaniem jakiegokolwiek fixa |
| Start sesji autonomicznej | `/consistency-check` | Po orientacji, przed kodowaniem |

### Rekomendowane wg typu zadania

| Typ zadania | Skille |
|-------------|--------|
| UI / komponenty | `/frontend-design`, `/tailwind-patterns`, `/react-best-practices` |
| Nowe strony z danymi | `/nextjs-best-practices` (ISR, Server Components) |
| Formularze (nie signup) | `/form-cro` |
| SEO | `/seo-audit` |
| Pytania o biblioteki/frameworki | Context7 MCP (`resolve-library-id` → `query-docs`) |
| QA przed merge | `/site-audit` (wymaga Playwright MCP) |
| Commit + push | `/git-pushing` |
| Review brancha agenta | `/review-agent-branch` |

<!-- Aktualizuj tę tabelę po dodaniu/usunięciu skilli. Lista: .claude/skills/ -->

---

## Post-Task Checklist (OBOWIĄZKOWE po każdym zadaniu)

Po KAŻDYM ukończonym zadaniu — zanim powiesz użytkownikowi że skończyłeś:
1. Uruchom `/lint-and-validate` — **NIE commituj** jeśli lint lub tsc fails
2. `ROADMAP.md` — zaznacz `[ ]` → `[x]` przy wykonanym zadaniu
3. `PROJECT_STATUS.md` — zaktualizuj "Active Work" i "Next Unblocked Task"
4. Jeśli stworzono nowy plik/katalog — usuń go z "Does NOT Exist Yet"
5. **Wersja** — jeśli zmiana jest widoczna dla użytkownika, podbij `npm run version:patch` w `web/`

**Konwencja commitów:** `[SCOPE] action: description` — scopes: `DB|AUTH|ACTION|UI|SEED|INFRA|DOCS|AGENT`
**Commituj aktualizację stanu W TYM SAMYM COMMICIE co zadanie, nie osobno.**

---

## Consistency Rules (zapobieganie driftowi)

**Reguła 1 — ISR:** Każda nowa strona z `db.*` MUSI mieć `export const revalidate = 3600`.
**Reguła 2 — Revalidation:** Każdy Server Action zmieniający dane MUSI wywołać `revalidatePath()` dla wszystkich stron wyświetlających te dane. Patrz pełna lista w `web/AGENTS.md`.
**Reguła 3 — Docs arch. ≠ rzeczywistość:** NIE traktuj `docs/architecture/` jako source of truth. To blueprint, nie dokumentacja stanu. Rzeczywistość → `PROJECT_STATUS.md`.
**Reguła 4 — Nie dokumentuj przyszłości jako teraźniejszości:** W `PROJECT_STATUS.md` wpisuj TYLKO to co istnieje w kodzie. Plany → `ROADMAP.md`.

---

## Error Recovery

| Problem | Akcja |
|---------|-------|
| `npx tsc --noEmit` fails | Napraw błędy typów; NIE commituj zepsutego kodu |
| Lint fails, nie da się auto-fix | Przeczytaj błąd, napraw ręcznie, uruchom ponownie |
| `npm run build` fails | Sprawdź output; NIE commituj; zapisz w SESSION.md |
| Consistency C1 FAIL (manual) | Sprawdź `git log --oneline -10`; napraw ręcznie ROADMAP↔STATUS |
| Consistency C5/C6 (human) | Zapisz w SESSION.md; kontynuuj — NIE próbuj naprawiać |
| MCP server niedostępny | Kontynuuj bez niego; zapisz w SESSION.md |
| Brak credentials/secrets | **STOP.** Zapisz w SESSION.md. Zakończ sesję. |

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
| Skills (projektowe) | `.claude/skills/` |
| Kontrola spójności | `workflows/consistency_check.md` + `tools/consistency_check.py` |
| Workflow SOPs | `workflows/` |

**WAT Framework:** Projekt używa Workflows → Agents → Tools. Sprawdź `tools/` przed ręcznym budowaniem czegokolwiek. Sprawdź `workflows/` dla SOPs. Nie twórz ani nie nadpisuj workflows bez pytania.
