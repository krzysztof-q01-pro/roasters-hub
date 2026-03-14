# Roasters Hub — Dokument Koncepcji Produktu

**Wersja:** 0.3
**Data:** 2026-03-14
**Status:** Roboczy

---

## 1. Idea

Roasters Hub to platforma łącząca **palarnie kawy** (roasters), **kawiarnie** (cafés/buyers) i **miłośników kawy specialty** (consumers). Jej głównym celem jest stworzenie centralnego, globalnego katalogu palarni, który pozwoli kawiarniom odkrywać nowych dostawców ziaren, a konsumentom — znajdować palarnie dopasowane do ich gustu.

Branża specialty coffee jest rozproszona. Palarnie — szczególnie te mniejsze — mają ograniczone możliwości dotarcia do nowych klientów. Kawiarnie często kupują od tych samych dostawców, bo po prostu nie wiedzą o alternatywach. Konsumenci z kolei chcą świadomie wybierać kawę, ale brakuje im jednego miejsca, w którym mogliby porównać palarnie z całego świata. Roasters Hub rozwiązuje ten problem, będąc **miejscem spotkania wszystkich trzech stron**.

Relacje B2B (palarnie ↔ kawiarnie) pozostają rdzeniem platformy, natomiast konsumenci pełnią rolę **motoru skali** — generują ruch i zainteresowanie, co zwiększa wartość platformy dla palarni i kawiarni. Monetyzacja konsumenta jest odroczona do momentu osiągnięcia masy krytycznej.

---

## 2. Dla kogo

### Palarnie kawy (Roasters)
Małe i średnie palarnie specialty coffee, które chcą:
- zwiększyć swoją widoczność online
- dotrzeć do nowych kawiarni jako klientów
- zaprezentować swoją ofertę (origin, profil palenia, certyfikaty)
- prowadzić kampanie promocyjne

### Kawiarnie (Cafés / Buyers)
Właściciele i kupcy kawy w kawiarniach, którzy chcą:
- odkrywać nowe palarnie z całego świata
- znaleźć dostawcę dopasowanego do profilu ich lokalu
- kontaktować się bezpośrednio z palarniami

### Miłośnicy kawy (Coffee Enthusiasts / Consumers)
Home brewerzy, podróżnicy kawowi i świadomi konsumenci, którzy chcą:
- odkrywać nowe palarnie i ziarna z całego świata
- filtrować po originach, profilach smakowych, certyfikatach (direct trade, organic)
- planować podróże kawowe — znajdować palarnie i kawiarnie w nowych miastach
- kupować ziarna bezpośrednio od palarni (DTC — link do sklepu online)

**Rola w ekosystemie:** Konsumenci generują ruch i zainteresowanie platformą. Ich obecność zwiększa wartość profilu palarni (więcej ekspozycji, kontakt DTC) oraz odkrywalność kawiarni. Na start — darmowy dostęp bez rejestracji. Docelowo — konta, personalizacja, subskrypcje.

---

## 3. Propozycja wartości

| Dla palarni | Dla kawiarni | Dla konsumenta |
|-------------|--------------|----------------|
| Profil w globalnym katalogu | Dostęp do setek palarni w jednym miejscu | Odkrywanie palarni z całego świata |
| Dotarcie do klientów B2B i DTC | Filtrowanie po kraju, certyfikatach, profilu | Filtrowanie po originach, smaku, certyfikatach |
| Narzędzia do promocji (kampanie) | Mapa palarni | Mapa palarni — planowanie podróży kawowych |
| Wiarygodność (weryfikacja profilu) | Bezpośredni kontakt z palarniami | Bezpośredni link do sklepu online palarni |
| Ekspozycja wśród konsumentów (skala) | Odkrywalność przez konsumentów | Informacje o direct trade i procesach — świadome zakupy |

---

## 4. Jak to działa

### Dla kawiarni (bez rejestracji)
1. Wchodzi na platformę
2. Przegląda katalog palarni — filtruje po lokalizacji, profilu, certyfikatach
3. Klika w profil palarni — widzi szczegóły, ofertę, dane kontaktowe
4. Kontaktuje się z palarnią bezpośrednio (email, formularz, link zewnętrzny)

### Dla konsumenta (bez rejestracji)
1. Wchodzi na platformę
2. Przegląda katalog palarni — filtruje po lokalizacji, originach, profilu smakowym, certyfikatach
3. Klika w profil palarni — widzi ofertę, link do sklepu online, social media
4. Kupuje ziarna bezpośrednio od palarni (link zewnętrzny) lub kontaktuje się
5. Dzieli się odkryciem — "Share this roaster" (social media, link)
6. *(Przyszłość)* Odkrywa kawiarnie serwujące kawę z danej palarni

