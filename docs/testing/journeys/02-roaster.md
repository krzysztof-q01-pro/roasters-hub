# Journey 02: Właściciel palarni

Osoba rejestrująca palarnię na platformie i zarządzająca profilem po weryfikacji.

---

## Misja A — Rejestracja (3-step wizard)

### Setup
- URL bazowy: `/register`
- Konto: nowe konto Clerk lub brak konta (form jest publiczny, konto tworzone po)
- Stan DB: brak — tworzymy nowy rekord

### Dane testowe do wypełnienia

| Pole | Wartość testowa |
|------|----------------|
| Name | `Test Roastery Kraków` |
| City | `Kraków` |
| Country | `Poland` |
| Description | `Specialty coffee roastery focused on light roasts` |
| Website | `https://example.com` |
| Email | `test@example.com` |
| Instagram | `@testroastery` |
| Shop URL | `https://shop.example.com` |
| Certifications | `Organic`, `Rainforest Alliance` |
| Origins | `Ethiopia`, `Colombia` |
| Roast styles | `Light`, `Medium` |

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Wejdź na `/register` | Formularz widoczny, krok 1 aktywny, pasek postępu pokazuje "1/3" |
| 2 | Wypełnij pole "Name" wartością testową | Pole akceptuje tekst |
| 3 | Wypełnij "City" i "Country" | Pola akceptują tekst |
| 4 | Opcjonalnie wypełnij opis, website, email, instagram, shopUrl | Pola akceptują odpowiednie formaty |
| 5 | Kliknij "Dalej" / "Next" | Przejście do kroku 2 |
| 6 | Na kroku 2 zaznacz certyfikaty checkboxami | Zaznaczone certyfikaty są wyróżnione |
| 7 | Dodaj origins (kraje pochodzenia kawy) | Tagi pojawiają się po dodaniu |
| 8 | Wybierz roast styles | Opcje zaznaczone |
| 9 | Kliknij "Dalej" / "Next" | Przejście do kroku 3 (podgląd) |
| 10 | Na kroku 3 sprawdź wszystkie dane | Wszystkie wypełnione dane widoczne w podglądzie |
| 11 | Kliknij "Wyślij zgłoszenie" / "Submit" | Spinner/loading, potem komunikat sukcesu |
| 12 | Sprawdź komunikat po wysłaniu | Potwierdzenie wysłania, info że wniosek jest rozpatrywany |

### Ukryte efekty
- Rekord `Roaster` tworzony w DB ze statusem `PENDING`
- Unikalny slug generowany automatycznie (np. `test-roastery-krakow`)
- **Email wysyłany do adminów**: notyfikacja o nowym wniosku
- **Email wysyłany do wnioskodawcy**: potwierdzenie przyjęcia zgłoszenia
- Strona `/admin/pending` jest rewalidowana (ISR)

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Kliknij "Dalej" z pustym polem "Name" (krok 1) | Błąd walidacji pod polem: "Name must be at least 2 characters" |
| Kliknij "Dalej" z pustym "City" | Błąd walidacji: "City is required" |
| Website bez `https://` (np. `example.com`) | Błąd walidacji: "URL must use http or https" |
| Niepoprawny email (np. `test@`) | Błąd walidacji: "Invalid email" |
| Niepoprawny Instagram (np. `test user`) | Błąd walidacji: "Invalid Instagram handle" |
| Kliknij "Wstecz" na kroku 2 | Powrót do kroku 1 z zachowanymi danymi |
| Kliknij "Wstecz" na kroku 3 | Powrót do kroku 2 z zachowanymi danymi |
| Duplikat nazwy (taka sama nazwa już istnieje w DB) | Sukces — slug otrzymuje suffix (np. `test-roastery-krakow-2`) |
| Description > 2000 znaków | Błąd walidacji lub input ograniczony do limitu |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E

---

## Misja B — Dashboard po weryfikacji

### Setup
- URL bazowy: `/dashboard/roaster`
- Konto: konto Clerk z metadatą `role: ROASTER`, powiązany roaster ze statusem `VERIFIED`
- Stan DB: roaster zweryfikowany przez admina

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Zaloguj się jako roaster | Przekierowanie do `/dashboard/roaster` lub kliknij link w nawigacji |
| 2 | Sprawdź sekcję statystyk | Widoczne liczby: page views, website clicks, shop clicks, contact clicks |
| 3 | Znajdź formularz edycji profilu | Pola z aktualnymi danymi (opis, website, email, instagram, shopUrl) |
| 4 | Zmień pole "Description" | Pole akceptuje nową wartość |
| 5 | Kliknij "Zapisz" / "Save" | Loading, potem komunikat sukcesu |
| 6 | Odśwież stronę | Zmieniony opis nadal widoczny |
| 7 | Znajdź sekcję upload logo | Przycisk upload lub drag-and-drop area widoczna |
| 8 | Wgraj plik JPG < 4MB | Progress bar lub spinner, potem miniatura logo |
| 9 | Sprawdź że logo widoczne | Logo wyświetlane w podglądzie lub na górze formularza |
| 10 | Przejdź na publiczny profil `/roasters/[slug]` | Nowe logo i opis widoczne publicznie |

### Ukryte efekty
- Zapis edycji: aktualizuje rekord w DB, wywołuje `revalidatePath` dla `/roasters/[slug]`
- Upload logo: plik trafia do Uploadthing CDN, URL zapisywany w DB (`logoUrl`)
- Statystyki pobierane z tabeli `ProfileEvent` — agregacja po typie eventu

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Upload pliku > 4MB | Błąd: plik za duży |
| Upload pliku niewłaściwego formatu (np. `.pdf`) | Błąd: nieobsługiwany format |
| Wejście na `/dashboard/roaster` bez logowania | Redirect do `/sign-in` |
| Wejście na `/dashboard/roaster` jako CAFE (nie ROASTER) | Błąd 403 lub redirect |
| Zapisz formularz z niepoprawnym URL website | Błąd walidacji: "URL must use http or https" |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E

---

## Misja C — "Where to drink" (kawiarnie serwujące palarnię)

### Setup
- URL bazowy: `/roasters/[slug]`
- Konto: nie wymagane
- Stan DB: min. 1 VERIFIED roaster z min. 1 CafeRoasterRelation (kawiarnia serwująca tę palarnię)

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Wejdź na profil zweryfikowanej palarni `/roasters/[slug]` | Strona ładuje się, profil widoczny |
| 2 | Przewiń do sekcji "Where to drink" | Sekcja widoczna pod główną treścią profilu, nagłówek w języku angielskim |
| 3 | Sprawdź listę kawiarni | Karty kawiarni widoczne z nazwami, miastem, krajem |
| 4 | Kliknij kartę kawiarni | Przekierowanie na `/cafes/[slug]` |
| 5 | Na profilu kawiarni sprawdź sekcję "Roasters we serve" | Oryginalna palarnia widoczna na liście |
| 6 | Wróć na profil palarni | Nawigacja działa poprawnie |

### Ukryte efekty
- Brak — sekcja jest display-only, dane są pobierane przez ISR

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Palarnia bez CafeRoasterRelation (brak kawiarni) | Sekcja "Where to drink" pusta z komunikatem "This roastery is not yet available in any cafe." |
| Palarnia PENDING lub REJECTED | Sekcja "Where to drink" niewidoczna lub profil niedostępny publicznie |
| Link do kawiarni z REJECTED statusem | Link niewidoczny — relacje tylko z VERIFIED cafes |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E
