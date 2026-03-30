# Journey 04: Admin

Osoba zarządzająca platformą — weryfikuje wnioski, moderuje recenzje.

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

## Misja C — Moderacja recenzji

### Setup
- URL bazowy: `/admin/reviews`
- Konto: konto Clerk z metadatą `role: ADMIN`
- Stan DB: min. 1 recenzja ze statusem `PENDING` (złożona przez tester w Journey 05-A)

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Zaloguj się jako admin, przejdź na `/admin/reviews` | Lista recenzji PENDING widoczna |
| 2 | Sprawdź dane recenzji | Autor, rating (1-5), komentarz, nazwa palarni widoczne |
| 3 | Kliknij "Zatwierdź" / "Approve" | Loading, potem komunikat sukcesu |
| 4 | Sprawdź że recenzja zniknęła z listy moderacji | Kolejka skrócona |
| 5 | Przejdź na profil palarni `/roasters/[slug]` | Zatwierdzona recenzja widoczna publicznie |
| 6 | Wróć na `/admin/reviews`, znajdź inną recenzję | Kolejna recenzja PENDING |
| 7 | Kliknij "Odrzuć" / "Reject" | Recenzja usunięta lub zmiana statusu na REJECTED |
| 8 | Sprawdź profil palarni | Odrzucona recenzja NIE widoczna publicznie |

### Ukryte efekty
- Zatwierdzenie: status recenzji `PENDING` → `APPROVED`, revalidatePath dla `/roasters/[slug]`
- Odrzucenie: status recenzji `PENDING` → `REJECTED`
- Recenzje `APPROVED` widoczne publicznie na profilu palarni

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Pusta kolejka recenzji | Empty state: "Brak recenzji do moderacji" |
| Wejście na `/admin/reviews` jako nie-admin | Błąd 403 lub redirect |
| Recenzja dla palarni która od tego czasu jest REJECTED | Moderacja działa normalnie |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E
