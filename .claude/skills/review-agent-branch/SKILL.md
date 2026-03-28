---
name: review-agent-branch
description: Use when reviewing an autonomous agent's feature branch before merging to main, verifying agent work quality, checking if ROADMAP claims match actual code, or deciding whether to merge an agent PR.
context: fork
argument-hint: "[branch-name — e.g. feat/agent-2026-13]"
---

## Co robi ten skill

Ocenia jakość pracy autonomicznego agenta na feature branchu przed merge do main. Weryfikuje czy każde `[x]` w ROADMAP ma fizyczny dowód w kodzie, sprawdza TypeScript i lint, i wydaje werdykt PASS / PASS WITH FIXES / FAIL.

Pełna dokumentacja: `workflows/review_agent_branch.md`.

## Kroki

### 1. Ustal branch do review

Jeśli `$ARGUMENTS` podano — użyj go jako nazwy brancha.
Jeśli nie podano:
```bash
git fetch origin
git branch -r --sort=-committerdate | head -10
```
Wybierz branch nowszy niż ostatni merge do main.

### 2. Analiza zmian (READ-ONLY)

```bash
git diff main..origin/$ARGUMENTS --stat
git log main..origin/$ARGUMENTS --stat --format="%H%n%s%n%b%n---"
```

Zanotuj:
- Lista zmienionych plików
- Lista commitów i ich opisów
- Które `[ ]` → `[x]` w ROADMAP diff
- Nowe claimy w PROJECT_STATUS.md

### 3. Weryfikacja claimów ROADMAP (KRYTYCZNE)

Dla każdego zadania oznaczonego `[x]` w ROADMAP diff, sprawdź fizyczny dowód:

| Typ claimu | Jak zweryfikować |
|------------|-----------------|
| "Stworzono plik X" | Sprawdź czy plik istnieje |
| "Podpięto UI do Action" | Grep czy UI importuje i wywołuje action |
| "Stworzono route X" | Sprawdź czy pliki routu istnieją |
| "Zastąpiono X na Y" | Grep czy stary X jest usunięty |
| "Usunięto X" | Grep czy X nie jest używany w kodzie |

**Zasada:** Każde `[x]` bez fizycznego dowodu w kodzie = FAIL.

### 4. Weryfikacja jakości kodu

```bash
git checkout $ARGUMENTS
cd web
npx tsc --noEmit
npm run lint
```

Ręcznie sprawdź:
- Regex patterns w middleware — czy poprawne?
- Nowe pliki — czy są faktycznie importowane?
- Server Actions — czy mają try/catch + `ActionResult<T>`?
- Nowe typy — czy używają istniejących typów z `src/types/`?
- ISR — czy nowe strony z `db.*` mają `export const revalidate = 3600`?
- Revalidation — czy Server Actions wywołują `revalidatePath()` dla wszystkich tras?

### 5. Zapisz raport

Zapisz w `.tmp/review-$ARGUMENTS.md`:

```markdown
## Branch Review: [branch-name]
Date: YYYY-MM-DD
Commits: N

### Verdict: PASS / FAIL / PASS WITH FIXES

### What Was Done Well
- [lista]

### Issues Found
| # | Issue | Severity | File |
|---|-------|----------|------|
| 1 | ... | CRITICAL/HIGH/MEDIUM/LOW | ... |

### ROADMAP Claims Verification
| Claim | Status |
|-------|--------|
| "Task X" | ✅ Verified / ❌ Not done |

### Required Fixes Before Merge
1. [lista — tylko jeśli PASS WITH FIXES]
```

### 6. Werdykt i akcja

| Werdykt | Akcja |
|---------|-------|
| **PASS** | `git checkout main && git merge $ARGUMENTS --no-ff` |
| **PASS WITH FIXES** | Checkout branch → fix → commit → re-review → merge |
| **FAIL** | NIE merguj. Opisz issues. Kolejna sesja agenta naprawia. |

## Severity guide

| Severity | Definicja | Przykład |
|----------|-----------|---------|
| **CRITICAL** | Feature nie działa mimo claimu | UI nie podpięte do action |
| **HIGH** | Bug złamie produkcję | Błędny regex w middleware, brak auth check |
| **MEDIUM** | Niekompletne, ale core działa | Brakujące loading states |
| **LOW** | Kosmetyka | Brakujące komentarze |

## Guardrails

- Nigdy nie merguj bez weryfikacji każdego `[x]`
- Nigdy nie merguj gdy `tsc --noEmit` lub lint fail
- CRITICAL issue zawsze = FAIL (nie PASS WITH FIXES)
- Nie naprawiaj kodu agenta podczas review — werdykt FAIL i niech agent naprawi
