# Journey 04: Admin

Osoba zarządzająca platformą — weryfikuje wnioski palarni i kawiarni, moderuje recenzje.

---

## Misja A — Weryfikacja wniosku

### Setup
- URL bazowy: `/admin/pending`
- Konto: konto Clerk z metadatą `role: ADMIN`
- Stan DB: min. 1 roaster ze statusem `PENDING`

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Zaloguj się jako admin | Sesja aktywna |
| 2 | Przejdź na `/admin/pending` | Lista oczekujących wniosków widoczna |
| 3 | Sprawdź dane wniosku | Nazwa, miasto, kraj, data zgłoszenia widoczne |
| 4 | Kliknij "Zweryfikuj" / "Verify" przy wybranym wniosku | Loading/spinner podczas przetwarzania |
| 5 | Sprawdź komunikat po akcji | Potwierdzenie sukcesu, wniosek znika z listy |
| 6 | Przejdź na `/roasters` | Nowo zweryfikowana palarnia widoczna na liście |
| 7 | Otwórz profil zweryfikowanej palarni | Status VERIFIED, profil publiczny |
| 8 | Przejdź na `/map` | Marker palarni widoczny na mapie (jeśli ma lat/lng) |

### Ukryte efekty
- Status roastera zmieniony z `PENDING` → `VERIFIED` w DB
- **Email wysyłany do palarni**: potwierdzenie weryfikacji z linkiem do profilu
- ISR revalidation wywołana dla: `/`, `/roasters`, `/roasters/[slug]`, `/admin/pending`, `/map`
- Profil natychmiast dostępny publicznie po revalidacji

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Pusta kolejka (brak PENDING) | Komunikat "Brak oczekujących wniosków" / empty state |
| Wejście na `/admin/pending` bez logowania | Redirect do `/sign-in` |
| Wejście na `/admin/pending` jako ROASTER lub CAFE | Błąd 403 lub redirect |
| Podwójne kliknięcie "Verify" | Bezpieczne — drugi request nie psuje danych |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E

---

## Misja B — Odrzucenie wniosku

### Setup
- URL bazowy: `/admin/pending`
- Konto: konto Clerk z metadatą `role: ADMIN`
- Stan DB: min. 1 roaster ze statusem `PENDING`

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Zaloguj się jako admin, przejdź na `/admin/pending` | Lista wniosków widoczna |
| 2 | Znajdź wniosek do odrzucenia | Dane wniosku widoczne |
| 3 | Kliknij "Odrzuć" / "Reject" | Modal lub inline formularz z polem "Powód odrzucenia" |
| 4 | Wpisz powód odrzucenia | Pole akceptuje tekst |
| 5 | Potwierdź odrzucenie | Loading, potem komunikat sukcesu |
| 6 | Sprawdź że wniosek zniknął z listy PENDING | Kolejka skrócona o 1 |
| 7 | Sprawdź że profil NIE jest widoczny na `/roasters` | Palarnia niewidoczna publicznie |

### Ukryte efekty
- Status roastera zmieniony z `PENDING` → `REJECTED` w DB
- Powód odrzucenia zapisywany w polu `rejectionReason`
- **Email wysyłany do palarni**: informacja o odrzuceniu z podanym powodem
- ISR revalidation wywołana dla `/admin/pending`

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Próba odrzucenia bez podania powodu | Błąd walidacji: pole powodu jest wymagane |
| Bardzo długi powód (500+ znaków) | Input akceptuje lub pokazuje limit |
| Kliknij "Anuluj" w modalu | Modal zamknięty, wniosek bez zmian |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E

---

## Misja C — Moderacja recenzji (palarnie + kawiarnie)

### Setup
- URL bazowy: `/admin/reviews`
- Konto: konto Clerk z metadatą `role: ADMIN`
- Stan DB: min. 1 recenzja palarni ze statusem `PENDING`, min. 1 recenzja kawiarni ze statusem `PENDING`

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Zaloguj się jako admin, przejdź na `/admin/reviews` | Lista recenzji PENDING widoczna |
| 2 | Sprawdź dane recenzji palarni | Autor, rating (1-5), komentarz, nazwa palarni widoczne |
| 3 | Kliknij "Zatwierdź" / "Approve" | Loading, potem komunikat sukcesu |
| 4 | Sprawdź że recenzja zniknęła z listy moderacji | Kolejka skrócona |
| 5 | Przejdź na profil palarni `/roasters/[slug]` | Zatwierdzona recenzja widoczna publicznie |
| 6 | Wróć na `/admin/reviews` | Lista recenzji nadal widoczna |
| 7 | Kliknij tab "Kawiarnie" / "Cafes" | Lista recenzji kawiarni PENDING widoczna |
| 8 | Sprawdź dane recenzji kawiarni | Autor, rating (1-5), komentarz, nazwa kawiarni widoczne |
| 9 | Kliknij "Zatwierdź" przy recenzji kawiarni | Loading, potem komunikat sukcesu |
| 10 | Przejdź na profil kawiarni `/cafes/[slug]` | Zatwierdzona recenzja widoczna publicznie |
| 11 | Wróć na `/admin/reviews`, znajdź inną recenzję | Kolejna recenzja PENDING |
| 12 | Kliknij "Odrzuć" / "Reject" | Recenzja usunięta lub zmiana statusu na REJECTED |
| 13 | Sprawdź profil palarni lub kawiarni | Odrzucona recenzja NIE widoczna publicznie |

