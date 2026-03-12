# Roasters Hub — Zarys bazy palarni (seed data)

> Dokument roboczy. Dane zebrane z: Global Coffee Awards 2025, Perfect Daily Grind, beeancoffee.com, SCA.
> Służy jako podstawa do ręcznego onboardingu pierwszych palarni (Faza 0).

---

## Struktura rekordu

Każda palarnia w bazie docelowo zawiera:

| Pole | Typ | Opis |
|------|-----|------|
| `name` | string | Pełna nazwa palarni |
| `city` | string | Miasto |
| `country` | string | Kraj (ISO 3166) |
| `region` | string | Europa / Ameryka Północna / Azja-Pacyfik / etc. |
| `founded` | year | Rok założenia |
| `website` | url | Strona www |
| `instagram` | handle | Konto Instagram |
| `certifications` | array | Fair Trade, Organic, Rainforest Alliance, SCA itp. |
| `direct_trade` | boolean | Czy prowadzi direct trade z farmami |
| `specialties` | array | single-origin, micro-lot, blends, espresso, filter, natural, washed itp. |
| `origins` | array | Skąd pochodzi kawa (Etiopia, Kolumbia, Kenia itp.) |
| `description` | text | Krótki opis (1–3 zdania) |
| `verified` | boolean | Status weryfikacji przez admina |
| `tier` | enum | free / featured |
| `awards` | array | Nagrody branżowe |

---

## Europa

### Norwegia
| Nazwa | Miasto | Direct trade | Specialties | Notatki |
|-------|--------|-------------|-------------|---------|
| **Tim Wendelboe** | Oslo | ✅ | single-origin, filter, espresso | Ikona third wave; właściciel osobiście odwiedza farmy kilka razy w roku; własne badania agronomiczne |

### Dania
| Nazwa | Miasto | Direct trade | Specialties | Notatki |
|-------|--------|-------------|-------------|---------|
| **La Cabra Coffee Roasters** | Aarhus | ✅ | single-origin, filter, light roast | Częste wizyty u producentów; mocny branding i design |
| **Coffee Collective** | Kopenhaga | ✅ | single-origin, transparency pricing | Pionierzy transparentnych cen skupu — publikują ile płacą farmerom (2–3× ceny rynkowe) |
| **April Coffee Roasters** | Kopenhaga | ✅ | filter, light roast, Nordic style | Mocna pozycja w konkursach SCA; uznani w Europie i Japonii |

### Niemcy
| Nazwa | Miasto | Direct trade | Specialties | Notatki |
|-------|--------|-------------|-------------|---------|
| **The Barn** | Berlin | ✅ | single-origin, light roast | Jeden z pierwszych pionierów specialty w Niemczech; ultra-jasne palenia |
| **Five Elephant** | Berlin | ✅ | single-origin, filter, sustainability | Silny nacisk na sustainability i direct trade |
| **Bonanza Coffee Roasters** | Berlin | ✅ | espresso, filter, single-origin | Kawiarnia + roastery; mocna obecność w Berlinie i online |
| **19grams Coffee Roasters** | Berlin | ✅ | transparency, single-origin | Silny content marketing; aktywni na SCA |
| **Friedhats Coffee Roasters** | Hamburg | ✅ | filter, competition-grade | Liczne medale w konkursach Cup of Excellence |

### Wielka Brytania
| Nazwa | Miasto | Direct trade | Specialties | Notatki |
|-------|--------|-------------|-------------|---------|
| **Origin Coffee** | Truro / Londyn | ✅ | single-origin, sustainability | **Zdobywca: Best Roaster in Europe 2025** (Global Coffee Awards) + Most Sustainable Brand |
| **Square Mile Coffee Roasters** | Londyn | ✅ | filter, espresso, competition | Założony przez byłych World Barista Champions; referencja jakości w UK |
| **Workshop Coffee** | Londyn | ✅ | single-origin, espresso | Własna sieć kawiarni w Londynie + hurtownia B2B |
| **Hasbean** | Stafford | ✅ | single-origin, subscription | Jeden z najdłużej działających specialty roasters w UK; silna community online |

### Francja
| Nazwa | Miasto | Direct trade | Specialties | Notatki |
|-------|--------|-------------|-------------|---------|
| **L'Arbre à Café** | Paryż | ✅ | direct trade, organic, single-origin | Właściciel Hippolyte Courty znany z wypraw do origin; lider French specialty scene |
| **Café Lomi** | Paryż | ✅ | espresso, filter, Nordic influence | Szkolenia baristów; współpraca z restauracjami Michelin |

### Szwecja
| Nazwa | Miasto | Direct trade | Specialties | Notatki |
|-------|--------|-------------|-------------|---------|
| **Drop Coffee Roasters** | Sztokholm | ✅ | single-origin, filter, competition | Przychody ~€3M; aktywni w konkursach Cup of Excellence |
| **Koppi** | Helsingborg | ✅ | single-origin, light roast, Nordic | Wielokrotni laureaci Swedish Barista Championships |

### Czechy
| Nazwa | Miasto | Direct trade | Specialties | Notatki |
|-------|--------|-------------|-------------|---------|
| **Mazelab Coffee Roasters** | Praga | — | aromatic, sensory-focused | Założony przez Jackie i Thu; połączenie palarni z galerią fotograficzną |

### Holandia
| Nazwa | Miasto | Direct trade | Specialties | Notatki |
|-------|--------|-------------|-------------|---------|
| **DAK Coffee Roasters** | Amsterdam | ✅ | single-origin, competition | Nagradzani w europejskich konkursach |

