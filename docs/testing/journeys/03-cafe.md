# Journey 03: Właściciel kawiarni

Osoba rejestrująca kawiarnię na platformie i zarządzająca profilem po weryfikacji.

---

## Misja A — Rejestracja kawiarni (3-step wizard)

### Setup

- URL bazowy: `/register/cafe`
- Konto: nowe konto Clerk lub brak konta (formularz jest publiczny, konto tworzone po wysłaniu)
- Stan DB: brak — tworzymy nowy rekord

### Dane testowe do wypełnienia

| Pole | Wartość testowa |
|------|----------------|
| Name | `Test Cafe Warsaw` |
| City | `Warsaw` |
| Country | `Poland` |
| Description | `Specialty coffee cafe serving local roasters` |
| Address | `ul. Krakowska 15` |
| Lat | `52.2297` |
| Lng | `21.0122` |
| Website | `https://testcafe.example.com` |
| Instagram | `@testcafewarsaw` |
| Phone | `+48 123 456 789` |

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Wejdź na `/register/cafe` | Formularz widoczny, krok 1 aktywny, pasek postępu pokazuje "1/3" |
| 2 | Wypełnij pole "Name" wartością testową | Pole akceptuje tekst |
| 3 | Wypełnij "City" i "Country" | Pola akceptują tekst |
| 4 | Opcjonalnie wypełnij opis | Pole akceptuje tekst |
| 5 | Kliknij "Dalej" / "Next" | Przejście do kroku 2 |
| 6 | Na kroku 2 wypełnij "Address" | Pole akceptuje tekst |
| 7 | Wypełnij opcjonalnie Lat/Lng (koordynaty) | Pola akceptują liczby |
| 8 | Wypełnij opcjonalnie Website, Instagram, Phone | Pola akceptują wartości |
| 9 | Kliknij "Dalej" / "Next" | Przejście do kroku 3 (podgląd) |
| 10 | Na kroku 3 sprawdź wszystkie dane | Wszystkie wypełnione dane widoczne w podglądzie |
| 11 | Kliknij "Wyślij zgłoszenie" / "Submit" | Spinner/loading, potem komunikat sukcesu |
| 12 | Sprawdź komunikat po wysłaniu | Potwierdzenie wysłania, info że wniosek jest rozpatrywany |

### Ukryte efekty

- Rekord `Cafe` tworzony w DB ze statusem `PENDING`
- Unikalny slug generowany automatycznie (np. `test-cafe-warsaw`)
- **Email wysyłany do adminów**: notyfikacja o nowym wniosku kawiarni
- **Email wysyłany do wnioskodawcy**: potwierdzenie przyjęcia zgłoszenia
- Profil użytkownika aktualizowany: `role: CAFE`, `cafeId: [nowe id]`

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Kliknij "Dalej" z pustym polem "Name" (krok 1) | Błąd walidacji: "Name must be at least 2 characters" |
| Kliknij "Dalej" z pustym "City" | Błąd walidacji: "City is required" |
| Website bez `https://` (np. `example.com`) | Błąd walidacji: "URL must use http or https" |
| Niepoprawny Instagram (np. `test user`) | Błąd walidacji: "Invalid Instagram handle" |
| Lat poza zakresem (-90 do 90) | Błąd walidacji: "Latitude must be between -90 and 90" |
| Lng poza zakresem (-180 do 180) | Błąd walidacji: "Longitude must be between -180 and 180" |
| Kliknij "Wstecz" na kroku 2 | Powrót do kroku 1 z zachowanymi danymi |
| Duplikat nazwy (taka sama nazwa już istnieje w DB) | Sukces — slug otrzymuje suffix (np. `test-cafe-warsaw-2`) |

### Status

- [ ] Przetestowane manualnie
- [ ] Pokryte E2E

---

## Misja B — Dashboard właściciela (edycja profilu)

### Setup

- URL bazowy: `/dashboard/cafe`
- Konto: konto Clerk z metadatą `role: CAFE`, powiązana kawiarnia ze statusem `VERIFIED`
- Stan DB: zweryfikowana kawiarnia w DB

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Zaloguj się jako cafe owner | Przekierowanie do `/dashboard/cafe` lub kliknij link w nawigacji |
| 2 | Sprawdź dane kawiarni | Nazwa, miasto, kraj, opis widoczne |
| 3 | Znajdź formularz edycji profilu | Pola z aktualnymi danymi (opis, address, lat/lng, website, instagram, phone) |
| 4 | Zmień pole "Description" | Pole akceptuje nową wartość |
| 5 | Zmień pole "Address" | Pole akceptuje nową wartość |
| 6 | Kliknij "Zapisz" / "Save" | Loading, potem komunikat sukcesu |
| 7 | Odśwież stronę | Zmienione dane nadal widoczne |
| 8 | Znajdź sekcję upload logo | Przycisk upload lub drag-and-drop area widoczna |
| 9 | Wgraj plik JPG < 4MB | Progress bar lub spinner, potem miniatura logo |
| 10 | Sprawdź że logo widoczne | Logo wyświetlane w podglądzie lub na górze formularza |
| 11 | Przejdź na publiczny profil `/cafes/[slug]` | Nowe dane i logo widoczne publicznie |

### Ukryte efekty