### Dla palarni
1. Rejestruje się na platformie
2. Wypełnia profil (opis, lokalizacja, zdjęcia, certyfikaty, oferta ziaren)
3. Czeka na weryfikację przez admina
4. Po weryfikacji — profil jest publiczny w katalogu
5. Opcjonalnie — uruchamia kampanię promocyjną (wyróżnienie w katalogu, bannery)

### Dla admina
1. Weryfikuje zgłoszenia palarni (manualnie — przegląd danych, ew. dokumentów)
2. Aktywuje lub odrzuca profil
3. Zarządza bazą palarni (edycja, dezaktywacja)
4. Zarządza kampaniami reklamowymi

---

## 5. Model biznesowy

### Freemium dla palarni

| Plan | Co zawiera | Cena |
|------|------------|------|
| **Free** | Podstawowy profil w katalogu, weryfikacja, widoczność | 0 |
| **Featured** | Wyróżnienie w wynikach wyszukiwania, etykieta "Featured" | TBD |
| **Pro** *(przyszłość)* | Zaawansowane statystyki, priorytetowy kontakt, sample management | TBD |

### Reklamy

- **Kampanie sponsorowane** — palarnie mogą wykupić kampanię reklamową (baner na stronie głównej, wyróżnienie w kategorii/regionie)
- Obsługa płatności za kampanie: **Stripe** (automatyczne płatności)
- Model: CPM (cost per mille) lub flat fee na okres

### Przyszłościowo (v2+)
- Prowizja od obsługi sampli / zamówień przez platformę
- Subskrypcja premium dla kawiarni (zaawansowane filtry, historia, notatki)
- **Affiliate links / DTC** — link "Shop online" na profilach palarni z trackingiem → prowizja od sprzedaży do konsumentów
- **Reklamy kontekstowe** — skierowane do konsumentów (sprzęt kawowy, subskrypcje ziaren, kursy baristyczne)
- **Premium dla konsumentów** — zaawansowane filtry, notatki degustacyjne, wishlist, alerty "nowa palarnia w Twoim regionie"
- **Profile kawiarni (płatne)** — kawiarnia prezentuje serwowane palarnie → odkrywalność przez konsumentów

---

## 6. Krajobraz konkurencyjny

| Rozwiązanie | Co robi | Czego nie robi / luka |
|-------------|---------|----------------------|
| **European Coffee Trip** | Katalog kawiarni w Europie + content (video, blog) | Fokus na kawiarnie, nie palarnie. Brak B2B. Tylko Europa. |
| **Google Maps** | Uniwersalne wyszukiwanie lokalne — palarnie i kawiarnie | Brak filtrów specialty (certyfikaty, origin, direct trade). Brak dedykowanego UX dla discovery palarni. |
| **Beanconqueror / Coffeection** | Aplikacje do trackowania i oceniania kawy (konsumenci) | Nie łączą konsumenta z palarniami. Brak katalogu, brak B2B. |
| **Cropster / Roast.World** | Narzędzia operacyjne dla palarni (profiling, inventory, QC) | Nie zajmują się discovery ani marketingiem. Narzędzia wewnętrzne, nie katalog. |
| **Instagram / TikTok** | Organiczne odkrywanie palarni przez content | Brak struktury, filtrów, porównywalności. Algorytm decyduje o widoczności. |

**Pozycjonowanie Roasters Hub:** jedyna platforma łącząca **discovery palarni** (dla konsumentów i kawiarni) z **generowaniem leadów B2B** — w jednym miejscu. Żadne istniejące rozwiązanie nie obsługuje trójkąta palarnia ↔ kawiarnia ↔ konsument.

---

## 7. Strategia retencji

Pozyskanie użytkownika to dopiero początek — kluczowe jest, aby wracał. Mechanizmy retencji per persona:

### Palarnie
- **Statystyki profilu** — wyświetlenia, kliknięcia w dane kontaktowe, kliknięcia "Shop online" → palarnia widzi ROI
- **Powiadomienia** — nowe zapytania od kawiarni, nowe recenzje od konsumentów
- **Sezonowe prompty** — "Zaktualizuj ofertę na nowy sezon", "Dodaj nowe ziarna"

### Kawiarnie
- **Alerty** — "Nowa palarnia w Twoim regionie", "Nowe ziarna od palarni, które obserwujesz"
- **Zapisane / ulubione** palarnie — szybki dostęp do kontaktów
- **Newsletter** — digest nowych palarni, sezonowe oferty, trendy

