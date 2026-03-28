---
name: scheduled-run
description: Use when starting an autonomous scheduled session, waking up from a cron/loop/remote trigger, or running the full agent SOP for autonomous work on the project.
disable-model-invocation: true
---

## Co robi ten skill

Prowadzi przez pełny SOP autonomicznej sesji agenta: orientacja → consistency check → branch → zadanie → weryfikacja → commit → smoke test → SESSION.md.

Pełna dokumentacja: `workflows/scheduled_run.md`.

---

## Krok 1: Orientacja (ZAWSZE — nie pomijaj)

Czytaj w tej kolejności:
1. `.tmp/SESSION.md` — jeśli istnieje: co było robione, gdzie skończyliśmy
2. `PROJECT_STATUS.md` — aktualny stan, co istnieje, co NIE istnieje
3. `ROADMAP.md` → sekcja **NOW** → pierwsze niezaznaczone `[ ]`

**Zasada:** Jeśli PROJECT_STATUS i docs/architecture są sprzeczne → PROJECT_STATUS wygrywa.

---

## Krok 1.5: Consistency Check

```bash
python tools/consistency_check.py
```

| Wynik | Akcja |
|-------|-------|
| Wszystko PASS | Przejdź do Kroku 2 |
| FAIL + auto_fixable | `python tools/consistency_check.py --fix all` → re-run → commit `[AGENT] fix:` |
| FAIL C1 (manual) | `git log --oneline -10` → napraw ręcznie → commit |
| FAIL C5/C6 (human) | Zaloguj w SESSION.md → przejdź do Kroku 2 |
| WARN | Zaloguj w SESSION.md → przejdź do Kroku 2 |

Alternatywnie: `/consistency-check` (skill).

---

## Krok 2: Branch

```bash
git status && git branch && git log --oneline -3
```

Uncommitted changes: dokończ i commituj, lub `git checkout .` jeśli porzucony eksperyment.

**Ustaw tygodniowy branch:**
```bash
YEAR=$(date +%Y) && WEEK=$(date +%V) && BRANCH="feat/agent-${YEAR}-${WEEK}"
git fetch origin
git ls-remote --exit-code --heads origin "$BRANCH" > /dev/null 2>&1 \
  && (git checkout "$BRANCH" && git pull origin "$BRANCH") \
  || (git checkout main && git pull origin main && git checkout -b "$BRANCH")
```

**NIGDY nie commituj bezpośrednio do main.**

---

## Krok 3: Wykonaj JEDNO zadanie

- Zacznij od pierwszego `[ ]` w sekcji NOW w ROADMAP.md
- Nie zaczynaj kolejnego zanim nie skończysz poprzedniego

| Blokada | Akcja |
|---------|-------|
| Brakuje credentials | STOP → zanotuj w SESSION.md → zakończ |
| Brakuje npm deps | `npm install` w `web/` |
| Niejasna instrukcja | Sprawdź `docs/architecture/api-design.md` |
| Błąd TypeScript | `npx tsc --noEmit` → napraw → retry |
| Zadanie zajmuje >1h | Commituj WIP → zanotuj w SESSION.md |

---

## Krok 4: Weryfikacja przed commitem

```bash
cd web && npm run lint && npx tsc --noEmit
```

Jeśli fail: NIE commituj. Opisz błąd w SESSION.md i zakończ.

---

## Krok 5: Commit + aktualizacja stanu

**NAJPIERW zaktualizuj (przed git add):**
1. `ROADMAP.md` — zaznacz `[ ]` → `[x]`
2. `PROJECT_STATUS.md` — "Active Work" i "Next Unblocked Task"
3. Nowy plik/katalog → usuń z "Does NOT Exist Yet"

**POTEM commit:**
```bash
git add [pliki zadania] ROADMAP.md PROJECT_STATUS.md
git commit -m "[SCOPE] action: opis

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push origin "$BRANCH"
```

Scopes: `DB | AUTH | ACTION | UI | SEED | INFRA | DOCS | AGENT`

---

## Krok 5.5: Preview + Smoke Test + PR

```bash
sleep 15
PREVIEW_URL=$(python tools/vercel_status.py --json 2>/dev/null | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    previews = [x for x in d if x.get('environment') == 'Preview' and x.get('url')]
    print(previews[0]['url'] if previews else '')
except:
    print('')
" 2>/dev/null || echo "")

[ -n "$PREVIEW_URL" ] && python tools/smoke_test.py --url "$PREVIEW_URL"
bash tools/create_agent_pr.sh
```

Smoke test FAIL nie blokuje — zanotuj w SESSION.md.

---

## Krok 6: SESSION.md

Zapisz `.tmp/SESSION.md` (nadpisz):

```markdown
## Session [YYYY-MM-DD HH:MM]

### Started with
[co mówiło PROJECT_STATUS — aktywne zadanie]

### Completed
[lista konkretnych zmian]

### Tested
[komendy które przeszły]

### Blocked by
[NONE lub powód]

### Next
[dokładny następny krok]

### Metadata
current_branch: feat/agent-YYYY-WW
preview_url: https://... (lub "nie dostępny")
smoke_test: PASS / FAIL / nie sprawdzono
```

---

## Zasady awaryjne

| Sytuacja | Akcja |
|----------|-------|
| Nie wiem co robić | STOP — nie zgaduj, zanotuj w SESSION.md |
| Dwie sprzeczne instrukcje | PROJECT_STATUS.md > CLAUDE.md > docs/architecture/ |
| Build failuje | NIE commituj — opisz błąd w SESSION.md |
