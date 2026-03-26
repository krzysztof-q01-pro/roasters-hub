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

## Krok 2: Weryfikacja przed pracą

```bash
git status          # czy są uncommitted changes z poprzedniej sesji
git branch          # upewnij się że jesteś na właściwej gałęzi
git log --oneline -3  # ostatnie commity — co było robione
```

**Jeśli uncommitted changes:**
- Sprawdź czy to незакінчена praca (wtedy dokończ i commituj)
- Lub porzucony eksperyment (wtedy `git checkout .` żeby wyczyścić)
- Nie zostawiaj w zawieszeniu

---

## Krok 3: Wykonaj Zadanie

- Wykonaj **JEDNO** zadanie z sekcji NOW w `ROADMAP.md`
- Zacznij od pierwszego niezaznaczonego `[ ]`
- Nie zaczynaj kolejnego zadania zanim nie zakończysz poprzedniego

**Jeśli zadanie wymaga czegoś czego nie masz:**

| Blokada | Akcja |
|---------|-------|
| Brakuje credentials (Supabase URL, API key) | STOP → przejdź do Kroku 5 |
| Brakuje zależności npm | `npm install` w `web/` |
| Niejasna instrukcja | Sprawdź `docs/architecture/api-design.md` |
| Błąd kompilacji TypeScript | `npx tsc --noEmit` → napraw błędy → retry |

---

## Krok 4: Weryfikacja przed Commitem

```bash
cd web
npm run lint         # lint musi przejść
npx tsc --noEmit     # TypeScript musi przejść
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
git push origin main   # lub feature branch
```

**Scopes:** `DB | AUTH | ACTION | UI | SEED | INFRA | DOCS | AGENT`

**⚠️ NIGDY nie commituj kodu bez aktualizacji ROADMAP.md i PROJECT_STATUS.md w tym samym commicie.**

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
1. Czytaj: SESSION.md → PROJECT_STATUS.md → ROADMAP.md
2. git status + git branch
3. Jedno zadanie z ROADMAP NOW
4. lint + tsc
5. Zaktualizuj ROADMAP.md [x] + PROJECT_STATUS.md
6. git add [pliki + ROADMAP + STATUS] → commit [SCOPE] → push
7. Zapisz SESSION.md
```