### Konsumenci
- **Personalizowane rekomendacje** — na podstawie ulubionych originów, certyfikatów, profili smakowych
- **"Roaster of the Week"** — cotygodniowe odkrycie nowej palarni (newsletter + social)
- **Wishlist / ulubione** — palarnie do wypróbowania, odwiedzone palarnie
- **Content** — edukacyjne artykuły, origin stories, behind-the-scenes z palarni

---

## 8. Kluczowe funkcje — MVP

### Katalog palarni
- Lista palarni z filtrowaniem (kraj, region, certyfikaty, typ palenia)
- Mapa palarni (pins na mapie świata)
- Strona profilu palarni

### Profil palarni
- Nazwa, opis, kraj, miasto
- Zdjęcia (logo, palarnia, ziarna)
- Certyfikaty (Fair Trade, Organic, Rainforest Alliance, etc.)
- Oferta (typy ziaren, origin, profil smakowy)
- Dane kontaktowe (email, www, social media)
- Znaczek "Verified"

### Rejestracja i konto palarni
- Rejestracja z podstawowymi danymi
- Panel zarządzania profilem
- Status weryfikacji

### Panel admina
- Lista zgłoszeń palarni do weryfikacji
- Podgląd i edycja profilu
- Aktywacja / odrzucenie / dezaktywacja

### Kampanie (podstawowe)
- Możliwość zgłoszenia kampanii przez palarnię
- Płatność przez Stripe
- Wyświetlanie wyróżnień w katalogu

---

## 9. Poza MVP (backlog)

- Obsługa sampli — flow zamawiania próbek przez platformę
- Konta dla kawiarni — ulubione palarnie, historia, notatki
- **Konta dla konsumentów** — ulubione palarnie, wishlist, notatki degustacyjne, historia
- Recenzje i oceny palarni (przez zweryfikowane kawiarnie i konsumentów)
- **Profile kawiarni** — prezentacja serwowanych palarni, odkrywalność przez konsumentów
- **Affiliate links / "Shop online"** — tracking i prowizja od sprzedaży DTC
- Newsletter / digest dla kawiarni i konsumentów ("Nowe palarnie w Twoim regionie")
- **Personalizowane rekomendacje** — na podstawie preferencji użytkownika (origin, profil, certyfikaty)
- API dla partnerów
- Wielojęzyczność (i18n)
- Aplikacja mobilna

---

## 10. Zakres geograficzny

Platforma działa globalnie od pierwszego dnia, ale baza palarni na start będzie niewielka i będzie stopniowo rozrastać się organicznie. Interfejs w języku angielskim jako język bazowy.

---

## 11. Zasady weryfikacji palarni (MVP)

Weryfikacja jest manualna — admin sprawdza:
- czy palarnia istnieje (strona www, social media, Google Maps)
- czy dane są kompletne i wiarygodne
- opcjonalnie: dokumenty rejestracji firmy

Po weryfikacji profil otrzymuje znaczek **"Verified Roaster"** i jest widoczny publicznie.

---

## 12. Marketing i pozyskiwanie ruchu

### Faza 0 — przed launchem (cold start)

Największe ryzyko katalogu/marketplace to problem kurczaka i jajka: kawiarnie nie przyjdą, jeśli nie ma palarni, palarnie nie przyjdą, jeśli nie ma kawiarni. Rozwiązanie: **najpierw zapełnić bazę palarni ręcznie**, zanim platforma jest publiczna.

- Ręczne wprowadzenie 50–100 palarni z publicznych źródeł (strony www, Instagram, Google Maps, istniejące listy specialty coffee)
- Dopiero z wypełnioną bazą — otwarcie platformy

### Kanały pozyskiwania palarni (supply side)

| Kanał | Działanie | Koszt |
|-------|-----------|-------|
| **Cold outreach email** | Bezpośredni email do palarni z zaproszeniem do darmowego profilu | Czas |
| **LinkedIn** | Kontakt z właścicielami i head roasters przez LinkedIn | Czas |
| **Instagram / TikTok** | Platformy są mocne w specialty coffee — DM do aktywnych palarni | Czas |
| **Społeczności** | Fora i grupy (Slack SCA, Reddit r/coffee, grupy FB branżowe) | Czas |
| **Targi i eventy** | World of Coffee, SCA Expo, lokalne targi kawy — networking | Budżet |
| **Partnerzy branżowi** | Dystrybutorzy zielonych ziaren, importerzy — jako ambasadorzy platformy | Negocjacje |

