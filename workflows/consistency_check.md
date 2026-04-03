# Consistency Check — SOP

**Cel:** Wykrywanie i naprawa dryfu między plikami stanu projektu.
**Kiedy używać:** Na początku każdego scheduled run (Krok 1.5) lub ręcznie.
**Czas:** Max 2 minuty na check + fix.

---

## Uruchomienie

```bash
python tools/consistency_check.py          # Read-only — JSON report
python tools/consistency_check.py --fix all  # Auto-fix wszystkich auto-fixable
python tools/consistency_check.py --fix C2,C4  # Fix wybranych checks
```

---

## Checks (10 sztuk)

| ID | Co sprawdza | Severity | Auto-fix? |
|----|-------------|----------|-----------|
| C1 | ROADMAP first `[ ]` ↔ STATUS "Next Unblocked Task" | critical | ❌ agent |
| C2 | STATUS "Does NOT Exist Yet" ↔ filesystem | critical | ✅ |
| C3 | STATUS "Confirmed Stack" ↔ package.json | critical | ✅ partial |
| C4 | AGENTS.md versions ↔ package.json | important | ✅ |
| C5 | docs/architecture/*.md stale tech refs | important | ❌ human |
| C6 | prisma schema model count ↔ database-schema.md | low | ❌ human |
| C7 | ROADMAP `[x]` items ↔ DONE section | low | ✅ |
| C8 | prisma datasource url + directUrl | low | ✅ |
| C9 | ISR `revalidate=3600` na stronach używających `db.*` | medium | ❌ warn |
| C10 | Orphan screenshots + stale audit reports w `.tmp/` | low | ✅ |
| C11 | ROADMAP `[x]` vs filesystem — fizyczny dowód w kodzie | critical | ❌ agent |

---

## Decision Tree

```
Uruchom: python tools/consistency_check.py
          │
          ├── Wszystko PASS → przejdź do Kroku 2 scheduled_run
          │
          ├── FAIL + auto_fixable=true
          │   → python tools/consistency_check.py --fix <ids>
          │   → Re-run check → potwierdź PASS
          │   → Commit: [AGENT] fix: consistency drift corrections
          │   → Przejdź do Kroku 2
          │
          ├── FAIL + auto_fixable=false (C1)
          │   → Sprawdź git log --oneline -10
          │   → Ustal które źródło (ROADMAP vs STATUS) jest poprawne
          │   → Napraw ręcznie → commit w tym samym [AGENT] fix: commit
          │
          ├── FAIL + auto_fixable=false (C11)
          │   → `[x]` w ROADMAP nie ma dowodu w kodzie
          │   → Cofnij `[x]` → `[ ]` LUB znajdź brakujący plik/kod
          │   → Napraw ręcznie → commit
          │
          ├── FAIL + auto_fixable=false (C5, C6)
          │   → Zaloguj w SESSION.md sekcja "Consistency Check"
          │   → NIE naprawiaj — wymaga decyzji człowieka
          │   → Przejdź do Kroku 2
          │
          └── WARN
              → Zaloguj w SESSION.md
              → Przejdź do Kroku 2
```

---

## Commit Convention

Consistency fix to **NIE jest zadanie ROADMAP**. To housekeeping.

```bash
git add [zmienione pliki]
git commit -m "[AGENT] fix: consistency drift corrections

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

**NIE aktualizuj:** "Active Work" w PROJECT_STATUS, nie dodawaj do ROADMAP.

---

## Logowanie

Wyniki zapisz w `.tmp/consistency_check.log` (nadpisz jeśli istnieje):

```
=== Consistency Check YYYY-MM-DDTHH:MM:SSZ ===
Duration: XXXms
Result: X PASS, Y FAIL, Z WARN

FAIL C2: Files listed as non-existent but found on disk
  - web/src/actions/ (exists, removed from list)
  Auto-fixed: yes

WARN C5: Stale technology reference
  - docs/architecture/api-design.md:34 contains 'supabase'
  Action: flagged for human review

=== End ===
```

W **SESSION.md** dodaj sekcję:

```markdown
### Consistency Check
[PASS — all 10 checks green]
```
lub
```markdown
### Consistency Check
[FIXED — C2: removed 1 file from "Does NOT Exist Yet"]
[FLAGGED — C5: stale ref in api-design.md → needs human review]
```

---

## Sekwencja auto-fix (kolejność ma znaczenie)

1. C1 — rozwiąż ręcznie jeśli FAIL (wpływa na wszystko inne)
2. C2 — usuń istniejące pliki z "Does NOT Exist Yet"
3. C3 — zaktualizuj statusy w "Confirmed Stack"
4. C4 — zaktualizuj wersje w AGENTS.md
5. C7 — dodaj brakujące items do DONE
6. C8 — dodaj url/directUrl do prisma schema
7. C10 — usuń orphan screenshots i stale audit raporty
8. Re-run check → potwierdź brak FAIL
9. Jeden commit dla wszystkich fixów

---

## Edge Cases

| Sytuacja | Akcja |
|----------|-------|
| Skrypt nie może znaleźć pliku | Check zwraca SKIP — kontynuuj |
| C1 FAIL: nie wiadomo które źródło jest poprawne | `git log --oneline -10` — commit history jest ground truth |
| Fix sam wprowadza błąd | Re-run po fix wykryje → nie commituj, zaloguj w SESSION.md |
| Wszystko PASS ale SESSION.md mówi "flagged" | Sprawdź czy flagi zostały rozwiązane przez człowieka |
