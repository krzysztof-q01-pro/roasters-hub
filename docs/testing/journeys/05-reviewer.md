# Journey 05: Recenzent

Użytkownik (z kontem lub bez) zostawiający recenzję na profilu palarni lub kawiarni.

---

## Misja A — Recenzja palarni

### Setup
- URL bazowy: `/roasters/[slug]` (profil zweryfikowanej palarni)
- Konto: nie wymagane (formularz recenzji jest publiczny)
- Stan DB: min. 1 VERIFIED roaster

### Dane testowe

| Pole | Wartość testowa |
|------|----------------|
| Author name | `Jan Kowalski` |
| Rating | `4` |
| Comment | `Świetna palarnia, polecam ich kenijską kawę. Szybka dostawa.` |

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Wejdź na profil VERIFIED palarni `/roasters/[slug]` | Strona ładuje się, sekcja recenzji widoczna na dole |
| 2 | Znajdź formularz "Dodaj recenzję" | Pola: imię, gwiazdki (1-5), komentarz (opcjonalny) |
| 3 | Wpisz imię autora | Pole akceptuje tekst |
| 4 | Kliknij 4 gwiazdki (rating = 4) | 4 gwiazdki podświetlone, 5. nieaktywna |
| 5 | Wpisz komentarz | Pole akceptuje tekst |
| 6 | Kliknij "Wyślij recenzję" / "Submit" | Loading, potem komunikat sukcesu |
| 7 | Sprawdź że formularz się zresetował lub strona odświeżona | Komunikat "Recenzja wysłana, czeka na moderację" |
| 8 | Sprawdź sekcję publicznych recenzji | Nowa recenzja NIE jest widoczna (jest PENDING) |

### Ukryte efekty
- Rekord `Review` tworzony w DB ze statusem `PENDING`
- Recenzja niewidoczna publicznie do zatwierdzenia przez admina (Journey 04-C)
- `revalidatePath` NIE jest wywoływane — brak zmian widocznych dla użytkownika

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Wyślij bez wpisania imienia | Błąd walidacji: "Name must be at least 2 characters" |
| Imię 1 znak (np. "A") | Błąd walidacji: za krótkie |
| Imię > 100 znaków | Błąd walidacji lub input ograniczony do limitu |
| Wyślij bez wyboru ratingu | Błąd walidacji: rating jest wymagany |
| Rating 0 lub 6 (poza zakresem) | Błąd walidacji: "Rating must be 1-5" |
| Komentarz > 2000 znaków | Błąd walidacji lub input ograniczony do limitu |
| Wyślij bez komentarza (tylko imię + rating) | Sukces — komentarz jest opcjonalny |
| Profil palarni PENDING (niezweryfikowany) | Formularz recenzji niewidoczny lub disabled |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E

---

## Misja B — Recenzja kawiarni

### Setup
- URL bazowy: `/cafes/[slug]` (profil zweryfikowanej kawiarni)
- Konto: nie wymagane (formularz recenzji jest publiczny)
- Stan DB: min. 1 VERIFIED cafe

### Dane testowe

| Pole | Wartość testowa |
|------|----------------|
| Author name | `Anna Nowak` |
| Rating | `5` |
| Comment | `Świetna kawiarnia, świetna atmosfera. Polecam ich espresso.` |

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Wejdź na profil VERIFIED kawiarni `/cafes/[slug]` | Strona ładuje się, sekcja recenzji widoczna na dole |
| 2 | Znajdź formularz "Dodaj recenzję" / "Leave a review" | Pola: imię, gwiazdki (1-5), komentarz (opcjonalny) |
| 3 | Wpisz imię autora | Pole akceptuje tekst |
| 4 | Kliknij 5 gwiazdek (rating = 5) | 5 gwiazdek podświetlone |
| 5 | Wpisz komentarz | Pole akceptuje tekst |
| 6 | Kliknij "Wyślij recenzję" / "Submit" | Loading, potem komunikat sukcesu |
| 7 | Sprawdź że formularz się zresetował | Komunikat "Thank you for your review! It will appear after moderation." |
| 8 | Sprawdź sekcję publicznych recenzji | Nowa recenzja NIE jest widoczna (jest PENDING) |

### Ukryte efekty
- Rekord `Review` tworzony w DB ze statusem `PENDING`, `cafeId` ustawione
- Recenzja niewidoczna publicznie do zatwierdzenia przez admina (Journey 04-C)
- `revalidatePath` NIE jest wywoływane — brak zmian widocznych dla użytkownika

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Wyślij bez wpisania imienia | Błąd walidacji: "Name must be at least 2 characters" |
| Imię 1 znak (np. "A") | Błąd walidacji: za krótkie |
| Imię > 100 znaków | Błąd walidacji lub input ograniczony do limitu |
| Wyślij bez wyboru ratingu | Błąd walidacji: rating jest wymagany |
| Rating 0 lub 6 (poza zakresem) | Błąd walidacji: "Rating must be 1-5" |
| Komentarz > 2000 znaków | Błąd walidacji lub input ograniczony do limitu |
| Wyślij bez komentarza (tylko imię + rating) | Sukces — komentarz jest opcjonalny |
| Profil kawiarni PENDING (niezweryfikowany) | Formularz recenzji niewidoczny lub disabled |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E
