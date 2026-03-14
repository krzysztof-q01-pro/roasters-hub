# Workflow: Competitive Analysis — SOP

**Cel:** Przeprowadzenie głębokiej analizy platformy/narzędzia konkurencyjnego w sposób powtarzalny.
**Wersja:** 1.0 | **Data:** 2026-03-14

---

## Inputs

- [ ] Nazwa platformy do analizy (np. "European Coffee Trip")
- [ ] URL strony głównej
- [ ] Typ: directory / SaaS / marketplace / social / other
- [ ] Docelowy plik output: `docs/research/market/competitive-analysis.md`

---

## Outputs

- Uzupełniona sekcja w `docs/research/market/competitive-analysis.md`
- Zaktualizowana "mapa luk" na końcu pliku

---

## Krok 1: Recon — zbierz podstawowe informacje (10 min)

1. Odwiedź stronę główną — co mówi tagline?
2. Sprawdź Crunchbase: rok założenia, kraj, funding, team
3. Sprawdź App Store / Google Play (jeśli jest app): ocena, liczba reviews, ostatnia aktualizacja
4. Web search: `"[nazwa platformy]" review 2024`

**Pytania do odpowiedzi:**
- Kto założył i kiedy?
- Ile mają użytkowników / listings?
- Skąd mają revenue?
- Czy to venture-backed czy bootstrapped?

---

## Krok 2: Product analysis — co robią? (15 min)

1. Stwórz testowe konto (jeśli możliwe)
2. Przejrzyj katalog / marketplace jako użytkownik
3. Sprawdź pricing page
4. Sprawdź FAQ / How it works

**Pytania do odpowiedzi:**
- Jakie filtry oferują?
- Jak wygląda profil?
- Jaki jest onboarding?
- Co jest w free vs. paid tier?
- Jakie są warunki dołączenia?

---

## Krok 3: User reviews — co mówią użytkownicy? (10 min)

1. **App Store / Google Play** — przeczytaj 1-star i 5-star reviews
2. **G2 / Capterra / Trustpilot** (jeśli dotyczy SaaS)
3. **Reddit** — szukaj `site:reddit.com "[nazwa platformy]"`
4. **Twitter/X** — szukaj `"[nazwa platformy]" -filter:retweets`

**Czego szukać:**
- Co chwalą? (to ich mocne strony)
- Co krytykują? (to luki, które RH może wypełnić)
- Jakie features chcą, a nie ma?

---

## Krok 4: SEO / traffic analysis (10 min)

1. Sprawdź **SimilarWeb** (similarweb.com) — monthly visits, traffic sources, bounce rate
2. Sprawdź **Ahrefs Free Tools** lub SEMrush: top organic keywords
3. Sprawdź Google: "coffee roasters in [city]" — czy ta platforma się pojawia?

**Pytania:**
- Jak duży jest ich organic traffic?
- Na jakie słowa kluczowe rankują?
- Czy konkurują z nami o te same keywords?

---

## Krok 5: Biznesowe pytania (10 min)

1. Jaki jest ich model monetyzacji?
2. Czy mają VCs? Jaka jest presja na wzrost?
3. Czy mają content/blog? Jak aktywny?
4. Czy mają newsletter? O czym?
5. Czy mają partnerstwa?

---

## Krok 6: Mapa luk (15 min)

Na podstawie analizy wypełnij/zaktualizuj tabelę luk w `competitive-analysis.md`:

```
| Potrzeba | [Ta platforma] | Roasters Hub |
|----------|----------------|--------------|
| ...      | ✅ / ✗ / Częściowo | ✅ / ✗ |
```

Pytanie kluczowe: **Co RH robi, czego ta platforma nie robi i nigdy nie zrobi?**

---

## Krok 7: Dokumentacja (10 min)

Dodaj sekcję do `docs/research/market/competitive-analysis.md`:

```markdown
## [N]. [Nazwa platformy]

**URL:** ...
**Typ:** ...
**Założony:** ...

### Co robi?
...

### Model biznesowy
| Revenue stream | Opis | Cena |
|...

### Mocne strony
...

### Słabe strony / luki (szansa dla RH)
...

### Relevancja dla RH
...
```

---

## Checklist jakości

- [ ] Znane są: founding year, team size (approx), revenue model
- [ ] Sprawdzono recenzje z min. 2 źródeł
- [ ] Sprawdzono traffic / SEO
- [ ] Mapa luk jest zaktualizowana
- [ ] Sekcja "Relevancja dla RH" jasno opisuje, czy to competitor czy partner

---

## Platformy do priorytetowej analizy

| Platforma | Status | Priorytet |
|-----------|--------|-----------|
| European Coffee Trip | ✅ Completed | P1 |
| Algrano | ✅ Completed | P1 |
| Cropster | ✅ Completed | P1 |
| RoasterTools | ✅ Completed (basic) | P1 |
| Beanconqueror | ✅ Completed (basic) | P2 |
| Trade Coffee | ⏳ Pending | P2 |
| Coffeeness | ⏳ Pending | P3 |
| Mercanta | ⏳ Pending | P3 |
| Bartalks.net | ⏳ Pending | P3 |

---

## Notatki

- Aktualizuj workflow gdy znajdziesz nowe, nieoczekiwane konkurentów
- Dobre źródło nowych kompetytorów: Crunchbase "specialty coffee" category
- Sprawdzaj co 6 miesięcy — rynek się zmienia
