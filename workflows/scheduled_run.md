# Scheduled Run — SOP

**Cel:** Autonomiczne kontynuowanie pracy nad projektem bez nadzoru człowieka.
**Kiedy używać:** Przy każdym uruchomieniu ze scheduled task (loop, cron, remote trigger).

---

## Krok 1: Orientacja (ZAWSZE — nie pomijaj)

Czytaj w tej kolejności:

1. `.tmp/SESSION.md` — jeśli istnieje: co było robione ostatnio, gdzie skończyliśmy
2. `PROJECT_STATUS.md` — aktualny stan projektu, co istnieje, co NIE istnieje
3. `ROADMAP.md` → sekcja **NOW** → pierwsze niezaznaczone zadanie `[ ]`

**Zasada:** Jeśli `PROJECT_STATUS.md` i dokumenty architektury są sprzeczne → `PROJECT_STATUS.md` wygrywa.

---

## Krok 1.5: Consistency Check

Sprawdź spójność plików stanu projektu **przed** rozpoczęciem pracy.

```bash
python tools/consistency_check.py
```

**Interpretacja wyników:**

| Wynik | Akcja |
|-------|-------|
| Wszystko PASS | Przejdź do Kroku 2 |
| FAIL + auto_fixable | `python tools/consistency_check.py --fix all` → re-run → commit `[AGENT] fix:` |
| FAIL C1 (manual) | Sprawdź `git log --oneline -10`, napraw ręcznie, commit `[AGENT] fix:` |
| FAIL C5/C6 (human) | Zaloguj w SESSION.md → przejdź do Kroku 2 |
| WARN | Zaloguj w SESSION.md → przejdź do Kroku 2 |

**Czas:** Max 2 minuty. Pełna dokumentacja: `workflows/consistency_check.md`

---

## Krok 2: Weryfikacja przed pracą + Branch

```bash
git status          # czy są uncommitted changes z poprzedniej sesji
git branch          # upewnij się że jesteś na właściwej gałęzi
git log --oneline -3  # ostatnie commity — co było robione
git pull origin "$(git branch --show-current)"  # ZAWSZE pull przed pracą (dual-schedule safety)
```

**Jeśli uncommitted changes:**
- Sprawdź czy to niedokończona praca (wtedy dokończ i commituj)
- Lub porzucony eksperyment (wtedy `git checkout .` żeby wyczyścić)
- Nie zostawiaj w zawieszeniu

**⚠️ OBOWIĄZKOWE: Tygodniowy branch agenta (ISO week):**

```bash
YEAR=$(date +%Y)
WEEK=$(date +%V)
BRANCH="feat/agent-${YEAR}-${WEEK}"

git fetch origin
if git ls-remote --exit-code --heads origin "$BRANCH" > /dev/null 2>&1; then
  # Branch tego tygodnia istnieje — kontynuuj pracę
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
  echo "Kontynuuję branch: $BRANCH"
else
  # Nowy tydzień — nowy branch z main
  git checkout main && git pull origin main
  git checkout -b "$BRANCH"
  echo "Nowy branch: $BRANCH"
fi
```

**Schemat nazewnictwa:** `feat/agent-YYYY-WW` (np. `feat/agent-2026-13`)
**Zasada:** Cała praca w danym tygodniu ISO zostaje na tej samej gałęzi. Jedna PR per tydzień.
**NIGDY nie commituj bezpośrednio do main.** Branch zostanie zreviewowany przed merge (patrz `workflows/review_agent_branch.md`).

---

## Krok 3: Wykonaj Zadanie

### Selekcja zadania (Multi-Worker)

1. Skanuj `[ ]` w sekcjach NOW → NEXT w `ROADMAP.md`
2. Bierz TYLKO zadania z tagiem `(@AGENT)`, `(@UNASSIGNED)`, lub bez tagu
3. **NIGDY nie ruszaj** zadań z `(@MN)` lub `(@KK)` — należą do ludzi
4. SKIP zadania z `[IN PROGRESS]` lub `[BLOCKED]`
5. Przy claimowaniu `(@UNASSIGNED)` → zmień na `(@AGENT)` w ROADMAP.md **ZANIM** zaczniesz
6. Brak dostępnych zadań → zapisz w SESSION.md i przejdź do Kroku 6

- Wykonaj **JEDNO** zadanie
- Nie zaczynaj kolejnego zadania zanim nie zakończysz poprzedniego

**Jeśli zadanie wymaga czegoś czego nie masz:**

| Blokada | Akcja |
|---------|-------|
| Brakuje credentials (DB URL, API key, Clerk keys) | STOP → przejdź do Kroku 5 |
| Brakuje zależności npm | `npm install` w `web/` |
| Niejasna instrukcja | Sprawdź `docs/architecture/api-design.md` |
| Błąd kompilacji TypeScript | `npx tsc --noEmit` → napraw błędy → retry |

---

## Krok 4: Weryfikacja przed Commitem

