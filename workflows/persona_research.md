# Workflow: Persona Research — SOP

**Cel:** Przeprowadzenie głębokiego researchu jednej persony (roaster / cafe / consumer) w sposób powtarzalny i systematyczny.
**Wersja:** 1.0 | **Data:** 2026-03-14

---

## Inputs (wymagane przed startem)

- [ ] Nazwa persony do zbadania (roaster / cafe / consumer)
- [ ] Docelowy plik output: `docs/research/personas/{persona}.md`
- [ ] Dostęp do internetu (web search)
- [ ] Opcjonalnie: Reddit API credentials w `.env` (dla `tools/research_reddit.py`)

---

## Outputs (co powinno powstać)

- Wypełniony `docs/research/personas/{persona}.md` — wszystkie 10 sekcji
- Opcjonalnie: `/.tmp/reddit_{subreddit}_{query}_{date}.json` — raw data
- Zaktualizowany `docs/research/README.md` — status dokumentów

---

## Krok 1: Przegląd istniejącej wiedzy (5–10 min)

1. Przeczytaj `docs/concept.md` — co już wiemy o tej personie?
2. Przeczytaj istniejący plik persony (jeśli istnieje) — co jest wypełnione?
3. Zidentyfikuj **białe plamy** — które sekcje są puste lub słabe?

---

## Krok 2: Web search (20–30 min)

Uruchom min. 5 web searches per persona. Priorytetowe pytania:

### Dla Roasters
```
"specialty coffee roaster small business challenges 2024 2025"
"how coffee roasters find wholesale customers cafes"
"coffee roaster marketing B2B acquisition"
"specialty roaster pain points scaling"
"coffee roaster SaaS tools pricing review"
```

### Dla Cafés
```
"specialty cafe coffee buyer sourcing process"
"how cafes find new coffee suppliers"
"specialty coffee wholesale buyer pain points"
"coffee buyer job description requirements"
"switching coffee roaster supplier reasons"
```

### Dla Consumers
```
"specialty coffee home brewer behavior 2024"
"how coffee enthusiasts discover new roasters"
"specialty coffee consumer buying habits"
"reddit coffee community behavior survey"
"coffee traveler tourism trend 2024"
```

**Co szukać w wynikach:**
- Cytaty i frazy (głos klienta)
- Liczby i statystyki
- Pain points wyrażone wprost
- Nazwy platform/narzędzi, których używają
- Wzorce zachowań

---

## Krok 3: Reddit research (opcjonalny, 15–20 min)

Jeśli masz Reddit API credentials:

```bash
# Consumer persona — główny subreddit
python tools/research_reddit.py --subreddit Coffee --persona consumer --limit 100

# Roaster persona
python tools/research_reddit.py --subreddit roasting --persona roaster --limit 50

# Café persona
python tools/research_reddit.py --subreddit barista --persona cafe --limit 50
```

Jeśli brak credentials — manualnie przejrzyj:
- `reddit.com/r/Coffee/search?q=find+roaster`
- `reddit.com/r/roasting/search?q=wholesale+customers`
- `reddit.com/r/barista/search?q=sourcing+coffee`

Zbierz min. **10 prawdziwych cytatów** do sekcji 9.

---

## Krok 4: Analiza platform konkurencyjnych (10–15 min)

Odwiedź 2–3 platformy, które ta persona już używa. Dla każdej:
- Co robi dobrze?
- Co robi źle?
- Jakie recenzje mają (App Store, G2, Capterra)?

**Platformy per persona:**
- Roaster: Cropster reviews, RoasterTools reviews, Instagram Business
- Café: Algrano.com, Google Maps, TripAdvisor
- Consumer: Beanconqueror reviews, Trade Coffee reviews, Reddit app reviews

---

## Krok 5: Analiza ofert pracy (10 min)

Wyszukaj na LinkedIn/Indeed: **5–10 ofert pracy** relewantnych dla persony.

- Roaster: "head roaster", "roastery manager", "green coffee buyer"
- Café: "coffee buyer", "F&B procurement", "head barista with sourcing"
- Consumer: (nie dotyczy)

**Co szukać:** jakie umiejętności są wymagane? Jakie narzędzia wymieniane? Jakie cele/KPIs?

---

## Krok 6: Wypełnienie dokumentu (20–30 min)

Wypełnij `docs/research/personas/{persona}.md` korzystając z zebranych danych:

**Sekcja 1 (Profil):** Dodaj konkretne liczby z researchu
**Sekcja 2 (Workflow):** Opisz konkretne kroki, nie ogólniki
**Sekcja 3 (JTBD):** Używaj formy "Chcę [osiągnąć], żeby [motywacja]"
**Sekcja 4 (Pain Points):** Rankinguj wg. bólu, podawaj konkretne przykłady
**Sekcja 5 (Gains):** Powiąż gains z konkretnymi features platformy
**Sekcja 6 (Alternatywy):** Wymieniaj tylko realne alternatywy, nie hipotetyczne
**Sekcja 7 (WTP):** Podawaj konkretne liczby, nie przedziały
**Sekcja 8 (Kanały):** Rankinguj wg. efektywności
**Sekcja 9 (Cytaty):** Min. 5 prawdziwych cytatów z podaniem źródła
**Sekcja 10 (Red flags):** Powiąż każdy red flag z mitygacją

---

## Krok 7: Review i cross-reference (10 min)

1. Porównaj wypełniony dokument z `docs/research/platform/jtbd-mapping.md`
2. Sprawdź: czy jobs tej persony są uwzględnione w mapie?
3. Zaktualizuj jtbd-mapping.md jeśli znalazłeś nowe przecięcia
4. Zaktualizuj `docs/research/README.md` — status dokumentów

---

## Krok 8: Walidacja jakości

Przed oznaczeniem jako "done", sprawdź checklist:

- [ ] Każda z 10 sekcji jest wypełniona (nie placeholder)
- [ ] Sekcja 9 zawiera min. 5 prawdziwych cytatów (nie wymyślonych)
- [ ] Sekcja 4 ma min. 3 pain points per poziom (P1, P2, P3)
- [ ] Sekcja 7 zawiera konkretne liczby (nie "varies")
- [ ] Sekcja 1 zawiera szacunek liczebności segmentu (ile ich jest?)
- [ ] Dokument jest napisany w języku persony, nie języku produktu

---

## Edge cases i błędy

**Problem:** Nie możesz znaleźć danych o WTP
→ Szukaj pośrednio: ile ta persona płaci za PODOBNE usługi?

**Problem:** Reddit search nie zwraca wyników
→ Spróbuj innych subredditów: r/coffee, r/espresso, r/hotbeverages, r/tea (dla comparison)

**Problem:** Wyniki web search są ogólne, nie specialty coffee
→ Dodaj "specialty coffee" lub "third wave coffee" do zapytania

**Problem:** Cytaty są w języku angielskim, dokument po polsku
→ Cytuj oryginalnie (po angielsku), tłumaczenie opcjonalne w nawiasie

---

## Notatki

- Aktualizuj ten workflow gdy znajdziesz lepsze źródła lub metody
- Dodaj nowe "edge cases" gdy napotkasz nowe problemy
- Czas researchu per persona: 60–90 minut przy pierwszym razem, 30–45 min przy aktualizacji
