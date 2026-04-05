# Unified Agent Protocol Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zunifikować warstwę bezpieczeństwa między AI tools (Claude Code + OpenCode) przez dodanie guardrails do AGENTS.md, aktualizację CLAUDE.md, nowy check C12 w consistency_check.py, cleanup .tmp/ i aktualizację docs/OVERVIEW.md.

**Architecture:** AGENTS.md dostaje 3 nowe sekcje bezpieczeństwa na górze pliku (forbidden ops, multi-worker, session end). CLAUDE.md dostaje cross-reference do AGENTS.md i dwa nowe wiersze w tabeli skills. consistency_check.py dostaje check C12 weryfikujący obecność guardrails. Wszystkie zmiany w jednym commicie.

**Tech Stack:** Python (consistency_check.py), Markdown (AGENTS.md, CLAUDE.md, docs/OVERVIEW.md), Bash (cleanup .tmp/)

---

## Files Modified

| Plik | Typ zmiany |
|------|-----------|
| `AGENTS.md` | Dodać 3 sekcje na górze pliku |
| `CLAUDE.md` | 2 drobne aktualizacje tabel |
| `tools/consistency_check.py` | Dodać funkcję check_c12() + rejestracja |
| `docs/OVERVIEW.md` | Zaktualizować sekcję Skills |
| `.tmp/` | Cleanup: archiwizacja + usunięcia |

---

## Task 1: AGENTS.md — dodać 3 sekcje bezpieczeństwa

**Files:**
- Modify: `AGENTS.md` (beginning of file, before line 1)

- [ ] **Step 1: Dodaj sekcje na górze AGENTS.md**

Otwórz `AGENTS.md`. Obecna pierwsza linia to:
```
# Agent Instructions — BeenMap (OpenCode)
```

Wstaw **po tej linii nagłówka i istniejącym bloku opisowym** (po linii 4 `> Pełne reguły procesu → CLAUDE.md (czytaj jako pierwsze).`), przed sekcją `## Orientacja`:

```markdown
## ⛔ FORBIDDEN — Never execute these commands

### Database — ABSOLUTELY FORBIDDEN on production
- `prisma db push` — bypasses migration tracking, can corrupt production data
- `prisma db seed` without explicit human instruction — risk of duplicate data
- `prisma migrate resolve --applied` — marks migrations as done without executing SQL
- `prisma migrate reset` — drops and recreates the database
- Any direct SQL on DATABASE_URL / DIRECT_URL without explicit human approval

### Git — FORBIDDEN
- `git push origin main` — direct push to main is blocked by branch-guard.sh
- `git commit --no-verify` — bypasses consistency checks
- `git push --force` on any branch with open PR

---

## Multi-Worker Coordination

Three workers operate on this repo:
- **@MN** (Marek Nadra) — manual sessions
- **@KK** (Krzysztof Kuczkowski) — manual sessions
- **@AGENT** — autonomous (scheduled, nocny/wieczorny)

**Task ownership (ROADMAP.md):**
- Work ONLY on tasks tagged (@AGENT), (@UNASSIGNED), or untagged
- NEVER modify tasks tagged (@MN) or (@KK)
- Before starting: change @UNASSIGNED → @AGENT

**Branch naming:**
| Worker | Pattern | Example |
|--------|---------|---------|
| Agent | `feat/agent-YYYY-WW` | `feat/agent-2026-14` |
| Marek | `feat/mn-<slug>` | `feat/mn-email-fix` |
| Krzysztof | `feat/kk-<slug>` | `feat/kk-admin-panel` |

**NEVER commit directly to main.**

---

## Session End — Required

Before ending any session, write/update `.tmp/SESSION.md`:

```markdown
## Session YYYY-MM-DD

### Started with
- <task description>

### Completed
- <list of completed items>

### Tested
- lint ✅/❌, tsc ✅/❌, build ✅/❌

### Blocked
- <list of blockers or "none">

### Next
- <recommended next task>

### Metadata
- Branch: feat/...
- PR: #<number> or "not yet created"
```

---
```

