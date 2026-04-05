# Unified Agent Protocol — Design Spec

**Date:** 2026-04-05  
**Author:** @MN  
**Status:** Approved — ready for implementation

---

## Context

Projekt używa dwóch AI tools naprzemiennie: Claude Code (czyta `CLAUDE.md`) i OpenCode (czyta `AGENTS.md`). W tygodniu 2026-W13/14 agent OpenCode wykonał `prisma db push` bezpośrednio na produkcyjnej bazie danych, a następnie `migrate resolve --applied` — co oznaczyło migracje jako wykonane bez faktycznego uruchomienia SQL. Produkcja straciła wszystkie dane (naprawione ręcznie + PR cf88c19).

**Root cause:** `AGENTS.md` nie zawierał explicitnego zakazu destrukcyjnych operacji DB. Reguły były tylko w `CLAUDE.md`, którego OpenCode nie traktuje jako primary rules file.

**Cel tego speca:** Zunifikować warstwę bezpieczeństwa między AI tools bez tworzenia jednego pliku dla obu (co byłoby trudne w utrzymaniu). Zamiast tego — `AGENTS.md` dostaje pełne guardrails, `CLAUDE.md` dostaje cross-reference, a `consistency_check.py` dostaje nowy check C12 weryfikujący że guardrails istnieją.

---

## Zakres

1. **AGENTS.md (root)** — dodać 3 nowe sekcje bezpieczeństwa na górze pliku
2. **CLAUDE.md** — cross-reference do AGENTS.md + deprecated skill refs
3. **.tmp/ cleanup** — archiwizacja starych plików, usunięcie duplikatów
4. **docs/OVERVIEW.md** — zaktualizować sekcję Skills o nowe superpowers
5. **tools/consistency_check.py** — nowy check C12

---

## Szczegóły implementacji

### 1. AGENTS.md — nowe sekcje (na górze pliku, przed istniejącą treścią)

Dodać trzy sekcje:

#### Sekcja A: Forbidden Operations

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
```

#### Sekcja B: Multi-Worker Coordination

```markdown
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
```

#### Sekcja C: Session End Protocol

```markdown
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
```

---

### 2. CLAUDE.md — dwie zmiany

**Zmiana A:** W sekcji "Codebase Quick Reference" (tabela nawigacji), dodać wiersz:
```
| Agent rules (OpenCode) | `AGENTS.md` — safety guardrails dla wszystkich AI tools |
```

**Zmiana B:** W sekcji "Skills — Quick Reference", tabela "Obowiązkowe", dodać dwa wiersze:
```
| Przed claimem "done" | `/superpowers:verification-before-completion` | NIE commituj bez weryfikacji |
| Koniec feature branch | `/superpowers:finishing-a-development-branch` | po zakończeniu całej pracy |
```

---

### 3. .tmp/ cleanup

**Archiwizować → `docs/archive/audits/`:**
- `.tmp/audit-2026-03-28.md`
- `.tmp/screenshots/audit-2026-03-28/` (13 plików)
- `.tmp/review-feat-mn-cafe-profiles.md`
- `.tmp/test-auto-flow.md`

**Usunąć (duplikat):**
- `.tmp/roasters_hub_business_overview.pdf` — kopia `docs/roasters_hub_business_overview.pdf`

**Zweryfikować i usunąć jeśli nie aktywnie używane:**
- `.tmp/cafe_addresses.json` — sprawdź: `grep -r "cafe_addresses" web/prisma/` — jeśli brak wyników → usuń
- `.tmp/cafes_to_scrape.json` — sprawdź: `grep -r "cafes_to_scrape" tools/` — jeśli brak wyników → usuń
- `.tmp/scrape_cafes_*.ts` (2 pliki) — jednorazowe skrypty; sprawdź git log dla ostatniego użycia → usuń

**Zostawić bez zmian:**
- `.tmp/SESSION.md`
- `.tmp/ux-quality-audit-2026-04-04.md`
- `.tmp/screenshots/audit-2026-04-04/` (29 plików)
- `.tmp/qr-*.png` (decyzja @MN — mogą zawierać wrażliwe dane)

---

### 4. docs/OVERVIEW.md — sekcja Skills

Dodać do listy skills:
- `superpowers:verification-before-completion` — przed każdym "done"
- `superpowers:finishing-a-development-branch` — koniec feature brancha
- `superpowers:writing-plans` — planowanie przed kodowaniem
- `superpowers:systematic-debugging` — każdy bug/failure
- `superpowers:brainstorming` — zastępuje deprecated `superpowers:brainstorm`

---

### 5. tools/consistency_check.py — C12

Nowy check na końcu listy istniejących checks (C1–C11):

```python
{
  "id": "C12",
  "name": "AGENTS.md Safety Sections",
  "severity": "IMPORTANT",
  "auto_fixable": False,
  "description": "Sprawdza czy AGENTS.md zawiera wymagane sekcje bezpieczeństwa",
  "checks": [
    "FORBIDDEN" lub "⛔" present in file,
    "prisma db push" mentioned explicitly,
    "Multi-Worker" or "@MN" present,
    "SESSION" protocol present
  ],
  "failure_message": "AGENTS.md brakuje sekcji bezpieczeństwa — dodaj ręcznie lub uruchom implementację unified-agent-protocol"
}
```

---

## Pliki do modyfikacji

| Plik | Typ zmiany | Priorytet |
|------|-----------|-----------|
| `AGENTS.md` | Dodać 3 sekcje na górze | CRITICAL |
| `CLAUDE.md` | 2 drobne aktualizacje | HIGH |
| `tools/consistency_check.py` | Dodać C12 | HIGH |
| `docs/OVERVIEW.md` | Zaktualizować sekcję Skills | MEDIUM |
| `.tmp/` | Cleanup (archiwizacja + usunięcia) | MEDIUM |

---

## Weryfikacja (post-implementacja)

1. `python tools/consistency_check.py` → C12 musi PASS
2. `cat AGENTS.md | head -60` → trzy nowe sekcje widoczne na górze
3. `ls docs/archive/audits/` → stare pliki przeniesione
4. `grep "verification-before-completion" CLAUDE.md` → nowy wiersz obecny
5. Uruchomić nową sesję OpenCode i sprawdzić czy czyta AGENTS.md poprawnie

---

## Co NIE jest w zakresie

- Zmiana workflow SOPs (`workflows/*.md`) — tylko człowiek
- Zmiana `.claude/settings.json` — tylko człowiek  
- Merge/zamknięcie otwartych PR
- Zmiany w GitHub Actions
- Tworzenie nowych skills projektowych
