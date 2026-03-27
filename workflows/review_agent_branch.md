# Review Agent Branch — SOP

**Cel:** Ocena jakości pracy autonomicznego agenta na feature branchu przed merge do main.
**Kiedy używać:** Po nocnej/autonomicznej sesji agenta, gdy istnieje feature branch z nową pracą.

---

## Dlaczego to jest potrzebne

Autonomiczne agenty mogą:
- Oznaczać zadania jako done (`[x]`) gdy faktyczna praca jest niekompletna
- Wprowadzać subtelne bugi (literówki w regex, missing imports)
- Tworzyć backend (actions, helpers) bez podpięcia do frontendu
- Aktualizować STATUS/ROADMAP niezgodnie z kodem

Ten workflow chroni main branch przed niedokończoną lub buggy pracą.

---

## Krok 1: Identyfikacja branchy do review

```bash
git fetch origin
git branch -r --sort=-committerdate | head -10
```

Szukaj branchy nowszych niż ostatni merge do main.

---

## Krok 2: Analiza zmian (READ-ONLY)

```bash
git diff main..origin/<branch-name> --stat
git diff main..origin/<branch-name>
git log main..origin/<branch-name> --stat --format="%H%n%s%n%b%n---"
```

**Zanotuj:**
- Lista zmienionych/nowych plików
- Lista commitów i ich opisów
- Zmiany w ROADMAP.md (które `[ ]` → `[x]`)
- Zmiany w PROJECT_STATUS.md (nowe claimy)

---

## Krok 3: Weryfikacja claimów (KRYTYCZNE)

Dla każdego zadania oznaczonego jako `[x]` w ROADMAP diff:

| Claim w ROADMAP | Weryfikacja |
|-----------------|-------------|
| "Stworzyć plik X" | Czy plik istnieje? `ls <path>` |
| "Podpiąć UI do Server Action" | Czy UI importuje i wywołuje action? `grep -r "import.*from.*actions"` |
| "Stworzyć routes X" | Czy pliki routów istnieją? `ls web/src/app/<route>` |
| "Zastąpić X na Y" | Czy stary X jest faktycznie usunięty? `grep -r "old pattern"` |
| "Usunąć X z env" | Czy X już nie jest używany w kodzie? |

**Zasada:** Każde `[x]` musi mieć fizyczny dowód w kodzie. Claim bez kodu = FAIL.

---

## Krok 4: Analiza jakości kodu

### 4a. Type check
```bash
git stash  # jeśli masz lokalne zmiany
git checkout <branch-name>
cd web && npx tsc --noEmit
```

### 4b. Lint
```bash
npm run lint
```

### 4c. Pattern check (ręczny)
- Regex patterns w middleware/route matchers — czy poprawne?
- Importy — czy nowe pliki są faktycznie importowane tam gdzie powinny?
- Error handling — czy Server Actions mają try/catch?
- Typy — czy nowe pliki używają istniejących typów (`ActionResult<T>` etc.)?

---

## Krok 5: Raport

Zapisz raport w `.tmp/review-<branch-name>.md`:

```markdown
## Branch Review: <branch-name>
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
| "Task X" [x] | ✅ Verified / ❌ Not done |

### Required Fixes Before Merge
1. [lista — jeśli PASS WITH FIXES]
```

---

## Krok 6: Decyzja

| Verdict | Akcja |
|---------|-------|
| **PASS** | Merge do main: `git checkout main && git merge <branch> --no-ff` |
| **PASS WITH FIXES** | Checkout branch → fix issues → commit → re-review → merge |
| **FAIL** | NIE merguj. Zaloguj issues. Kolejna sesja agenta naprawia. |

---

## Severity Guide

| Severity | Definicja | Przykład |
|----------|-----------|---------|
| **CRITICAL** | Funkcjonalność nie działa mimo claimu | UI nie podpięte do actions |
| **HIGH** | Bug który złamie produkcję | Regex error w middleware, missing auth check |
| **MEDIUM** | Niekompletna praca, ale core działa | Brakujące routes (Clerk hosted fallback działa) |
| **LOW** | Kosmetyka, optymalizacja | Brakujące loading states |

---

## Szybki Cheat Sheet

```
1. git fetch && git diff main..origin/<branch> --stat
2. Dla każdego [x] w ROADMAP diff → zweryfikuj fizycznie
3. tsc --noEmit + lint
4. Sprawdź regex, importy, error handling
5. Zapisz raport → .tmp/review-<branch>.md
6. PASS → merge | FIXES → fix+merge | FAIL → nie merguj
```