```bash
cd web
npm run lint         # lint musi przejść
npx tsc --noEmit     # TypeScript musi przejść
npm run test         # unit testy muszą przejść
# npm run build      # opcjonalnie - wolny, ale pewny
```

**Jeśli build/lint failuje:** NIE commituj. Opisz problem w SESSION.md i zakończ.

---

## Krok 5: Commit + Aktualizacja Stanu

### NAJPIERW zaktualizuj stan (PRZED git add)
1. `ROADMAP.md` — zaznacz wykonane zadanie: `[ ]` → `[x]`
2. `PROJECT_STATUS.md` — zmień "Active Work" i "Next Unblocked Task"
3. Jeśli stworzono nowy plik/katalog — usuń z "Does NOT Exist Yet"

### POTEM commit (ZAWSZE dołącz ROADMAP.md + PROJECT_STATUS.md)
```bash
git add [pliki zadania] ROADMAP.md PROJECT_STATUS.md
git commit -m "[SCOPE] action: opis

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push origin "$BRANCH"   # ZAWSZE feature branch, NIGDY main
```

**Scopes:** `DB | AUTH | ACTION | UI | SEED | INFRA | DOCS | AGENT`

**⚠️ NIGDY nie commituj kodu bez aktualizacji ROADMAP.md i PROJECT_STATUS.md w tym samym commicie.**

---

## Krok 5.5: Preview URL + Smoke Test + PR

Po `git push` — sprawdź status deploymentu i utwórz PR:

```bash
# Poczekaj chwilę na rejestrację deploymentu przez vercel[bot]
sleep 15

# Pobierz preview URL przez GitHub Deployments API
PREVIEW_URL=$(python tools/vercel_status.py --json 2>/dev/null | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    previews = [x for x in d if x.get('environment') == 'Preview' and x.get('url')]
    print(previews[0]['url'] if previews else '')
except:
    print('')
" 2>/dev/null || echo "")

if [ -n "$PREVIEW_URL" ]; then
  echo "Preview URL: $PREVIEW_URL"
  python tools/smoke_test.py --url "$PREVIEW_URL"
else
  echo "Preview URL nie dostępny jeszcze (Vercel może jeszcze budować)"
fi

# Utwórz PR jeśli nie istnieje
bash tools/create_agent_pr.sh
```

**Jeśli smoke test FAIL:** Zanotuj w SESSION.md (pole `smoke_test: FAIL`) i wskaż co nie działa. Nie blokuje kontynuacji pracy.

---

## Krok 6: Protokół Końca Sesji

Zapisz `.tmp/SESSION.md` (nadpisz jeśli istnieje):

```markdown
## Session [YYYY-MM-DD HH:MM]

### Started with
[co mówiło PROJECT_STATUS.md — aktywne zadanie]

### Completed
[co zostało zrobione — lista konkretnych zmian]

### Tested
[co zostało zweryfikowane — komendy które przeszły]

### Blocked by
[jeśli coś blokowało — dlaczego nie dokończono]
[NONE jeśli bez blokad]

### Next
[dokładny następny krok — konkretna komenda lub plik do edycji]

### Metadata
current_branch: feat/agent-YYYY-WW
preview_url: https://... (lub "nie dostępny" jeśli Vercel jeszcze buduje)
smoke_test: PASS / FAIL / nie sprawdzono
consistency_check: ALL PASS / WARN C9 / FAIL C1 (opis)
```

---

## Zasady Awaryjne

| Sytuacja | Akcja |
|----------|-------|
| Nie wiem co robić | STOP — nie zgaduj, zanotuj w SESSION.md |
| Brakuje credentials | STOP — zanotuj jakich i zakończ |
| Build failuje | NIE commituj — opisz błąd w SESSION.md |
| Niepewny czy commitować do main | Stwórz feature branch `feat/[opis]` |
| Dwie sprzeczne instrukcje | `PROJECT_STATUS.md` > `CLAUDE.md` > `docs/architecture/` |
| Zadanie zajmuje >1h | Commituj WIP, zanotuj w SESSION.md |

---

## Szybki Cheat Sheet

```
1.    Czytaj: SESSION.md → PROJECT_STATUS.md → ROADMAP.md
1.5   python tools/consistency_check.py → fix jeśli FAIL
2.    git status + git pull + ustal branch: feat/agent-YYYY-WW (kontynuuj lub utwórz)
3.    Wybierz zadanie: TYLKO (@AGENT) lub (@UNASSIGNED) — NIGDY (@MN)/(@KK)
      Claim @UNASSIGNED → zmień na (@AGENT) przed pracą
4.    lint + tsc + test
5.    Zaktualizuj ROADMAP.md [x] + PROJECT_STATUS.md (TYLKO swoja linia @AGENT)
      git add [pliki + ROADMAP + STATUS] → commit [SCOPE] → push
5.5   sleep 15 → vercel_status.py → smoke_test.py → create_agent_pr.sh
6.    Zapisz SESSION.md (z current_branch + preview_url + smoke_test)
```
