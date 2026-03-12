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
| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **Tim Wendelboe** | Oslo | [timwendelboe.no](https://timwendelboe.no) | ✅ | single-origin, filter, espresso | Ikona third wave; właściciel osobiście odwiedza farmy kilka razy w roku; własne badania agronomiczne |

### Dania
| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **La Cabra Coffee Roasters** | Aarhus | [lacabra.dk](https://lacabra.dk) | ✅ | single-origin, filter, light roast | Częste wizyty u producentów; mocny branding i design |
| **Coffee Collective** | Kopenhaga | [coffeecollective.dk](https://coffeecollective.dk) | ✅ | single-origin, transparency pricing | Pionierzy transparentnych cen skupu — publikują ile płacą farmerom (2–3× ceny rynkowe) |
| **April Coffee Roasters** | Kopenhaga | [april.coffee](https://april.coffee) | ✅ | filter, light roast, Nordic style | Mocna pozycja w konkursach SCA; uznani w Europie i Japonii |

### Niemcy
| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **The Barn** | Berlin | [thebarn.de](https://thebarn.de) | ✅ | single-origin, light roast | Jeden z pierwszych pionierów specialty w Niemczech; ultra-jasne palenia |
| **Five Elephant** | Berlin | [fiveelephant.com](https://fiveelephant.com) | ✅ | single-origin, filter, sustainability | Silny nacisk na sustainability i direct trade |
| **Bonanza Coffee Roasters** | Berlin | [bonanzacoffee.de](https://bonanzacoffee.de) | ✅ | espresso, filter, single-origin | Kawiarnia + roastery; mocna obecność w Berlinie i online |
| **19grams Coffee Roasters** | Berlin | [19grams.de](https://19grams.de) | ✅ | transparency, single-origin | Silny content marketing; aktywni na SCA |

### Wielka Brytania
| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **Origin Coffee** | Truro / Londyn | [origincoffee.co.uk](https://origincoffee.co.uk) | ✅ | single-origin, sustainability | **Best Roaster in Europe 2025** (Global Coffee Awards) + Most Sustainable Brand |
| **Square Mile Coffee Roasters** | Londyn | [squaremilecoffee.com](https://squaremilecoffee.com) | ✅ | filter, espresso, competition | Założony przez byłych World Barista Champions |
| **Workshop Coffee** | Londyn | [workshopcoffee.com](https://workshopcoffee.com) | ✅ | single-origin, espresso | Własna sieć kawiarni w Londynie + hurtownia B2B |
| **Hasbean** | Stafford | [hasbean.co.uk](https://hasbean.co.uk) | ✅ | single-origin, subscription | Jeden z najdłużej działających specialty roasters w UK; silna community online |

### Francja
| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **L'Arbre à Café** | Paryż | [larbreacafe.com](https://larbreacafe.com) | ✅ | direct trade, organic, single-origin | Właściciel Hippolyte Courty znany z wypraw do origin; lider French specialty scene |
| **Café Lomi** | Paryż | [cafelomi.com](https://cafelomi.com) | ✅ | espresso, filter, Nordic influence | Szkolenia baristów; współpraca z restauracjami Michelin |

### Szwecja
| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **Drop Coffee Roasters** | Sztokholm | [dropcoffee.se](https://dropcoffee.se) | ✅ | single-origin, filter, competition | Przychody ~€3M; aktywni w konkursach Cup of Excellence |
| **Koppi** | Helsingborg | [koppi.se](https://koppi.se) | ✅ | single-origin, light roast, Nordic | Wielokrotni laureaci Swedish Barista Championships |

### Holandia
| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **DAK Coffee Roasters** | Amsterdam | [dakcoffeeroasters.com](https://www.dakcoffeeroasters.com) | ✅ | single-origin, competition | Nazwa od holenderskiego "dak" (dach); założona 2019 |
| **Friedhats Coffee Roasters** | Amsterdam | [friedhats.com](https://friedhats.com) | ✅ | filter, competition-grade | Liczne medale w konkursach Cup of Excellence |

### Czechy
| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **Mazelab Coffee Roasters** | Praga | [mazelabcoffee.com](https://mazelabcoffee.com) | — | aromatic, sensory-focused | Założony przez Jackie i Thu; połączenie palarni z galerią fotograficzną |

---

## Ameryka Północna

### USA
| Nazwa | Miasto / Stan | Website | Direct trade | Specialties | Nagrody / Notatki |
|-------|--------------|---------|-------------|-------------|-------------------|
| **Onyx Coffee Lab** | Rogers, Arkansas | [onyxcoffeelab.com](https://onyxcoffeelab.com) | ✅ | single-origin, transparency, 90+ scores | #1 Coffee Shop in North America 2025; pełne raporty transparentności przy każdej kawie |
| **Utopian Coffee** | Fort Wayne, Indiana | [utopiancoffee.com](https://utopiancoffee.com) | ✅ | espresso, flat white, regenerative ag. | **Overall Winner — Global Coffee Awards US&Canada 2025**; wyłącznie z farm regeneratywnych |
| **Stamp Act Coffee** | Seattle, Washington | [stampactcoffee.com](https://stampactcoffee.com) | ✅ | filter, Geisha, SL28 | Gold — Filter (Global Coffee Awards 2025); założona 2018 |
| **Sweet Bloom** | Denver, Colorado | [sweetbloomcoffee.com](https://sweetbloomcoffee.com) | ✅ | Ethiopian single-origin, light roast | Gold — Flat White Dairy (Global Coffee Awards 2025) |
| **Ritual Coffee Roasters** | San Francisco, California | [ritualroasters.com](https://ritualroasters.com) | ✅ | small-batch, woman-owned, third wave | Założona 2005; direct trade z Ameryki Środkowej, Pd. i Afryki |
| **Stumptown Coffee Roasters** | Portland, Oregon | [stumptowncoffee.com](https://stumptowncoffee.com) | ✅ | direct trade, single-origin, blends | Jeden z pionierów direct trade w USA |
| **Intelligentsia Coffee** | Chicago, Illinois | [intelligentsiacoffee.com](https://intelligentsiacoffee.com) | ✅ | direct trade, espresso, filter | Współzałożyciel ruchu third wave |
| **Counter Culture Coffee** | Durham, North Carolina | [counterculturecoffee.com](https://counterculturecoffee.com) | ✅ | sustainability, transparency, direct trade | B Corp certified; lider w edukacji baristów |
| **Black Oak Coffee Roasters** | Napa, California | [blackoakcoffee.com](https://blackoakcoffee.com) | — | blends, espresso, filter | Multi-category Gold — Global Coffee Awards 2025 |
| **Moxie Coffee Co.** | Phoenix, Arizona | [moxiecoffeeco.com](https://moxiecoffeeco.com) | — | single-origin, experimental processing | Gold — single origin (Global Coffee Awards 2025) |
| **Airship Coffee** | Bentonville, Arkansas | [airshipcoffee.com](https://airshipcoffee.com) | — | single-origin, packaging | MTPak Packaging Award — Global Coffee Awards 2025 |
| **Reprise Coffee** | Illinois | [reprisecoffee.com](https://reprisecoffee.com) | — | SL28, Orange Bourbon | Gold — alternative espresso (Global Coffee Awards 2025) |
| **Tipico Coffee Roasters** | New York | [tipicocoffee.com](https://tipicocoffee.com) | — | natural process | Gold — natural espresso (Global Coffee Awards 2025) |

### Kanada
| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **Phil & Sebastian** | Calgary, Alberta | [philsebastian.com](https://philsebastian.com) | ✅ | washed process, espresso, filter | Gold — washed espresso (Global Coffee Awards 2025); sieć kawiarni w Albercie |

---

## Azja–Pacyfik

### Australia
| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **Toby's Estate** | Sydney | [tobysestate.com.au](https://tobysestate.com.au) | ✅ | single-origin, espresso, direct trade | **#1 na świecie — World's 100 Best Coffee Shops 2025**; założona 2001; eksportuje do Japonii i Azji |
| **Single O** | Sydney | [singleo.com.au](https://singleo.com.au) | ✅ | single-origin, sustainability, B2B | Otworzył kawiarnię w Tokio; silna ekspansja azjatycka |
| **Market Lane Coffee** | Melbourne | [marketlane.com.au](https://marketlane.com.au) | ✅ | single-origin, filter, transparency | Lider Melbourne specialty scene; szczegółowe opisy origin |
| **Proud Mary Coffee** | Melbourne / Portland (US) | [proudmarycoffee.com](https://proudmarycoffee.com) | ✅ | experimental, natural, micro-lot | Obecność w Australii i USA; znani z innowacyjnych przetworzeń |

### Japonia
| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **Takamura Coffee Roasters** | Osaka | [en.takamura-coffee.com](https://en.takamura-coffee.com) | ✅ | single-origin, precision roasting | Ikoniczna palarnia w Osace; własny sklep z narzędziami kawowymi |
| **Kurasu** | Kioto | [kurasu.kyoto](https://kurasu.kyoto) | ✅ | single-origin, Nordic-influenced, subscription | Sklep online i fizyczny; silna sprzedaż zagraniczna |
| **Bear Pond Espresso** | Tokio | [bearpond.jp](https://bearpond.jp) | — | espresso, Italian influence | Kultowe miejsce w Shimo-Kitazawa |
| **Fuglen Coffee** | Tokio / Oslo | [fuglen.com](https://fuglen.com) | ✅ | Nordic roasting, single-origin | Norweski koncept przeniesiony do Japonii; dwukulturowy branding |

---

## Europa Środkowa — Polska

| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **HAYB** | Warszawa | [haybcoffee.eu](https://haybcoffee.eu) | ✅ | single-origin, filter, espresso | Założona 2016 przez Roberta i Wiktora Borowskich; Wiktor certyfikowany Q-Grader |
| **JAVA Coffee Roasters** | Warszawa | [javacoffee.pl](https://javacoffee.pl/en) | ✅ | single-origin, multi-origin, B2B | Założona 2001; jedna z najstarszych specialty w Polsce; nagrody w konkursach międzynarodowych |
| **Hard Beans** | Opole | [hardbeans.pl](https://hardbeans.pl) | ✅ | competition-grade, filter, espresso | Liderzy polskiej sceny konkursowej; silna obecność na SCA i WBC |
| **Etno Cafe** | Wrocław | [etnocafe.pl](https://etnocafe.pl) | ✅ | single-origin, direct trade, subscription | Jeden z pionierów specialty coffee w Polsce; silna community i sklep online |
| **Story Coffee Roasters** | Warszawa | [storycoffee.pl](https://storycoffee.pl/en) | ✅ | single-origin, filter, craft roasting | Palarnia rzemieślnicza z naciskiem na selekcję ziarna i świeżość |
| **CoffeeLab** | Warszawa | [coffeelab.pl](https://coffeelab.pl) | ✅ | single-origin, barista education | Palarnia + szkoła kawowa; kształcenie baristów i Q-Graderów |
| **Milo Coffee Roasters** | — | [miloroast.com](https://miloroast.com) | ✅ | filter, light roast, Scandinavian influence | Nordycki styl palenia; mocny online |
| **Sheep and Raven** | Warszawa | — | ✅ | micro-batch, filter, experimental | Ocena 4.5/5 na coffeeroast.com; wyjątkowo wysoka jakość micro-partii |

---

## Afryka

### Etiopia
| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **Garden of Coffee** | Addis Abeba | [gardenofcoffee.com](https://gardenofcoffee.com) | ✅ | hand-roasted, traditional, single-origin | Tradycyjne ręczne palenie metodą etiopską; eksport + lokalne kawiarnie |
| **Tomoca Coffee** | Addis Abeba | [tomocacoffee.com](https://tomocacoffee.com) | — | espresso, traditional blend, dark roast | Ikoniczna palarnia założona 1953; najstarsza i najbardziej znana w Etiopii |
| **YA Coffee** | Addis Abeba | [ya.coffee](https://ya.coffee) | ✅ | single-origin, smallholder, fair trade | Bezpośredni skup od drobnych farmerów; export specialty do Europy i USA |
| **Tarara Coffee** | Addis Abeba | [tararacoffee.com](https://www.tararacoffee.com) | ✅ | specialty-grade, Ethiopian terroir | Najwyższe gatunki etiopskiego ziarna; własna palnia specialty w Addis |

### Kenia
| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **Barista & Co.** | Nairobi | [baristaco.co.ke](https://www.baristaco.co.ke) | ✅ | single-origin Kenyan, farm-to-cup | Kenyjski family business; bezpośrednie relacje z farmami w całej Kenii; roasting on-site |
| **Vava Coffee** | Nairobi | [vavacoffeeinc.com](https://www.vavacoffeeinc.com) | ✅ | direct trade, smallholder, East Africa | Od 2009; misja dekolonizacji handlu kawą; bezpośredni dostęp dla roasters i konsumentów |
| **Connect Coffee Roasters** | Nairobi | [connectcoffeeroasters.net](https://connectcoffeeroasters.net) | ✅ | specialty Kenyan, single-origin, daily roasting | Roasting on-site codziennie; silna więź z lokalnymi farmerami |
| **Kesh Kesh Coffee Roastery** | Nairobi | [keshkeshroastery.com](https://keshkeshroastery.com) | ✅ | East Africa, arabica, specialty-grade | Profesjonalna palarnia specialty z regionu Afryki Wschodniej |
| **Spring Valley Coffee** | Nairobi | [springvalleycoffee.com](https://www.springvalleycoffee.com) | ✅ | Kenyan single-origin, estate coffee | Klasyczna kenyjska palarnia z długą tradycją; eksport ziarna |

---

## Ameryka Łacińska

### Brazylia
| Nazwa | Miasto | Website | Direct trade | Specialties | Notatki |
|-------|--------|---------|-------------|-------------|---------|
| **O'Coffee Brazilian Estates** | São Paulo | [ocoffee.com.br](https://ocoffee.com.br) | ✅ | estate coffee, direct trade, multi-origin | 7 mln drzewek kawowych; direct trade do 15+ krajów; szeroka paleta profili specialty |
| **Academia do Café** | Belo Horizonte | [academiadocafe.com.br](https://academiadocafe.com.br) | ✅ | specialty-grade, SCA-licensed, education | Palarnia + licencjonowana szkoła SCA; centrum edukacji kawowej w Brazylii |
| **Ovelha Negra** | São Paulo | — | ✅ | small-batch, collaborative roasting, female farmers | Palarnia w Vila Clementino; model współpracy z małymi roasterami; preferencja dla kobiet-farmerów |

---

## Podsumowanie zbioru (seed data)

| Region | Liczba palarni | Uwagi |
|--------|----------------|-------|
| Europa Zachodnia / Skandynawia | 18 | UK, Niemcy, Dania, Norwegia, Francja, Szwecja, Holandia, Czechy |
| Europa Środkowa (Polska) | 8 | Silna i rosnąca scena specialty |
| Ameryka Północna | 14 | USA + Kanada, zdominowane przez GCA 2025 |
| Azja–Pacyfik | 8 | Australia + Japonia |
| Afryka (Etiopia + Kenia) | 9 | Kluczowe rynki origin z rosnącą sceną lokalną |
| Ameryka Łacińska (Brazylia) | 3 | Największy producent kawy na świecie |
| **Łącznie** | **60** | Baza robocza; do uzupełnienia przed launchem |

**Brakujące regiony do kolejnej iteracji:**
- Kolumbia (ogromna scena specialty, np. Pergamino, Amor Perfecto)
- Bliski Wschód (Dubai, Istanbul — dynamicznie rosnące rynki)
- Europa Wschodnia (Czechy, Węgry, Rumunia)
- Ameryka Łacińska — pozostałe kraje (Gwatemala, Kostaryka, Panama)

---

*Źródła: Global Coffee Awards 2025 (US&Canada, Europe), Perfect Daily Grind, beeancoffee.com, coffeebros.com, Asia Food Journal*