Konkretnie: Edit `AGENTS.md` — `old_string` to istniejący blok po nagłówku:

```
> Ten plik jest odpowiednikiem CLAUDE.md dla OpenCode i innych agentów.
> Pełne reguły procesu → CLAUDE.md (czytaj jako pierwsze).

## Orientacja (KAŻDA sesja)
```

`new_string`:

```
> Ten plik jest odpowiednikiem CLAUDE.md dla OpenCode i innych agentów.
> Pełne reguły procesu → CLAUDE.md (czytaj jako pierwsze).

---

## ⛔ FORBIDDEN — Never execute these commands

### Database — ABSOLUTELY FORBIDDEN on production
- `prisma db push` — bypasses migration tracking, can corrupt production data
- `prisma db seed` without explicit human instruction — risk of duplicate data
- `prisma migrate resolve --applied` — marks migrations as done without executing SQL
- `prisma migrate reset` — drops and recreates the database
- Any direct SQL on DATABASE_URL / DIRECT_URL without explicit human approval

### Git — FORBIDDEN
- `git push origin main` — direct push to main is blocked by branch-guard.sh
- `git commit --no-verify` — bypasses consistency checks
- `git push --force` on any branch with open PR

---

## Multi-Worker Coordination

Three workers operate on this repo:
- **@MN** (Marek Nadra) — manual sessions
- **@KK** (Krzysztof Kuczkowski) — manual sessions
- **@AGENT** — autonomous (scheduled, nocny/wieczorny)

**Task ownership (ROADMAP.md):**
- Work ONLY on tasks tagged (@AGENT), (@UNASSIGNED), or untagged
- NEVER modify tasks tagged (@MN) or (@KK)
- Before starting: change @UNASSIGNED → @AGENT

**Branch naming:**
| Worker | Pattern | Example |
|--------|---------|---------|
| Agent | `feat/agent-YYYY-WW` | `feat/agent-2026-14` |
| Marek | `feat/mn-<slug>` | `feat/mn-email-fix` |
| Krzysztof | `feat/kk-<slug>` | `feat/kk-admin-panel` |

**NEVER commit directly to main.**

---

## Session End — Required

Before ending any session, write/update `.tmp/SESSION.md`:

\`\`\`markdown
## Session YYYY-MM-DD

### Started with
- <task description>

### Completed
- <list of completed items>

### Tested
- lint ✅/❌, tsc ✅/❌, build ✅/❌

### Blocked
- <list of blockers or "none">

### Next
- <recommended next task>

### Metadata
- Branch: feat/...
- PR: #<number> or "not yet created"
\`\`\`

---

## Orientacja (KAŻDA sesja)
```

- [ ] **Step 2: Zweryfikuj AGENTS.md**

```bash
head -80 AGENTS.md
```

Expected: widoczne `## ⛔ FORBIDDEN`, `## Multi-Worker Coordination`, `## Session End — Required` przed `## Orientacja`.

---

## Task 2: CLAUDE.md — 2 aktualizacje tabel

**Files:**
- Modify: `CLAUDE.md` (lines ~154, ~232)

- [ ] **Step 1: Dodaj wiersz do tabeli Skills — Obowiązkowe**

Obecna tabela (linie 149–154 w CLAUDE.md):
```
| Kiedy | Skill | Uwaga |
|-------|-------|-------|
| Po KAŻDEJ zmianie kodu | `/lint-and-validate` | NIE commituj jeśli lint/tsc fails |
| Złożone zadanie (>5 tool calls) | `/planning-with-files` | Tworzy task_plan.md + progress.md w .tmp/ |
| Bug lub test failure | `/systematic-debugging` | PRZED proponowaniem jakiegokolwiek fixa |
| Start sesji autonomicznej | `/consistency-check` | Po orientacji, przed kodowaniem |
```

