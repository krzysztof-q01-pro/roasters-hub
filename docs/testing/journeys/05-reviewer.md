# Journey 05: Recenzent

Użytkownik (z kontem lub bez) zostawiający recenzję na profilu palarni lub kawiarni.

**Uwaga:** Formularz recenzji jest **wspólny** dla palarni i kawiarni (`shared/ReviewForm.tsx`). Ten sam komponent `shared/ReviewList.tsx` wyświetla recenzje na obu typach profili. Gwiazdki mają efekt hover — podświetlają się przy najechaniu przed kliknięciem.

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
| 2 | Znajdź formularz "Leave a Review" | Pola: "Your Name" (textbox), gwiazdki ★ z hover (1-5), "Comment (optional)" (textarea), przycisk "Submit Review" |
| 3 | Wpisz imię autora w pole "Your Name" | Pole akceptuje tekst |
| 4 | Najedź kursorem na 4. gwiazdkę | Gwiazdki 1-4 podświetlone (amber-500), 5. szara — hover preview |
| 5 | Kliknij 4. gwiazdkę (rating = 4) | 4 gwiazdki utrzymują podświetlenie, hover state znika |
| 6 | Wpisz komentarz | Pole akceptuje tekst |
| 7 | Kliknij "Submit Review" | Loading ("Submitting..."), potem komunikat sukcesu |
| 8 | Sprawdź komunikat po wysłaniu | "Thank you for your review! It will appear after moderation." |
| 9 | Sprawdź sekcję publicznych recenzji | Nowa recenzja NIE jest widoczna (jest PENDING). Istniejące APPROVED recenzje widoczne w układzie pionowym: autor, gwiazdki ★, komentarz, data (format "Apr 4, 2026") |

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
| Kliknij "Submit Review" bez wyboru ratingu | Błąd walidacji: "Please select a rating" |
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
| 2 | Znajdź formularz "Leave a Review" | **Ten sam formularz co na profilu palarni** — pola: "Your Name" (textbox), gwiazdki ★ z hover (1-5), "Comment (optional)" (textarea), przycisk "Submit Review" |
| 3 | Wpisz imię autora w pole "Your Name" | Pole akceptuje tekst |
| 4 | Najedź kursorem na 5. gwiazdkę | Gwiazdki 1-5 podświetlone (amber-500) — hover preview |
| 5 | Kliknij 5. gwiazdkę (rating = 5) | 5 gwiazdek utrzymuje podświetlenie, hover state znika |
| 6 | Wpisz komentarz | Pole akceptuje tekst |
| 7 | Kliknij "Submit Review" | Loading ("Submitting..."), potem komunikat sukcesu |
| 8 | Sprawdź komunikat po wysłaniu | "Thank you for your review! It will appear after moderation." |
| 9 | Sprawdź sekcję publicznych recenzji | Nowa recenzja NIE jest widoczna (jest PENDING). Istniejące APPROVED recenzje widoczne w układzie pionowym: autor, gwiazdki ★, komentarz, data (format "Apr 4, 2026") |

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
| Kliknij "Submit Review" bez wyboru ratingu | Błąd walidacji: "Please select a rating" |
| Rating 0 lub 6 (poza zakresem) | Błąd walidacji: "Rating must be 1-5" |
| Komentarz > 2000 znaków | Błąd walidacji lub input ograniczony do limitu |
| Wyślij bez komentarza (tylko imię + rating) | Sukces — komentarz jest opcjonalny |
| Profil kawiarni PENDING (niezweryfikowany) | Formularz recenzji niewidoczny lub disabled |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E
