# Journey 01: Anonimowy gość

Użytkownik bez konta przeglądający platformę. Reprezentuje większość ruchu organicznego.

---

## Misja A — Odkryj palarnie

### Setup
- URL bazowy: `https://beanmap-web.vercel.app` (lub localhost:3000)
- Konto: nie wymagane
- Stan DB: min. 3 VERIFIED roasters z różnymi krajami

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Wejdź na `/` (homepage) | Strona ładuje się, widoczne statystyki: liczba palarni, krajów, logo |
| 2 | Sprawdź sekcję statystyk | Min. 1 liczba > 0 wyświetlona (np. "47 roasters") |
| 3 | Kliknij CTA "Browse roasters" lub link do katalogu | Przekierowanie na `/roasters` |
| 4 | Sprawdź listę palarni | Karty palarni widoczne, każda ma nazwę i kraj |
| 5 | Kliknij dropdown filtra "Country" | Lista dostępnych krajów się rozwija |
| 6 | Wybierz jeden kraj z listy | Lista odświeża się, pokazuje tylko palarnie z wybranego kraju |
| 7 | Kliknij "Clear" lub usuń filtr | Lista wraca do wszystkich palarni |
| 8 | Kliknij filtr "Certifications" | Opcje certyfikatów dostępne (Organic, Rainforest Alliance, itd.) |
| 9 | Wybierz certyfikat | Lista filtruje się do palarni z tym certyfikatem |
| 10 | Wpisz nazwę palarni w pole search | Lista filtruje się na bieżąco do pasujących wyników |
| 11 | Wyczyść search | Lista wraca do pełnego widoku |

### Ukryte efekty
_(brak dla tej misji — filtrowanie i search są po stronie klienta/ISR, bez zapisu do DB)_

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Filtr zwraca 0 wyników | Komunikat "No roasters found" lub pusty stan — bez błędu |
| Search: bardzo długa nazwa (100+ znaków) | Input akceptuje, brak crash, brak wyników |
| Search: znaki specjalne (`<script>`, `"`) | Wyświetla brak wyników, brak błędu XSS |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E

---

## Misja B — Obejrzyj profil i wejdź w interakcję

### Setup
- URL bazowy: `/roasters`
- Konto: nie wymagane
- Stan DB: min. 1 VERIFIED roaster z wypełnionymi polami website, shopUrl, email

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Z katalogu kliknij kartę palarni | Przekierowanie na `/roasters/[slug]` |
| 2 | Sprawdź sekcję nagłówka | Nazwa, kraj, miasto, opis widoczne |
| 3 | Sprawdź sekcję certyfikatów i origins | Tagi certyfikatów i krajów pochodzenia wyświetlone (jeśli uzupełnione) |
| 4 | Kliknij przycisk "Website" | Nowa karta otwiera się z adresem strony palarni |
| 5 | Wróć do profilu, kliknij "Shop" | Nowa karta otwiera się ze sklepem online |
| 6 | Kliknij "Contact" (email) | Otwiera klient email lub kopiuje adres |
| 7 | Kliknij "Share" | Wyświetla opcje udostępnienia lub kopiuje URL |
| 8 | Przewiń do sekcji recenzji | Widoczne zaakceptowane recenzje (lub komunikat "no reviews yet") |

### Ukryte efekty
- **Każdy klik przycisku** (Website, Shop, Contact, Share) zapisuje event w tabeli `ProfileEvent` w DB:
  - Website → `WEBSITE_CLICK`
  - Shop → `SHOP_CLICK`
  - Contact → `CONTACT_CLICK`
  - Share → `SHARE_CLICK`
- Wejście na stronę profilu zapisuje `PAGE_VIEW`
- IP użytkownika jest anonimizowane (SHA-256 hash) przed zapisem — nie można go odczytać

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Roaster bez website | Przycisk "Website" niewidoczny lub disabled |
| Roaster bez shopUrl | Przycisk "Shop" niewidoczny lub disabled |
| Roaster bez email | Przycisk "Contact" niewidoczny lub disabled |
| Slug nie istnieje (`/roasters/nieistniejacy`) | Strona 404 |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E

---

## Misja C — Mapa

### Setup
- URL bazowy: `/map`
- Konto: nie wymagane
- Stan DB: min. 1 VERIFIED roaster z wypełnionymi polami `lat` i `lng`

### Kroki

| # | Akcja | Oczekiwany wynik |
|---|-------|-----------------|
| 1 | Wejdź na `/map` | Mapa Leaflet ładuje się, widoczne kafelki mapy |
| 2 | Poczekaj na załadowanie markerów | Min. 1 pin na mapie widoczny |
| 3 | Kliknij marker palarni | Popup otwiera się z nazwą i lokalizacją |
| 4 | W popupie kliknij link "Zobacz profil" | Przekierowanie na `/roasters/[slug]` |
| 5 | Wróć na `/map` | Mapa wraca do poprzedniego widoku |
| 6 | Sprawdź widok mobilny (viewport < 768px) | Sidebar/lista zwinięta, mapa zajmuje pełen ekran, przycisk toggle widoczny |
| 7 | Kliknij przycisk toggle sidebar (mobile) | Lista palarni się pojawia/chowa |

### Ukryte efekty
- Kliknięcie linku w popupie do profilu → zapisuje `MAP_CLICK` event w DB dla danej palarni

### Edge cases

| Scenariusz | Oczekiwany wynik |
|-----------|-----------------|
| Żaden roaster nie ma lat/lng | Mapa wyświetla się bez markerów, bez błędu |
| Słabe połączenie — kafelki mapy się nie ładują | Szare tło zamiast mapy, markery i tak widoczne |

### Status
- [ ] Przetestowane manualnie
- [ ] Pokryte E2E