Zamień na (dodaj 2 wiersze na końcu tabeli):
```
| Kiedy | Skill | Uwaga |
|-------|-------|-------|
| Po KAŻDEJ zmianie kodu | `/lint-and-validate` | NIE commituj jeśli lint/tsc fails |
| Złożone zadanie (>5 tool calls) | `/planning-with-files` | Tworzy task_plan.md + progress.md w .tmp/ |
| Bug lub test failure | `/systematic-debugging` | PRZED proponowaniem jakiegokolwiek fixa |
| Start sesji autonomicznej | `/consistency-check` | Po orientacji, przed kodowaniem |
| Przed claimem "done" | `/superpowers:verification-before-completion` | NIE commituj bez weryfikacji |
| Koniec feature branch | `/superpowers:finishing-a-development-branch` | po zakończeniu całej pracy |
```

- [ ] **Step 2: Dodaj wiersz do tabeli Codebase Quick Reference**

Obecna tabela (linie 223–232):
```
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
```

Dodaj wiersz po `| Workflow SOPs | \`workflows/\` |`:
```
| Agent rules (OpenCode) | `AGENTS.md` — safety guardrails dla wszystkich AI tools |
```

- [ ] **Step 3: Zweryfikuj CLAUDE.md**

```bash
grep -n "verification-before-completion\|finishing-a-development\|Agent rules" CLAUDE.md
```

Expected: 3 wyniki (2 nowe wiersze tabeli + 1 cross-reference).

---

## Task 3: tools/consistency_check.py — dodać C12

**Files:**
- Modify: `tools/consistency_check.py` (before line 1064 `ALL_CHECKS = [...]`)

- [ ] **Step 1: Dodaj funkcję check_c12()**

W pliku `tools/consistency_check.py`, przed linią `ALL_CHECKS = [...]` (linia 1064), wstaw nową funkcję:

`old_string`:
```python
ALL_CHECKS = [check_c1, check_c2, check_c3, check_c4, check_c5, check_c6, check_c7, check_c8, check_c9, check_c10, check_c11]
```

`new_string`:
```python
# ---------------------------------------------------------------------------
# C12: AGENTS.md Safety Sections
# ---------------------------------------------------------------------------

def check_c12() -> CheckResult:
    r = CheckResult("C12", "AGENTS.md Safety Sections", "IMPORTANT")

    agents = read_file("AGENTS.md")
    if not agents:
        r.fail("AGENTS.md not found — utwórz plik z guardrails bezpieczeństwa")
        return r

    missing = []

    if "FORBIDDEN" not in agents and "⛔" not in agents:
        missing.append("brak sekcji FORBIDDEN (⛔)")

    if "prisma db push" not in agents:
        missing.append("brak explicit zakazu 'prisma db push'")

    if "Multi-Worker" not in agents and "@MN" not in agents:
        missing.append("brak sekcji Multi-Worker Coordination")

    if "SESSION" not in agents:
        missing.append("brak protokołu Session End (SESSION)")

    if missing:
        r.fail(
            "AGENTS.md brakuje sekcji bezpieczeństwa: " + "; ".join(missing),
            auto_fixable=False,
        )

    return r


ALL_CHECKS = [check_c1, check_c2, check_c3, check_c4, check_c5, check_c6, check_c7, check_c8, check_c9, check_c10, check_c11, check_c12]
```

- [ ] **Step 2: Uruchom consistency check i sprawdź C12**

```bash
cd /workspaces/roasters-hub && python tools/consistency_check.py 2>&1 | python -c "import sys,json; d=json.load(sys.stdin); [print(c['id'], c['status'], c['details'][:60]) for c in d['checks'] if c['id'] in ('C12',)]"
```

Expected: `C12 PASS OK`

---

## Task 4: docs/OVERVIEW.md — aktualizacja sekcji Skills

**Files:**
- Modify: `docs/OVERVIEW.md` (linia 102)

- [ ] **Step 1: Zastąp linię Skills**

Obecna linia 102:
```
8 skilli w `.claude/skills/`: `scheduled-run`, `consistency-check`, `review-agent-branch`, `site-audit`, `frontend-design`, `planning-with-files`, `skill-builder`, `find-skills`
```