- Zapis edycji: aktualizuje rekord w DB, wywołuje `revalidatePath` dla `/cafes/[slug]`, `/map`
- Upload logo: plik trafia do Uploadthing CDN, URL zapisywany w DB (`logoUrl`)

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Upload pliku > 4MB | Błąd: plik za duży |
| Upload pliku niewłaściwego formatu (np. `.pdf`) | Błąd: nieobsługiwany format |
| Wejście na `/dashboard/cafe` bez logowania | Redirect do `/sign-in` |
| Wejście na `/dashboard/cafe` jako ROASTER (nie CAFE) | Błąd 403 lub redirect |
| Zapisz formularz z niepoprawnym URL website | Błąd walidacji: "URL must use http or https" |

### Status

- [ ] Przetestowane manualnie
- [ ] Pokryte E2E

---

## Misja C — Zarządzanie relacjami z palarniami

### Setup

- URL bazowy: `/dashboard/cafe`
- Konto: konto Clerk z metadatą `role: CAFE`, powiązana kawiarnia ze statusem `VERIFIED`
- Stan DB: min. 2 VERIFIED roasters w bazie

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Zaloguj się jako cafe owner, przejdź do `/dashboard/cafe` | Dashboard widoczny |
| 2 | Znajdź sekcję "Palarnie które serwujemy" / "Roasters we serve" | Pusta lista lub lista istniejących relacji |
| 3 | Znajdź pole wyszukiwania palarni | Pole tekstowe widoczne |
| 4 | Wpisz nazwę istniejącej palarni (min. 2 znaki) | Lista wyników wyszukiwania pojawia się |
| 5 | Kliknij palarnię z wyników | Relacja dodana, palarnia pojawia się na liście |
| 6 | Sprawdź komunikat sukcesu | Toast lub komunikat "Palarnia dodana" |
| 7 | Dodaj drugą palarnię (powtórz kroki 4-5) | Dwie palarnie na liście |
| 8 | Przejdź na profil jednej z dodanych palarni `/roasters/[slug]` | Kawiarnia widoczna w sekcji "Gdzie wypić" |
| 9 | Wróć do `/dashboard/cafe` | Dashboard nadal widoczny |
| 10 | Kliknij "Usuń" przy pierwszej palarni na liście | Palarnia znika z listy, toast sukcesu |
| 11 | Odśwież stronę | Lista zawiera tylko jedną palarnię |
| 12 | Przejdź na profil palarni `/roasters/[slug]` | Kawiarnia już nie widoczna w "Gdzie wypić" |

### Ukryte efekty

- Dodanie relacji: tworzy rekord `CafeRoasterRelation` w DB
- Usunięcie relacji: usuwa rekord `CafeRoasterRelation` z DB
- Oba działania wywołują `revalidatePath('/cafes/[slug]')` i `revalidatePath('/roasters/[slug]')`

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Wyszukiwanie z < 2 znakami | Brak wyników (wymagane min. 2 znaki) |
| Wyszukiwanie nieistniejącej palarni | Brak wyników, komunikat "Nie znaleziono" |
| Próba dodania palarni PENDING | Brak w wynikach wyszukiwania — tylko VERIFIED |
| Dodanie duplikatu (ta sama palarnia już na liście) | UPSERT — brak duplikatu, toast sukcesu |
| Próba usunięcia gdy lista pusta | Przycisk niewidoczny lub disabled |
| Wejście na `/dashboard/cafe` bez logowania | Redirect do `/sign-in` |

### Status

- [ ] Przetestowane manualnie
- [ ] Pokryte E2E

---

## Misja D — Zapisane palarnie (saved roasters)

### Setup

- URL bazowy: `/dashboard/saved-roasters`
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
| 6 | Przejdź do `/dashboard/saved-roasters` | Lista zapisanych palarni — min. 1 pozycja |
| 7 | Sprawdź że zapisana palarnia jest na liście | Nazwa i link do profilu widoczne |
| 8 | Zapisz drugą palarnię (powtórz kroki 3-5) | Dwie palarnie na liście w dashboardzie |
| 9 | Na dashboardzie kliknij "Usuń" przy pierwszej palarni | Palarnia znika z listy, komunikat sukcesu |
| 10 | Odśwież stronę `/dashboard/saved-roasters` | Lista zawiera tylko jedną palarnię |

### Ukryte efekty

- Zapis: tworzy rekord `SavedRoaster` w DB (upsert — podwójny klik nie duplikuje)
- Usunięcie: usuwa rekord `SavedRoaster` z DB
- Oba działania wywołują `revalidatePath('/dashboard/saved-roasters')`

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Próba zapisu bez logowania | Redirect do `/sign-in`, powrót po logowaniu |
| Kliknij "Zapisz" dwa razy na tym samym profilu | Brak duplikatu — upsert, przycisk może wrócić do stanu "unsaved" |
| Dashboard z pustą listą | Komunikat "Nie masz jeszcze zapisanych palarni" lub empty state |
| Wejście na `/dashboard/saved-roasters` jako ROASTER (nie CAFE) | Błąd 403 lub redirect |
| Wejście na `/dashboard/saved-roasters` bez logowania | Redirect do `/sign-in` |

### Status

- [ ] Przetestowane manualnie
- [ ] Pokryte E2E