### Ukryte efekty
- Zatwierdzenie recenzji palarni: status `PENDING` → `APPROVED`, revalidatePath dla `/roasters/[slug]`
- Zatwierdzenie recenzji kawiarni: status `PENDING` → `APPROVED`, revalidatePath dla `/cafes/[slug]`
- Odrzucenie: status recenzji `PENDING` → `REJECTED`
- Recenzje `APPROVED` widoczne publicznie na profilach

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Pusta kolejka recenzji palarni | Empty state: "Brak recenzji palarni do moderacji" |
| Pusta kolejka recenzji kawiarni | Tab "Kawiarnie" pusty lub komunikat |
| Wejście na `/admin/reviews` jako nie-admin | Błąd 403 lub redirect |
| Recenzja dla palarni która od tego czasu jest REJECTED | Moderacja działa normalnie |
| Recenzja dla kawiarni która od tego czasu jest REJECTED | Moderacja działa normalnie |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E

---

## Misja D — Weryfikacja wniosku kawiarni

### Setup
- URL bazowy: `/admin/cafes`
- Konto: konto Clerk z metadatą `role: ADMIN`
- Stan DB: min. 1 kawiarnia ze statusem `PENDING`

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Zaloguj się jako admin | Sesja aktywna |
| 2 | Przejdź na `/admin/cafes` | Lista oczekujących wniosków kawiarni widoczna |
| 3 | Sprawdź dane wniosku kawiarni | Nazwa, miasto, kraj, data zgłoszenia widoczne |
| 4 | Kliknij "Zweryfikuj" / "Verify" przy wybranym wniosku | Loading/spinner podczas przetwarzania |
| 5 | Sprawdź komunikat po akcji | Potwierdzenie sukcesu, wniosek znika z listy |
| 6 | Przejdź na `/cafes` | Nowo zweryfikowana kawiarnia widoczna na liście |
| 7 | Otwórz profil zweryfikowanej kawiarni | Status VERIFIED, profil publiczny |
| 8 | Przejdź na `/map`, włącz toggle "Kawiarnie" | Marker kawiarni widoczny na mapie (jeśli ma lat/lng) |

### Ukryte efekty
- Status kawiarni zmieniony z `PENDING` → `VERIFIED` w DB
- **Email wysyłany do właściciela kawiarni**: potwierdzenie weryfikacji z linkiem do profilu
- ISR revalidation wywołana dla: `/cafes`, `/cafes/[slug]`, `/map`, `/admin/cafes`
- Profil natychmiast dostępny publicznie po revalidacji

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Pusta kolejka kawiarni (brak PENDING) | Komunikat "Brak oczekujących wniosków kawiarni" / empty state |
| Wejście na `/admin/cafes` bez logowania | Redirect do `/sign-in` |
| Wejście na `/admin/cafes` jako ROASTER lub CAFE | Błąd 403 lub redirect |
| Podwójne kliknięcie "Verify" | Bezpieczne — drugi request nie psuje danych |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E

---

## Misja E — Odrzucenie wniosku kawiarni

### Setup
- URL bazowy: `/admin/cafes`
- Konto: konto Clerk z metadatą `role: ADMIN`
- Stan DB: min. 1 kawiarnia ze statusem `PENDING`

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Zaloguj się jako admin, przejdź na `/admin/cafes` | Lista wniosków kawiarni widoczna |
| 2 | Znajdź wniosek kawiarni do odrzucenia | Dane wniosku widoczne |
| 3 | Kliknij "Odrzuć" / "Reject" | Modal lub inline formularz z polem "Powód odrzucenia" |
| 4 | Wpisz powód odrzucenia | Pole akceptuje tekst |
| 5 | Potwierdź odrzucenie | Loading, potem komunikat sukcesu |
| 6 | Sprawdź że wniosek zniknął z listy PENDING | Kolejka skrócona o 1 |
| 7 | Sprawdź że profil kawiarni NIE jest widoczny na `/cafes` | Kawiarnia niewidoczna publicznie |

### Ukryte efekty
- Status kawiarni zmieniony z `PENDING` → `REJECTED` w DB
- Powód odrzucenia zapisywany w polu `rejectedReason`
- **Email wysyłany do właściciela kawiarni**: informacja o odrzuceniu z podanym powodem
- ISR revalidation wywołana dla `/admin/cafes`

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Próba odrzucenia bez podania powodu | Błąd walidacji: pole powodu jest wymagane |
| Bardzo długi powód (500+ znaków) | Input akceptuje lub pokazuje limit |
| Kliknij "Anuluj" w modalu | Modal zamknięty, wniosek bez zmian |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E
