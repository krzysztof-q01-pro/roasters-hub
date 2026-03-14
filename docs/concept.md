# Roasters Hub — Dokument Koncepcji Produktu

**Wersja:** 1.0
**Data:** 2026-03-14
**Status:** Zatwierdzony — źródło prawdy dla implementacji

---

## 1. Problem

Rynek specialty coffee ma trzy strony, które szukają się nawzajem — ale nie istnieje żadna infrastruktura, która je łączy.

### Problem #1: Brak centralnego kanału discovery (krytyczny)

- **Palarnie** polegają na cold outreach (4% response rate), algorytmach Instagrama i targach ($2–10K za event, 2× rok). Nie istnieje jedno miejsce, gdzie kawiarnia może aktywnie szukać dostawcy kawy.
- **Kawiarnie** nie mają żadnego strukturalnego źródła: *"There really are no resources to guide specialty sourcing decisions"* (SCA Transaction Guide 2024). Dostają dziesiątki cold maili od palarni tygodniowo — większość ignorują.
- **Konsumenci** rozkładają research na YouTube + Reddit + Instagram + Google Maps — cztery niespójne kanały, żaden bez filtrów specialty.

### Problem #2: Bariera zaufania i weryfikacji (krytyczny)

- Palarnie nie mogą udowodnić wiarygodności online. *"Wszyscy mamy direct trade, wszyscy single origin — jak się wyróżnić?"*
- Kawiarnie boją się ryzyka zmiany dostawcy (2–8 tygodni inwestycji). *"You never really know if the new one is reliable until you've ordered a few times."* (r/cafe)
- Konsumenci nie mogą weryfikować claims direct trade (greenwashing). *"Bought from a 'direct trade' roaster but there's zero info on the farm."* (r/Coffee)

### Problem #3: Ograniczona widoczność geograficzna (istotny)

- 68% rynku to micro-roasters — niewidoczni poza lokalnym rynkiem. Palarnie z origin countries (Etiopia, Kenia, Brazylia) mają zerową widoczność globalną.
- Konsumenci-podróżnicy nie mogą znaleźć palarni specialty w nowym mieście.
- Kawiarnie w emerging markets (PL, CZ, HU) nie mają dostępu do globalnej oferty.

### Walidacja

Żaden z 7 analizowanych konkurentów nie obsługuje trójkąta palarnia–kawiarnia–konsument:
- **European Coffee Trip**: 6K kawiarni, zero palarni, brak B2B, tylko Europa
- **Algrano**: upstream (producent zielonej kawy → palarnia) — inny layer supply chain
- **Cropster / RoasterTools**: narzędzia operacyjne, nie discovery
- **Google / Instagram**: generyczne, brak filtrów specialty, brak weryfikacji

Rynek: $24.8B globalnie (2024), CAGR 10.5% do 2033. ~90,000 small-batch roasterów globalnie. 45,000+ indie kawiarni w Europie.

---

## 2. Rozwiązanie

**Roasters Hub** to trójstronna platforma discovery łącząca palarnie, kawiarnie i konsumentów specialty coffee.

### Dlaczego platforma (nie osobne narzędzia)

1. **Jeden profil, trzy wartości** — palarnia tworzy profil raz; ten sam rekord generuje wartość dla kawiarni (discovery dostawcy), konsumenta (discovery ziaren) i siebie (pasywny lead gen).

2. **Cross-side network effects** — więcej palarni = więcej wartości dla kawiarni i konsumentów. Więcej konsumentów = więcej traffic = więcej palarni chce być widoczna. Niemożliwe do odtworzenia oddzielnymi narzędziami.

3. **SEO moat** — tysiące landing pages per miasto/kraj/origin: *"coffee roasters in Berlin"*, *"Ethiopian single origin roasters Poland"*. Każdy profil palarni = osobna indeksowalna strona.

4. **Flywheel:**
```
Palarnie dołączają (supply)
    ↓
Katalog rośnie → rośnie wartość
    ↓
Kawiarnie i konsumenci odkrywają (SEO, share button, palarnia promuje profil)
    ↓
Traffic rośnie → palarnia widzi w statystykach
    ↓
Palarnia upgradeuje do Featured → revenue
    ↓
Lepszy produkt → więcej palarni [LOOP]
```

### Strategia geograficzna