Zamień na:
```
Skille projektowe w `.claude/skills/`: `scheduled-run`, `consistency-check`, `review-agent-branch`, `site-audit`, `frontend-design`, `planning-with-files`, `skill-builder`, `find-skills`

Skille superpowers (globalne): `superpowers:verification-before-completion` — przed każdym "done"; `superpowers:finishing-a-development-branch` — koniec feature brancha; `superpowers:writing-plans` — planowanie przed kodowaniem; `superpowers:systematic-debugging` — każdy bug/failure; `superpowers:brainstorming` — zastępuje deprecated `superpowers:brainstorm`
```

- [ ] **Step 2: Zweryfikuj**

```bash
grep -A3 "## Skills" docs/OVERVIEW.md
```

Expected: widoczna aktualizacja z listą superpowers skilli.

---

## Task 5: .tmp/ cleanup

**Files:**
- Archive to: `docs/archive/audits/`
- Delete: kilka plików

- [ ] **Step 1: Utwórz katalog docelowy dla archiwum**

```bash
mkdir -p /workspaces/roasters-hub/docs/archive/audits
```

- [ ] **Step 2: Przenieś pliki do archiwum**

```bash
cd /workspaces/roasters-hub
mv .tmp/audit-2026-03-28.md docs/archive/audits/
mv .tmp/review-feat-mn-cafe-profiles.md docs/archive/audits/
mv .tmp/test-auto-flow.md docs/archive/audits/
mv .tmp/screenshots/audit-2026-03-28 docs/archive/audits/screenshots-audit-2026-03-28
```

- [ ] **Step 3: Usuń duplikaty i jednorazowe skrypty**

```bash
cd /workspaces/roasters-hub
rm .tmp/roasters_hub_business_overview.pdf
rm .tmp/cafe_addresses.json
rm .tmp/cafes_to_scrape.json
rm .tmp/scrape_cafes_nominatim.ts
rm .tmp/scrape_nominatim_v2.ts
```

- [ ] **Step 4: Zweryfikuj że właściwe pliki pozostały**

```bash
ls .tmp/
```

Expected: `SESSION.md`, `ux-quality-audit-2026-04-04.md`, `screenshots/` (z audit-2026-04-04), `qr-*.png`

---

## Task 6: Weryfikacja końcowa i commit

- [ ] **Step 1: Uruchom pełny consistency check**

```bash
cd /workspaces/roasters-hub && python tools/consistency_check.py 2>&1 | python -c "import sys,json; d=json.load(sys.stdin); [print(c['id'], c['status']) for c in d['checks']]; print('SUMMARY:', d['summary'])"
```

Expected: C12 PASS; brak nowych FAIL (C1-C11 stan bez zmian).

- [ ] **Step 2: Zweryfikuj AGENTS.md**

```bash
head -60 AGENTS.md
```

Expected: widoczne 3 nowe sekcje na górze.

- [ ] **Step 3: Zweryfikuj CLAUDE.md**

```bash
grep -c "verification-before-completion\|finishing-a-development" CLAUDE.md
```

Expected: `2`

- [ ] **Step 4: Zweryfikuj archiwum**

```bash
ls docs/archive/audits/
```

Expected: `audit-2026-03-28.md`, `review-feat-mn-cafe-profiles.md`, `test-auto-flow.md`, `screenshots-audit-2026-03-28/`

- [ ] **Step 5: Commit wszystkich zmian**

```bash
cd /workspaces/roasters-hub
git add AGENTS.md CLAUDE.md tools/consistency_check.py docs/OVERVIEW.md docs/archive/audits/ .tmp/
git commit -m "$(cat <<'EOF'
[DOCS] unified agent protocol — safety guardrails, C12 check, .tmp cleanup

- AGENTS.md: dodano sekcje FORBIDDEN, Multi-Worker Coordination, Session End
- CLAUDE.md: cross-reference do AGENTS.md + 2 nowe skille w tabeli Obowiązkowe
- tools/consistency_check.py: nowy check C12 (AGENTS.md safety sections)
- docs/OVERVIEW.md: zaktualizowana sekcja Skills o superpowers
- .tmp/: archiwizacja audit-2026-03-28 + usunięcie duplikatów i jednorazowych skryptów

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

Expected: commit bez błędów, C12 PASS w pre-commit hook.
