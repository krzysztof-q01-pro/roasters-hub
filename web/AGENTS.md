# Agent Instructions — Roasters Hub Web App

## Kolejność Orientacji (ZAWSZE czytaj w tej kolejności)

1. **`/PROJECT_STATUS.md`** (root) — co faktycznie istnieje vs. co opisują dokumenty
2. **Ten plik** — konwencje specyficzne dla tej aplikacji
3. Odpowiedni doc architektury — tylko jeśli potrzebny do bieżącego zadania

**ZASADA: Dokumenty architektury opisują INTENCJĘ. `PROJECT_STATUS.md` opisuje RZECZYWISTOŚĆ.**

---

## Faktyczne Wersje Stack (dokumenty mogą podawać inne)

| Pakiet | Faktyczna wersja | Co mówią docs |
|--------|-----------------|---------------|
| Next.js | **16.2.1** | ~~15.x~~ |
| React | **19.2.4** | ~~18.x~~ |
| Prisma | **7.5.0** | ~~5.x~~ |
| Tailwind CSS | **4** | ~~3.x~~ |
| TypeScript | **5.x** | — |

⚠️ **To nie jest Next.js, którego znasz z treningu.** App Router, Server Actions i konwencje plików
mogą różnić się od danych treningowych. W razie wątpliwości sprawdź `package.json` i istniejące wzorce kodu.
Przed pisaniem kodu sprawdź: `node_modules/next/dist/docs/`

---

## Wzorzec Mock Data → Real Data

**Aktualny stan:** strony importują z `src/lib/mock-data.ts`
**Cel:** strony używają Prisma przez `src/lib/db.ts`

```typescript
// Stare (do zastąpienia)
import { MOCK_ROASTERS } from '@/lib/mock-data'

// Nowe
import { db } from '@/lib/db'
const roasters = await db.roaster.findMany({ where: { status: 'VERIFIED' } })
```

---

## Pierwsza Akcja Backendu

Odkomentuj `src/lib/db.ts` — Prisma client jest aktualnie zakomentowany i eksportuje `{}`.
To jest **PIERWSZY krok** odblokowujący całą pracę backendową.

---

## Kluczowe Ograniczenia

- **`prisma/schema.prisma` migracje muszą być sekwencyjne** — ogłoś w teamie przed uruchomieniem `prisma migrate dev`
- **`src/middleware.ts` — jedna osoba modyfikuje na raz** — wpływa na całą aplikację
- **Kolizje slugów** — schema ma `@unique`. Potrzebny algorytm: `hard-beans` → `hard-beans-opole` → `hard-beans-opole-2` (stworzyć `src/lib/slug.ts`)
- **ISR + mutacje** — strony z `revalidate: 3600` potrzebują wywołania `revalidatePath()` w Server Actions po zapisie (np. `verifyRoaster` musi revalidować `/roasters/[slug]`)

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