### Kanały pozyskiwania ruchu organicznego (kawiarnie + konsumenci)

**SEO — główny kanał długoterminowy:**
- Strony landing dla każdego kraju/miasta: *"Coffee roasters in [City]"*, *"Specialty roasters in [Country]"*
- Strony dla certyfikatów: *"Fair Trade certified coffee roasters"*
- Blog / content: przewodniki po origins, jak wybrać dostawcę kawy, trendy specialty coffee
- Każdy profil palarni to osobna, indeksowalna strona — długi ogon

**Content strategy — wieloźródłowa:**
- **Content od palarni** — palarnie same dodają opisy ziaren, story behind the bean, zdjęcia z wypraw do origin → koszt zero dla platformy, unikalny content
- **User-generated content** — recenzje i zdjęcia od konsumentów → potężne SEO + zaangażowanie + social proof
- **Redakcyjny** — blog: przewodniki po originach, jak wybrać dostawcę kawy, trendy specialty coffee
- **Formaty** — oprócz tekstu: krótkie video (proces palenia, origin stories), infografiki (mapa originów, porównanie procesów)

**Social media:**
- Instagram: showcasing palarni, behind-the-scenes, "roaster of the week"
- LinkedIn: content B2B skierowany do właścicieli kawiarni i F&B buyers
- TikTok/Reels: krótkie filmy o procesie palenia, originach — budowanie świadomości marki
- Reddit r/coffee, grupy FB — angażowanie konsumentów, budowanie community

**Newsletter:**
- "Roasters Hub Weekly" — nowe palarnie w bazie, ciekawostki o kawie, trendy
- Zbieranie maili od odwiedzających (kawiarnie i konsumenci) od pierwszego dnia
- Segmentacja: osobne treści dla kawiarni (B2B) i konsumentów (discovery, edukacja)

### Dystrybucja wirusowa i efekty sieciowe

- Każda palarnia po weryfikacji dostaje **gotowy badge "Listed on Roasters Hub"** do wklejenia na swojej stronie → backlinki + ruch zwrotny
- Palarnie naturalnie promują swój profil wśród klientów → kawiarnie trafiają organicznie
- Opcja: przycisk "Share this roaster" na profilach

### Płatne kanały (po walidacji)

- **Google Ads** — frazy z intencją zakupową: *"buy specialty coffee wholesale"*, *"coffee roaster B2B"*
- **Meta Ads** — retargeting odwiedzających, lookalike z listy palarni
- Nie inwestować w płatne kanały przed osiągnięciem PMF

### KPIs do monitorowania trakcji

| Metryka | Co mierzy | Persona |
|---------|-----------|---------|
| Liczba zweryfikowanych palarni | Wypełnienie bazy (supply) | Palarnie |
| Miesięczni unikalni użytkownicy | Ruch ogólny | Wszystkie |
| Sesje z wyszukiwarek organicznych | Skuteczność SEO | Wszystkie |
| Czas na stronie / profilu palarni | Zaangażowanie | Kawiarnie + Konsumenci |
| Kliknięcia w dane kontaktowe palarni | Połączenia B2B (core value) | Kawiarnie |
| Kliknięcia "Shop online" / "Visit website" | Połączenia DTC | Konsumenci |
| Udostępnienia profili palarni ("Share") | Dystrybucja wirusowa | Konsumenci |
| Powracający użytkownicy (7d / 30d) | Retencja | Wszystkie |
| Newsletter signups | Baza kontaktowa | Kawiarnie + Konsumenci |
| Konwersja Free → Featured | Monetyzacja | Palarnie |

---

## 13. Otwarte pytania

- [ ] Jaka jest docelowa cena planów płatnych (Featured, kampanie)?
- [ ] Czy palarnie mogą same dodać się do bazy, czy tylko przez formularz zgłoszeniowy?
- [ ] Czy mapa ma być widoczna dla niezalogowanych użytkowników?
- [ ] Jaki będzie proces onboardingu pierwszych palarni (ręczne wprowadzanie przez admina vs. self-service)?
- [ ] Nazwa domeny?
- [ ] Czy konsumenci będą mogli tworzyć konta? (ulubione, recenzje, wishlist) — jeśli tak, kiedy?
- [ ] Kiedy wprowadzić affiliate links / "Shop online" na profilach palarni?
- [ ] Czy kawiarnie będą miały własne profile? (z informacją o serwowanych palarniach)
- [ ] Mobile-first vs. responsive — jaka strategia dla konsumenta mobilnego?
- [ ] Jak moderować recenzje konsumentów? (weryfikacja zakupu, flagowanie)
