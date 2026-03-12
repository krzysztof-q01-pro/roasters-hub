# Roasters Hub — Dokument Koncepcji Produktu

**Wersja:** 0.1
**Data:** 2026-03-12
**Status:** Roboczy

---

## 1. Idea

Roasters Hub to platforma B2B łącząca **palarnie kawy** (roasters) z **kawiarniami** (cafés/buyers). Jej głównym celem jest stworzenie centralnego, globalnego katalogu palarni, który pozwoli kawiarniom odkrywać nowych dostawców ziaren — niezależnie od tego, czy szukają lokalnych rzemieślników, czy egzotycznych producentów z drugiego końca świata.

Branża specialty coffee jest rozproszona. Palarnie — szczególnie te mniejsze — mają ograniczone możliwości dotarcia do nowych klientów. Kawiarnie z kolei często kupują od tych samych dostawców, bo po prostu nie wiedzą o alternatywach. Roasters Hub rozwiązuje ten problem, będąc **miejscem spotkania obu stron**.

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

---

## 3. Propozycja wartości

| Dla palarni | Dla kawiarni |
|-------------|--------------|
| Profil w globalnym katalogu | Dostęp do setek palarni w jednym miejscu |
| Dotarcie do nowych klientów B2B | Filtrowanie po kraju, certyfikatach, profilu |
| Narzędzia do promocji (kampanie) | Mapa palarni |
| Wiarygodność (weryfikacja profilu) | Bezpośredni kontakt z palarniami |

---

## 4. Jak to działa

### Dla kawiarni (bez rejestracji)
1. Wchodzi na platformę
2. Przegląda katalog palarni — filtruje po lokalizacji, profilu, certyfikatach
3. Klika w profil palarni — widzi szczegóły, ofertę, dane kontaktowe
4. Kontaktuje się z palarnią bezpośrednio (email, formularz, link zewnętrzny)

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

---

## 6. Kluczowe funkcje — MVP

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

## 7. Poza MVP (backlog)

- Obsługa sampli — flow zamawiania próbek przez platformę
- Konta dla kawiarni — ulubione palarnie, historia, notatki
- Recenzje i oceny palarni (przez zweryfikowane kawiarnie)
- Newsletter / digest dla kawiarni ("Nowe palarnie w Twoim regionie")
- API dla partnerów
- Wielojęzyczność (i18n)
- Aplikacja mobilna

---

## 8. Zakres geograficzny

Platforma działa globalnie od pierwszego dnia, ale baza palarni na start będzie niewielka i będzie stopniowo rozrastać się organicznie. Interfejs w języku angielskim jako język bazowy.

---

## 9. Zasady weryfikacji palarni (MVP)

Weryfikacja jest manualna — admin sprawdza:
- czy palarnia istnieje (strona www, social media, Google Maps)
- czy dane są kompletne i wiarygodne
- opcjonalnie: dokumenty rejestracji firmy

Po weryfikacji profil otrzymuje znaczek **"Verified Roaster"** i jest widoczny publicznie.

---

## 10. Otwarte pytania

- [ ] Jaka jest docelowa cena planów płatnych (Featured, kampanie)?
- [ ] Czy palarnie mogą same dodać się do bazy, czy tylko przez formularz zgłoszeniowy?
- [ ] Czy mapa ma być widoczna dla niezalogowanych użytkowników?
- [ ] Jaki będzie proces onboardingu pierwszych palarni (ręczne wprowadzanie przez admina vs. self-service)?
- [ ] Nazwa domeny?
