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

## Branch Strategy — ZŁOTA REGUŁA

**PO KAŻDEJ zmianie kodu lub bazy danych — wynik ZAWSZE na nowym branchu.**
**NIGDY nie commituj i nie pushuj bezpośrednio do `main`.**

Dotyczy WSZYSTKICH workerów: `@MN`, `@KK`, `@AGENT`.

**Procedura:**
1. Przed zmianami: ustal branch (`feat/agent-YYYY-WW` dla agenta, `feat/mn-*` / `feat/kk-*` dla ludzi)
2. Cała praca tylko na branchu
3. Push tylko na branch — nigdy na main
4. Merge tylko przez PR po review

**Wyjątek:** `git checkout main && git pull` — tylko po to żeby zaktualizować lokalny main.

---

## Branch Strategy (szczegóły)

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

## Multi-Worker Coordination

Trzech workerów operuje na tym repo:
- **@MN** (Marek Nadra, marek.nadra@gmail.com) — sesje manualne + scheduled agent (nocny)
- **@KK** (Krzysztof Kuczkowski) — sesje manualne + scheduled agent (wieczorny)
- **@AGENT** — scheduled agent (autonomiczny, uruchamiany przez MN lub KK)

### Task Ownership (ROADMAP.md)

Zadania mają tagi assignee: `(@MN)`, `(@KK)`, `(@AGENT)`, `(@UNASSIGNED)`.

- **Pracuj TYLKO na zadaniach przypisanych do Ciebie** (lub `@UNASSIGNED` jeśli jesteś agentem)
- Aby wziąć zadanie: zmień `(@UNASSIGNED)` na swój tag w ROADMAP.md
- Status inline: `[IN PROGRESS]`, `[BLOCKED: reason]` — przed tagiem assignee

### Agent Task Selection (OBOWIĄZKOWE)

1. Skanuj `[ ]` w NOW/NEXT
2. Bierz TYLKO `(@AGENT)` lub `(@UNASSIGNED)` lub brak tagu
3. **NIGDY** nie ruszaj zadań `(@MN)` lub `(@KK)`
4. SKIP `[IN PROGRESS]` i `[BLOCKED]`
5. Przy claimowaniu `@UNASSIGNED` → zmień na `(@AGENT)` ZANIM zaczniesz pracę
6. Brak zadań → zapisz w SESSION.md i zakończ sesję

### Branch Naming

| Worker | Pattern | Przykład |
|--------|---------|----------|
| Agent | `feat/agent-YYYY-WW` | `feat/agent-2026-14` |
| Marek | `feat/mn-<slug>` | `feat/mn-email-notifications` |
| Krzysztof | `feat/kk-<slug>` | `feat/kk-stripe-integration` |

### Dual-Schedule (obaj mogą uruchamiać agentów)

- **Nigdy dwa scheduled agents naraz** — rozdzielone okna czasowe
- MN: noce (01:00-06:00 CET) · KK: wieczory (19:00-23:00 CET)
- Obaj używają tego samego `feat/agent-YYYY-WW` branch
- Agent ZAWSZE robi `git pull origin $BRANCH` przed rozpoczęciem pracy

### PR Review Protocol

| PR | Reviewer | Metoda |
|----|----------|--------|
| `feat/agent-*` | MN lub KK | `/review-agent-branch` + SOP |
| `feat/mn-*` | KK | GitHub review |
| `feat/kk-*` | MN | GitHub review |

### Weekly Sync (poniedziałek, async OK)

1. Przegląd ROADMAP — przypisanie zadań na tydzień
2. Review otwartych PRs — merge lub close
3. Ustawienie `@AGENT` zadań na schedule
4. Uzgodnienie okien schedule na tydzień

### Agent Boundaries — co agent NIE może zmieniać

Agent autonomiczny (scheduled) **NIGDY** nie modyfikuje:
- `CLAUDE.md` — reguły procesu (zmienia tylko człowiek)
- `workflows/*.md` — SOPs (zmienia tylko człowiek)
- `.claude/settings.json` — config narzędzi
- `docs/architecture/*.md` — blueprint (wymaga human review)
- `PROJECT_STATUS.md` linie @MN / @KK w "Active Work"
- `ROADMAP.md` zadania z tagiem `(@MN)` lub `(@KK)`
- `docs/OVERVIEW.md` — indeks dokumentacji (zmienia przy dodaniu workflow/skilla — tylko człowiek)

