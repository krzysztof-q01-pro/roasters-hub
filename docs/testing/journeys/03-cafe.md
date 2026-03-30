# Journey 03: Cafe buyer

Właściciel kawiarni lub kupujący B2B, szukający dostawców kawy specialty.

---

## Misja A — Zapisz i zarządzaj palarniami

### Setup
- URL bazowy: `/roasters`
- Konto: konto Clerk z metadatą `role: CAFE`
- Stan DB: min. 2 VERIFIED roasters

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Zaloguj się jako cafe | Sesja aktywna, nawigacja pokazuje opcje dla zalogowanego |
| 2 | Przejdź do `/roasters` | Katalog palarni widoczny |
| 3 | Otwórz profil dowolnej palarni | Strona `/roasters/[slug]` załadowana |
| 4 | Znajdź przycisk "Zapisz" / "Save" / bookmark | Przycisk widoczny na profilu |
| 5 | Kliknij przycisk zapisu | Ikona/przycisk zmienia wygląd (saved state), komunikat sukcesu |
| 6 | Przejdź do `/dashboard/cafe` | Lista zapisanych palarni — min. 1 pozycja |
| 7 | Sprawdź że zapisana palarnia jest na liście | Nazwa i link do profilu widoczne |
| 8 | Zapisz drugą palarnię (powtórz kroki 3-5) | Dwie palarnie na liście w dashboardzie |
| 9 | Na dashboardzie kliknij "Usuń" przy pierwszej palarni | Palarnia znika z listy, komunikat sukcesu |
| 10 | Odśwież stronę `/dashboard/cafe` | Lista zawiera tylko jedną palarnię |

### Ukryte efekty
- Zapis: tworzy rekord `SavedRoaster` w DB (upsert — podwójny klik nie duplikuje)
- Usunięcie: usuwa rekord `SavedRoaster` z DB
- Oba działania wywołują `revalidatePath('/dashboard/cafe')`

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Próba zapisu bez logowania | Redirect do `/sign-in`, powrót po logowaniu |
| Kliknij "Zapisz" dwa razy na tym samym profilu | Brak duplikatu — upsert, przycisk może wrócić do stanu "unsaved" |
| Dashboard cafe z pustą listą | Komunikat "Nie masz jeszcze zapisanych palarni" lub empty state |
| Wejście na `/dashboard/cafe` jako ROASTER (nie CAFE) | Błąd 403 lub redirect |
| Wejście na `/dashboard/cafe` bez logowania | Redirect do `/sign-in` |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E
