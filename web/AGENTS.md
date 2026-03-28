# Agent Instructions — Roasters Hub Web App

## Kolejność Orientacji (ZAWSZE czytaj w tej kolejności)

1. **`/PROJECT_STATUS.md`** (root) — co faktycznie istnieje vs. co opisują dokumenty
2. **Ten plik** — konwencje specyficzne dla tej aplikacji
3. Odpowiedni doc architektury — tylko jeśli potrzebny do bieżącego zadania

**ZASADA: Dokumenty architektury opisują INTENCJĘ. `PROJECT_STATUS.md` opisuje RZECZYWISTOŚĆ.**

---

## Faktyczne Wersje Stack (dokumenty mogą podawać inne)

| Pakiet | Faktyczna wersja |
|--------|-----------------|
| Next.js | **16.2.1** |
| React | **19.2.4** |
| Prisma | **7.5.0** |
| Tailwind CSS | **4** |
| Auth | **Clerk** (`@clerk/nextjs` ^6) |
| DB | **Vercel Postgres** (Neon) |
| Storage | **Uploadthing** (MVP) → Cloudflare R2 |
| TypeScript | **5** | — |

⚠️ **To nie jest Next.js, którego znasz z treningu.** App Router, Server Actions i konwencje plików
mogą różnić się od danych treningowych. W razie wątpliwości sprawdź `package.json` i istniejące wzorce kodu.
Przed pisaniem kodu sprawdź: `node_modules/next/dist/docs/`

---

## Kluczowe Ograniczenia

- **Prisma 7: `url`/`directUrl` NIE w `schema.prisma`** — powoduje błąd P1012. W `prisma.config.ts` blok `datasource` obsługuje TYLKO `url` i `shadowDatabaseUrl` (bez `directUrl`).
- **`prisma/schema.prisma` migracje muszą być sekwencyjne** — ogłoś w teamie przed uruchomieniem `prisma migrate dev`
- **`src/middleware.ts` — jedna osoba modyfikuje na raz** — wpływa na całą aplikację
- **Kolizje slugów** — obsługuje `src/lib/slug.ts` (`hard-beans` → `hard-beans-opole` → `hard-beans-opole-2`)

---

## ISR + revalidation (OBOWIĄZKOWE)

Wszystkie strony z zapytaniami Prisma mają `export const revalidate = 3600`.

**Reguła: każda nowa strona z `db.*` musi mieć `export const revalidate = 3600`.**

**Reguła: każdy Server Action zmieniający dane MUSI wywołać `revalidatePath()` dla WSZYSTKICH stron, które wyświetlają te dane.** Checklist:
- `/` — homepage stats (roasterCount, countryCount)
- `/roasters` — katalog
- `/roasters/[slug]` — profil
- `/map` — markery
- `/admin/pending` — kolejka admina

---

## Konwencja Commitów

```
[SCOPE] action: description
```
Scopes: `DB | AUTH | ACTION | UI | SEED | INFRA | DOCS | AGENT`

Commit `[AGENT] update: ...` = aktualizacja plików orientacyjnych projektu.

---

## Protokół Końca Sesji

Po każdej sesji zapisz `.tmp/SESSION.md` (gitignored):

```markdown
## Session [data]
Started: [co mówiło PROJECT_STATUS — aktywne zadanie]
Completed: [co zostało zrobione]
Tested: [co zostało zweryfikowane]
Blocked by: [jeśli coś blokuje]
Next: [dokładny następny krok]
```

Na początku kolejnej sesji czytaj: `.tmp/SESSION.md` → `PROJECT_STATUS.md` → ten plik.

---

## Kluczowe Pliki Referencyjne

| Plik | Cel |
|------|-----|
| `prisma/schema.prisma` | Definicja DB — source of truth dla modeli |
| `src/lib/mock-data.ts` | 12 mock roasters — wzorzec struktury danych |
| `src/types/certifications.ts` | Typy i stałe dla certyfikatów, roast styles, origins |
| `docs/architecture/api-design.md` | Blueprint dla `ActionResult<T>`, Zod schemas, Server Actions |
| `docs/seed-roasters.md` | Lista 60+ palarni do seedu produkcyjnego |
