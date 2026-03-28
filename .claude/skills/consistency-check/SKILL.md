---
name: consistency-check
description: Use when running a project consistency check, detecting drift between ROADMAP/PROJECT_STATUS/filesystem/package.json, or auto-fixing consistency issues before starting work.
context: fork
argument-hint: "[check-ids e.g. C2,C4 — or empty for all]"
---

## Co robi ten skill

Uruchamia `tools/consistency_check.py`, interpretuje wyniki i naprawia wykryte problemy zgodnie z SOP z `workflows/consistency_check.md`.

## Kroki

1. Uruchom check (read-only):
   ```bash
   python tools/consistency_check.py
   ```

2. Zinterpretuj wyniki według tabeli:

   | Wynik | Akcja |
   |-------|-------|
   | Wszystko PASS | Zgłoś "All checks passed" — koniec |
   | FAIL + auto_fixable | Krok 3 |
   | FAIL C1 (manual) | Krok 4 |
   | FAIL C5/C6 (human) | Krok 5 |
   | WARN | Zaloguj w SESSION.md, zgłoś użytkownikowi |

3. **Auto-fix** (jeśli `$ARGUMENTS` podaje IDs — użyj ich; jeśli puste — fix all):
   ```bash
   # Z argumentami: python tools/consistency_check.py --fix $ARGUMENTS
   # Bez argumentów: python tools/consistency_check.py --fix all
   python tools/consistency_check.py --fix all
   ```
   Kolejność fix ma znaczenie: C1 → C2 → C3 → C4 → C7 → C8.
   Re-run po fix: `python tools/consistency_check.py` — potwierdź brak FAIL.

4. **C1 manual fix** (ROADMAP vs STATUS niezgodne):
   ```bash
   git log --oneline -10
   ```
   Git history jest ground truth. Napraw ręcznie ten plik który jest za, commituj razem z fix.

5. **C5/C6** (wymaga człowieka): NIE naprawiaj. Zaloguj w `.tmp/SESSION.md` sekcja "Consistency Check" z opisem problemu.

6. **Commit** (tylko jeśli coś naprawiono — to NIE jest zadanie ROADMAP):
   ```bash
   git add [zmienione pliki]
   git commit -m "[AGENT] fix: consistency drift corrections

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
   ```
   NIE aktualizuj ROADMAP ani PROJECT_STATUS — to housekeeping, nie feature.

7. **Zapisz log** w `.tmp/consistency_check.log`:
   ```
   === Consistency Check YYYY-MM-DDTHH:MM:SSZ ===
   Result: X PASS, Y FAIL, Z WARN
   [szczegóły dla każdego FAIL/WARN]
   === End ===
   ```

## Guardrails

- Nigdy nie commituj fix bez re-run potwierdzającego PASS
- C5/C6 zawsze flaguj do człowieka — nie zgaduj poprawki
- Jeśli fix sam wprowadza błąd (re-run pokazuje nowe FAIL) — NIE commituj, zaloguj w SESSION.md
- Max 2 minuty — jeśli problem jest złożony, zaloguj i przejdź dalej
