# E2E Testing Plan — Playwright

Specs generowane na podstawie `docs/testing/journeys/`. Każda misja = jeden plik `.spec.ts`.

---

## Środowisko

| Środowisko | URL | Kiedy |
|-----------|-----|-------|
| Preview | `$VERCEL_URL` (auto per PR) | Pull Requests |
| Produkcja | `beanmap-web.vercel.app` | `push: main` |
| Lokalnie | `http://localhost:3000` | Dev (opcjonalnie) |

Docelowo: testy E2E uruchamiają się automatycznie na **Vercel Preview URL** dla każdego PR, i na `push: main` dla produkcji.

---

## Mapa specs

| Plik spec | Journey | Misje | Priorytet |
|-----------|---------|-------|-----------|
| `guest.spec.ts` | [01-guest](../journeys/01-guest.md) | A: katalog, B: profil+kliknięcia, C: mapa | P2 |
| `registration.spec.ts` | [02-roaster](../journeys/02-roaster.md) | A: rejestracja 3-step wizard | P1 |
| `admin.spec.ts` | [04-admin](../journeys/04-admin.md) | A: weryfikacja, B: odrzucenie | P1 |
| `roaster-dashboard.spec.ts` | [02-roaster](../journeys/02-roaster.md) | B: dashboard | P2 |
| `cafe.spec.ts` | [03-cafe](../journeys/03-cafe.md) | A: zapis/usunięcie | P2 |
| `review.spec.ts` | [05-reviewer](../journeys/05-reviewer.md) | A: formularz recenzji | P2 |
| `admin-reviews.spec.ts` | [04-admin](../journeys/04-admin.md) | C: moderacja recenzji | P3 |

Zacznij od P1 (`registration.spec.ts`, `admin.spec.ts`) — pokrywają krytyczne flow pieniężne i trust platformy.

---

## Podejście implementacyjne

### 1. Setup Playwright

```bash
cd web
npm install -D @playwright/test
npx playwright install chromium
```

Konfiguracja `playwright.config.ts` — wystarczy Chromium, headless, base URL z env:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '../docs/testing/e2e',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    headless: true,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
```

### 2. Konta testowe

Każdy test który wymaga logowania korzysta z **Clerk Testing Tokens** (nie prawdziwego OAuth flow):

```ts
// fixtures/auth.ts
import { clerk } from '@clerk/testing/playwright';

export const adminUser = { email: 'admin@test.beanmap', ... };
export const cafeUser  = { email: 'cafe@test.beanmap', ... };
```

Clerk Testing Tokens działają bez UI sign-in — Agent AI może je użyć bezpośrednio. Szczegóły: [Clerk Playwright docs](https://clerk.com/docs/testing/playwright).

### 3. Dane testowe

Każdy spec powinien być **izolowany** — tworzy własne dane i po sobie sprząta (lub używa dedykowanego test-user z predefiniowanym stanem DB).

Opcja dla MVP: `beforeAll` seed minimalnych danych przez API / bezpośredni Prisma call do Neon test branch.

### 4. Struktura każdego spec

```ts
// registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Journey 02-A: Roaster Registration', () => {
  test('completes 3-step wizard and shows success', async ({ page }) => {
    // Setup → Kroki → Assert (mapowane 1:1 z tabeli w journeys/02-roaster.md)
  });

  test('shows validation error when name is empty', async ({ page }) => {
    // Edge case z sekcji Edge cases w journey doc
  });
});
```

### 5. CI — GitHub Actions

```yaml
# .github/workflows/e2e.yml
on:
  push:
    branches: [main]
  deployment_status:          # trigger po Vercel preview deploy

jobs:
  e2e:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    env:
      E2E_BASE_URL: ${{ github.event.deployment_status.target_url }}
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
        working-directory: web
      - run: npx playwright install --with-deps chromium
        working-directory: web
      - run: npx playwright test
        working-directory: web
```

---

## Kolejność implementacji (rekomendowana)

1. **Setup** — zainstaluj Playwright, skonfiguruj `playwright.config.ts`, dodaj do `package.json`
2. **`registration.spec.ts`** — happy path + walidacja step 1 (nie wymaga auth)
3. **`admin.spec.ts`** — verify + reject (wymaga Clerk Testing Token dla ADMIN)
4. **`guest.spec.ts`** — katalog, profil, mapa (nie wymaga auth)
5. **CI job** — GitHub Actions trigger na `deployment_status`
6. Pozostałe specs (cafe, dashboard, reviews)

---

## Zależności / blockers

| Zależność | Status | Uwagi |
|-----------|--------|-------|
| Clerk Testing Tokens | ✅ dostępne | Wymaga `CLERK_SECRET_KEY` w CI |
| Neon test branch | 🔜 zablokowane | Wymaga GitHub integration w Neon Console — zadanie dla KK |
| Vercel Preview URL w CI | ✅ dostępne | Via `deployment_status` event |