- **Katalog: globalny od dnia 1** — core value proposition to global discovery. Seed database zawiera 60 palarni z 6 regionów.
- **Marketing: Polska + Niemcy** przez pierwsze 6 miesięcy — silna scena specialty, dostępne eventy (Warsaw Coffee Festival, Berlin Coffee Festival), znajomość lokalnego rynku.
- **Język: angielski** jako base — lingua franca rynku specialty coffee (Hard Beans, Friedhats, Tim Wendelboe — wszyscy operują po angielsku). i18n PL + DE w P2.

---

## 3. Persony

### Palarnia (supply side — płaci)

**Archetyp:** Mała/micro palarnia specialty (68% rynku to micro-roasters), 1–10 FTE, pasja do rzemiosła.

**Top Jobs to Be Done:**
- "Pomóż mi być widocznym dla kawiarni szukających dostawcy"
- "Pomóż mi wyglądać wiarygodnie i profesjonalnie"
- "Pomóż mi dotrzeć do kawiarni poza lokalnym rynkiem"

**Jak pozyskujemy:** Cold outreach email, Instagram DM, Reddit r/roasting, targi branżowe, "Listed on RH" badge.

**WTP:** Aktualnie wydają $99–2,300/mies. na Cropster, $200–1,000/mies. na Instagram Ads, $2–10K na targi. Featured za $49/mies. = najtańszy i najbardziej mierzalny kanał.

**Red flags do mitygacji:** "Kolejna pusta platforma bez kawiarni" → seed 100 palarni pre-launch. "Onboarding zbyt skomplikowany" → profil gotowy w <30 minut.

### Kawiarnia (demand side — nie płaci)

**Archetyp:** Indie café owner lub head barista z uprawnieniami do zakupów. 45K+ indie kawiarni w Europie.

**Top Jobs to Be Done:**
- "Pomóż mi znaleźć palarnię pasującą do mojego profilu (origin, certyfikaty, dostawa)"
- "Pomóż mi zweryfikować, że palarnia jest wiarygodna"
- "Daj mi punkt startowy gdy muszę szybko zmienić dostawcę"

**Kluczowe:** Kawiarnie NIE płacą — free discovery to standard branżowy. Nie wymagamy rejestracji do przeglądania.

### Konsument (growth engine — nie płaci na start)

**Archetyp:** Home brewer, podróżnik kawowy, świadomy konsument. Gen Z + Millennials. 83% pije kawę warzoną w domu.

**Top Jobs to Be Done:**
- "Pomóż mi znaleźć palarnię z Etiopii z certyfikatem direct trade"
- "Pomóż mi znaleźć palarnię specialty gdy podróżuję do nowego miasta"
- "Pomóż mi kupić ziarna bezpośrednio od palarni, którą właśnie odkryłem"

**Rola w modelu:** Konsumenci generują ruch → palarnia widzi w statystykach → trigger upgradu do Featured. Rozwiązują część problemu chicken-and-egg (wartość z samej widoczności DTC, niezależnie od kawiarni).

---

## 4. Scope MVP

### P0 — Launch (tydzień 1–7)

| Feature | Opis | Dla kogo |
|---------|------|---------|
| Katalog palarni z filtrami | Filtrowanie po kraju, regionie, certyfikatach, origin, direct trade | Kawiarnie + Konsumenci |
| Profil palarni | Nazwa, opis, lokalizacja, zdjęcia, certyfikaty, dane kontaktowe, link "Shop online" | Wszystkie |
| **Verified Roaster badge** | Manualna weryfikacja admina (www, social, Google Maps) → badge "Verified" | Kawiarnie + Konsumenci |
| Mapa interaktywna | Leaflet + OpenStreetMap, piny per palarnia, popup z podstawowymi danymi | Konsumenci + Kawiarnie |
| Rejestracja palarni | Self-service formularz, flow: pending → verified → active | Palarnie |
| Panel admina | Kolejka weryfikacji, podgląd/edycja profilu, aktywacja/odrzucenie | Admin |
| SEO landing pages | Strony per kraj i miasto: "coffee roasters in [city/country]" | SEO (wszystkie) |
| Seed 100 palarni | Import 60 z seed-roasters.md + 40 nowych przed launchem | Cold start |
| Mobile-first design | Responsywny, mobile-first — 60%+ ruchu to mobile | Konsumenci |

### P1 — Miesiąc 1 po launch

| Feature | Opis |
|---------|------|
| Wyszukiwarka fulltext | Search po nazwie, mieście, kraju, specialties |
| "Share this roaster" button | Udostępnianie na social media (link + og:image) |
| "Listed on RH" badge | Embed badge dla palarni na ich stronę → backlinki |
| Newsletter signup | Zbieranie maili, segmentacja (kawiarnie vs. konsumenci) |
| Statystyki profilu (podstawowe) | Wyświetlenia, kliknięcia w dane kontaktowe, kliknięcia "Shop online" |