Agent **MOŻE** aktualizować:
- `ROADMAP.md` — swoje zadania `[x]` + claim `(@UNASSIGNED)` → `(@AGENT)`
- `PROJECT_STATUS.md` — sekcje "What Is Deployed", "Active Work" (linia @AGENT), "Next Unblocked Task"
- `web/AGENTS.md` — tabela wersji (jeśli zmieni się pakiet)

### Morning Integration (flow poranny)

Po sesji nocnego agenta — rano:

```
1. git fetch origin
2. git log main..origin/feat/agent-YYYY-WW --oneline
   → Brak nowych commitów? SKIP.
3. Otwórz PR w GitHub → sprawdź diff
4. /review-agent-branch — weryfikacja claim ↔ kod
5. Sprawdź CI checks (lint + tsc + test + build)
6. Merge PR via GitHub (squash lub merge commit)
7. git checkout main && git pull
```

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

## Post-Task Checklist (OBOWIĄZKOWE — gate przed commitem)

Po KAŻDYM ukończonym zadaniu — **ZANIM** powiesz że skończyłeś:
1. Uruchom `/lint-and-validate` — **STOP** jeśli lint lub tsc fails
2. `ROADMAP.md` — zaznacz `[ ]` → `[x]` przy wykonanym zadaniu
3. `PROJECT_STATUS.md` — zaktualizuj "Active Work" i "Next Unblocked Task"
4. Jeśli stworzono nowy plik/katalog — usuń go z "Does NOT Exist Yet"
5. **Wersja** — jeśli zmiana jest widoczna dla użytkownika, podbij `npm run version:patch` w `web/`
6. **Uruchom consistency check** — `python tools/consistency_check.py`
   - Jeśli FAIL na C1/C2/C3/C4/C7/C11 → **napraw PRZED commitem**
   - Jeśli FAIL na C11 (ROADMAP `[x]` ≠ kod) → cofnij `[x]` lub napraw kod
7. **Commituj WSZYSTKO w jednym commicie** — kod + aktualizacja stanu docs

**ZASADA: `[x]` w ROADMAP.md = kontrakt. Brak fizycznego dowodu w kodzie = błąd.**

**Konwencja commitów:** `[SCOPE] action: description` — scopes: `DB|AUTH|ACTION|UI|SEED|INFRA|DOCS|AGENT`
**Commituj aktualizację stanu W TYM SAMYM COMMICIE co zadanie, nie osobno.**

---

## Consistency Rules (zapobieganie driftowi)

**Reguła 1 — ISR:** Każda nowa strona z `db.*` MUSI mieć `export const revalidate = 3600`.
**Reguła 2 — Revalidation:** Każdy Server Action zmieniający dane MUSI wywołać `revalidatePath()` dla wszystkich stron wyświetlających te dane. Patrz pełna lista w `web/AGENTS.md`.
**Reguła 3 — Docs arch. ≠ rzeczywistość:** NIE traktuj `docs/architecture/` jako source of truth. To blueprint, nie dokumentacja stanu. Rzeczywistość → `PROJECT_STATUS.md`.
**Reguła 4 — Nie dokumentuj przyszłości jako teraźniejszości:** W `PROJECT_STATUS.md` wpisuj TYLKO to co istnieje w kodzie. Plany → `ROADMAP.md`.
**Reguła 5 — `[x]` = dowód w kodzie:** Każdy `[x]` w ROADMAP.md MUSI mieć fizyczny dowód w kodzie (istniejący plik, import, wywołanie funkcji, komponent). Consistency check C11 weryfikuje to automatycznie. Jeśli C11 FAIL → `[x]` jest nieprawidłowy i musi zostać cofnięty lub kod naprawiony.

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

### CI/CD & GitHub Actions

Pełna dokumentacja procesów CI/CD: [`docs/github-workflows.md`](docs/github-workflows.md)

| Workflow | Trigger | Cel |
|----------|---------|-----|
| `preview-db.yml` | PR opened/sync | Tworzy izolowaną bazę Neon + Vercel Preview |
| `production-deploy.yml` | Push to main | Migracje + Seed na produkcji |
| `ci.yml` | PR to main | Lint, TypeScript, Tests |

**Każdy PR dostaje własną bazę danych.** Szczegóły w dokumentacji.