---

## Ameryka Północna

### USA
| Nazwa | Miasto / Stan | Direct trade | Specialties | Nagrody / Notatki |
|-------|--------------|-------------|-------------|-------------------|
| **Onyx Coffee Lab** | Rogers, Arkansas | ✅ | single-origin, transparency reports, 90+ scores | #1 Coffee Shop in North America 2025; każda kawa z pełnym raportem transparentności |
| **Utopian Coffee** | Fort Wayne, Indiana | ✅ | espresso, flat white, single-origin | **Overall Winner — Global Coffee Awards US&Canada 2025** |
| **Stamp Act Coffee** | Seattle, Washington | ✅ | filter, Geisha, SL28 | Gold — Filter Category (Global Coffee Awards 2025) |
| **Sweet Bloom** | Denver, Colorado | ✅ | Ethiopian single-origin, light roast | Gold — Flat White Dairy (Global Coffee Awards 2025) |
| **Ritual Coffee Roasters** | San Francisco, California | ✅ | small-batch, woman-owned, third wave pioneer | Założona 2005; direct trade z Ameryki Środkowej, Pd. i Afryki |
| **Stumptown Coffee Roasters** | Portland, Oregon | ✅ | direct trade, single-origin, blends | Jeden z pionierów direct trade w USA; sieć ogólnokrajowa |
| **Intelligentsia Coffee** | Chicago, Illinois | ✅ | direct trade, espresso, filter | Jeden z założycieli ruchu third wave |
| **Counter Culture Coffee** | Durham, North Carolina | ✅ | sustainability, transparency, direct trade | B Corp certified; lider w edukacji baristów |
| **Black Oak Coffee Roasters** | Napa, California | — | blends, espresso, filter | Multi-category Gold — Global Coffee Awards 2025 |
| **Moxie Coffee Co.** | Phoenix, Arizona | — | single-origin, experimental processing | Gold — single origin (Global Coffee Awards 2025) |
| **Airship Coffee** | Bentonville, Arkansas | — | single-origin, packaging | MTPak Packaging Award — Global Coffee Awards 2025 |
| **Reprise Coffee** | Illinois | — | SL28, Orange Bourbon | Gold — alternative espresso (Global Coffee Awards 2025) |
| **Tipico Coffee Roasters** | New York | — | natural process | Gold — natural espresso (Global Coffee Awards 2025) |

### Kanada
| Nazwa | Miasto | Direct trade | Specialties | Notatki |
|-------|--------|-------------|-------------|---------|
| **Phil & Sebastian** | Calgary, Alberta | ✅ | washed process, espresso, filter | Gold — washed espresso (Global Coffee Awards 2025); sieć kawiarni w Albercie |

---

## Azja–Pacyfik

### Australia
| Nazwa | Miasto | Direct trade | Specialties | Notatki |
|-------|--------|-------------|-------------|---------|
| **Toby's Estate** | Sydney | ✅ | single-origin, espresso, direct trade | **#1 na świecie — World's 100 Best Coffee Shops 2025**; założona 2001; eksportuje do Japonii i Azji |
| **Single O** | Sydney | ✅ | single-origin, sustainability, B2B | Otworzył kawiarnię w Tokio; silna ekspansja azjatycka |
| **Market Lane Coffee** | Melbourne | ✅ | single-origin, filter, transparency | Jeden z liderów Melbourne specialty scene; szczegółowe opisy origin |
| **Proud Mary Coffee** | Melbourne / Portland (US) | ✅ | experimental, natural, micro-lot | Obecność w Australii i USA; znani z innowacyjnych przetworzeń |

### Japonia
| Nazwa | Miasto | Direct trade | Specialties | Notatki |
|-------|--------|-------------|-------------|---------|
| **Takamura Coffee Roasters** | Osaka | ✅ | single-origin, precision roasting | Ikoniczna palarnia w Osace; własny sklep z narzędziami kawowymi |
| **Kurasu** | Kioto | ✅ | single-origin, Nordic-influenced, subscription | Sklep online i fizyczny; silna sprzedaż zagraniczna |
| **Bear Pond Espresso** | Tokio | — | espresso, Italian influence | Kultowe miejsce w Shimo-Kitazawa |
| **Fuglen Coffee** | Tokio / Oslo | ✅ | Nordic roasting, single-origin | Norweski koncept przeniesiony do Japonii; dwukulturowy branding |

---

## Podsumowanie zbioru (seed data)

| Region | Liczba palarni | Uwagi |
|--------|----------------|-------|
| Europa | 17 | Priorytet: Niemcy, UK, Skandynawia |
| Ameryka Północna | 14 | USA zdominowane przez nagrody GCA 2025 |
| Azja–Pacyfik | 8 | Australia + Japonia jako liderzy regionu |
| **Łącznie** | **39** | Baza robocza; do uzupełnienia przed launchem |

**Brakujące regiony do uzupełnienia:**
- Ameryka Łacińska (szczególnie Brazylia, Kolumbia — duże rynki lokalne)
- Afryka (Etiopia, Kenia — rynki wschodzące z rosnącą sceną specialty)
- Bliski Wschód (Dubai, Istanbul — dynamicznie rosnące rynki)
- Europa Środkowa / Wschodnia (Polska, Czechy, Węgry)

---

*Źródła: Global Coffee Awards 2025 (US&Canada, Europe), Perfect Daily Grind, beeancoffee.com, coffeebros.com, Asia Food Journal*