### P2 — Miesiące 2–6

Featured tier ($49/mies.) + Stripe integration, konta kawiarni, konta konsumentów, newsletter digest "Roasters Hub Weekly", blog/content, i18n (PL + DE).

### P3 — 6+ miesięcy

Recenzje i oceny palarni, sample management, profile kawiarni (z listą serwowanych palarni), affiliate links z trackingiem, personalizowane rekomendacje, aplikacja mobilna, API dla partnerów.

---

## 5. Model biznesowy

### Przychody

| Tier | Cena | Co zawiera | Kiedy |
|------|------|------------|-------|
| **Free** | $0 | Profil, Verified badge, widoczność w katalogu | Od dnia 1 |
| **Featured** | $49/mies. | Wyróżnienie w wynikach, badge "Featured", 15+ zdjęć, priorytet w sortowaniu | Miesiąc 6 |
| **Pro** | $89/mies. | Statystyki zaawansowane, priorytetowe wsparcie, sample management | Rok 1+ |
| **Kampanie** | $99–499 | Jednorazowe: baner homepage, region spotlight | Miesiąc 9+ |

**Projekcja przychodów:**
- 500 palarni, 5% konwersja na Featured: ~$1,225/mies.
- 2,000 palarni, 5% konwersja: ~$4,900/mies.
- Monetyzacja startuje w miesiącu 6 — pierwsze 6 miesięcy: growth i walidacja PMF.

### Kawiarnie i konsumenci

Zawsze darmowi. Standard dla platform discovery (ECT, Google Maps, Yelp). Potencjalny przyszły przychód: affiliate prowizje od DTC ($3–9/mies premium konsument), premium konto kawiarni ($0–19/mies).

---

## 6. North Star Metric

**Kliknięcia w dane kontaktowe palarni** — to jest moment, w którym platforma generuje realną wartość: połączenie między palarnią a kawiarnią lub konsumentem.

**PMF test:** Jeśli po 3 miesiącach od launch < 50 kliknięć/mies. w dane kontaktowe — PMF niezwalidowany, pivot.

### Metryki sukcesu

| Metryka | 3 miesiące | 6 miesięcy |
|---------|-----------|-----------|
| Zweryfikowane palarnie | 100 | 300 |
| MAU | 1,000 | 5,000 |
| **Kliknięcia w dane kontaktowe** | **50/mies.** | **200/mies.** |
| Kliknięcia "Shop online" | 100/mies. | 500/mies. |
| Newsletter signups | 200 | 1,000 |
| SEO organic % ruchu | 30% | 50% |

---

## 7. Cold Start Strategy

**Problem:** Chicken-and-egg — bez palarni nie ma kawiarni, bez kawiarni nie ma wartości dla palarni.

**Rozwiązanie:**

**Faza 0 (pre-launch, 2–4 tygodnie):**
1. Ręcznie wprowadzić 100 palarni zanim platforma jest publiczna. `docs/seed-roasters.md` ma już 60 gotowych rekordów.
2. Zweryfikować i oznaczyć jako "Verified" — wysoka jakość od dnia 1.
3. Pełne profile: opis, zdjęcia z publicznych źródeł, certyfikaty, link do sklepu.

**Faza 1 (soft launch, tygodnie 1–4):**
1. Otworzyć platformę z 100+ profilami.
2. Personalny email do każdej z 100 palarni: *"Twój profil jest już na Roasters Hub — przejmij go i edytuj."*
3. Zaproponować "Listed on RH" badge — palarnia promuje profil na swojej stronie → backlinki + ruch zwrotny.
4. Posty na Reddit r/Coffee, r/roasting (autentycznie, nie spam).
5. Submission na Product Hunt.

**Faza 2 (growth, miesiące 2–6):**
SEO zaczyna działać, palarnie zapraszają inne palarnie, konsumenci generują ruch organiczny.

**Kluczowy insight:** Konsumenci rozwiązują część chicken-and-egg. Profil palarni ma wartość dla konsumenta (link "Shop online") niezależnie od obecności kawiarni. Konsumenci generują ruch → palarnia widzi w statystykach → trigger upgradu.

---

## 8. Stack techniczny

Decyzje podjęte i niezmienne dla implementacji MVP:

| Warstwa | Technologia | Uzasadnienie |
|---------|-------------|--------------|
| Framework | Next.js 14+ (App Router) + TypeScript | SSR/SSG krytyczne dla SEO; jeden repo fullstack |
| Styling | Tailwind CSS + shadcn/ui | Szybki development, spójny design system |
| Baza danych | PostgreSQL via **Supabase** | Managed, darmowy tier, PostGIS dla mapy |
| ORM | **Prisma** | Dojrzały, type-safe, Prisma Studio, migracje |
| Auth | **Supabase Auth** | Zintegrowany z DB; magic link + Google OAuth |
| Storage | **Supabase Storage** | Obrazy profili palarni, darmowy do 1GB |
| Mapa | **Leaflet + OpenStreetMap** | Darmowy, wystarczający dla MVP; geocoding przy imporcie |
| Hosting | **Vercel** | Zero-config, edge, CI/CD z GitHub |
| Email | Resend | Newsletter, powiadomienia transakcyjne |
| Płatności | Stripe | Featured tier i kampanie (P2) |
| Analytics | Plausible lub PostHog | Privacy-first, statystyki profili |

---

## 9. Weryfikacja palarni

Weryfikacja jest manualna — admin sprawdza:
1. Czy palarnia istnieje (aktywna strona www lub profil social media)
2. Czy dane są kompletne i niesprzeczne
3. Opcjonalnie: Google Maps, geolokalizacja

**Minimum requirements dla aktywnego profilu:**
- Nazwa i opis (min. 100 znaków)
- Lokalizacja (kraj + miasto)
- Przynajmniej 1 zdjęcie
- Dane kontaktowe (min. strona www lub email)

Po weryfikacji: profil otrzymuje badge **"Verified Roaster"** i jest publiczny w katalogu.

**Status palarni:** `PENDING` → `VERIFIED` (aktywny) lub `REJECTED` (z powodem). Możliwe: `INACTIVE` (palarnia zamknięta).

---

## 10. Zamknięte pytania (z v0.3)

| Pytanie | Decyzja |
|---------|---------|
| Cena Featured? | **$49/mies.** — tańszy od IG Ads, drożej od "nic" |
| Self-service czy tylko formularz? | **Self-service** — formularz rejestracji + manualna weryfikacja admina |
| Mapa dla niezalogowanych? | **Tak** — mapa jest publiczna i dostępna bez rejestracji |
| Onboarding pierwszych palarni? | **Seed ręcznie 100 palarni** przed launchem + personalne emaile |
| Konta konsumentów? | **Nie w MVP** — rejestracja konsumenta w P2 |
| Affiliate links / Shop online? | **"Shop online" link w P0** (zewnętrzny, bez trackingu). Tracking w P3. |
| Profile kawiarni? | **P3** — po walidacji PMF i masy krytycznej |
| Mobile-first? | **Tak** — mobile-first responsive, bez osobnej aplikacji mobilnej w MVP |
| Recenzje konsumentów? | **P3** — wymagają kont konsumentów i moderacji |
| Język platformy? | **Angielski** jako base. i18n PL + DE w P2. |
| Zakres geograficzny? | **Katalog globalny od dnia 1.** Marketing: PL + DE przez pierwsze 6 miesięcy. |
| Kto będzie rozwijał? | **2 osoby + Claude Code** jako główne narzędzie implementacji |

---

## 11. Ryzyka

| Ryzyko | Prawdopodobieństwo | Mitygacja |
|--------|-------------------|-----------|
| Chicken-and-egg | Wysokie | 100 palarni pre-launch; konsumenci jako cold start |
| Brak PMF | Średnie | Research waliduje problem; niski koszt testu (free tier, 6–7 tyg. build) |
| Jakość vs skala | Średnie | Manualna weryfikacja + min. requirements per profil |
| Disintermediation | Niskie | RH nie pośredniczy w transakcji — bezpośredni kontakt TO cel |
| Konkurent wchodzi w niszę | Niskie | Data moat + SEO moat + first-mover w niezagospodarowanej niszy |

---

*Powiązane dokumenty:*
- `docs/research/` — pełny research (personas, market, competitive analysis, JTBD, pricing)
- `docs/seed-roasters.md` — 60 palarni gotowych do importu
- `docs/architecture/` — decyzje techniczne i schemat bazy (tworzone w Etapie 1)
- `docs/prd.md` — specyfikacja wymagań (tworzona w Etapie 2)
- `docs/stories/` — user stories per epic (tworzone just-in-time)
