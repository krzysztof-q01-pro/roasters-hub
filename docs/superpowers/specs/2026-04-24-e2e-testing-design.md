# E2E Testing Architecture — BeenMap

> **Spec:** Comprehensive Playwright E2E testing suite for BeenMap (Bean Map)
> **Date:** 2026-04-24
> **Assignee:** @MN
> **Scope:** Full audit of current project + reusable strategy for future increments

---

## 1. Goal

Build a Playwright-based E2E testing module that:
1. **Audits the current project** — verifies all 22 journeys across 5 roles work correctly
2. **Stays maintainable as project grows** — each new feature gets E2E coverage by default
3. **Runs efficiently** — smart triggers, parallel execution, fast feedback loop
4. **Catches regressions early** — smoke tests on code changes, full suite before release

---

## 2. Architecture

### 2.1 Philosophy

| Principle | Implementation |
|-----------|----------------|
| **Page Object Model (POM)** | Reusable page classes encapsulate selectors and actions |
| **Journey-based specs** | Tests mirror user journeys from `docs/testing/journeys/` |
| **Deterministic data** | Test data factory creates entities with known slugs/IDs |
| **Isolated state** | Each test run gets clean Neon Preview Branch |
| **Fast feedback** | Smoke tests (3-5 min) vs Full suite (15-20 min) |

### 2.2 Directory Structure

```
web/e2e/
├── fixtures/
│   ├── auth.ts              # Programmatic Clerk login + session storage
│   ├── db.ts                # Neon Preview Branch lifecycle (create/seed/delete)
│   └── data-factory.ts      # CreateRoaster(), CreateCafe(), CreateReview() helpers
├── pages/
│   ├── base.page.ts         # Shared: waitForLoad, screenshot, a11y check
│   ├── home.page.ts
│   ├── roasters.page.ts
│   ├── roaster-profile.page.ts
│   ├── cafes.page.ts
│   ├── cafe-profile.page.ts
│   ├── map.page.ts
│   ├── register.page.ts
│   ├── dashboard.page.ts
│   └── admin.page.ts
├── specs/
│   ├── smoke/               # CI — 3-5 min, run on code changes
│   │   ├── homepage.spec.ts
│   │   ├── navigation.spec.ts
│   │   ├── auth.spec.ts
│   │   └── critical-path.spec.ts
│   ├── journeys/            # Full user journeys — 22 missions, 5 roles
│   │   ├── 01-guest.spec.ts
│   │   ├── 02-roaster.spec.ts
│   │   ├── 03-cafe.spec.ts
│   │   ├── 04-admin.spec.ts
│   │   └── 05-reviewer.spec.ts
│   └── regression/          # One spec per fixed bug (prevents regression)
│       └── BUG-123-fix-mobile-filters.spec.ts
├── snapshots/               # Visual regression baselines (committed)
│   └── homepage-desktop.png
├── utils/
│   ├── test-ids.ts          # data-testid constants (centralized)
│   └── selectors.ts         # Shared CSS/XPath selectors
├── playwright.config.ts
├── global-setup.ts          # One-time: verify env vars, check Clerk health
└── global-teardown.ts       # Cleanup: delete leftover Neon branches
```

### 2.3 Data Strategy — Neon Preview Branch Per Test Run

```ts
// e2e/fixtures/db.ts
export async function createTestDatabase() {
  // 1. Create Neon branch: e2e-run-<timestamp>-<random>
  // 2. Set DATABASE_URL env var for test process
  // 3. Run `prisma migrate deploy`
  // 4. Run `prisma db seed` (50 roasters + 100 cafes)
  // 5. Create test accounts: admin, roaster-owner, cafe-owner
  // 6. Return branchId + cleanup function
}
```

**Why Preview Branch?**
- ✅ Clean state per run (no data pollution)
- ✅ Tests real DB queries, relations, indexes
- ✅ Uses existing CI infrastructure (`preview-db.yml` pattern)
- ✅ Parallel test runs don't conflict

**Cost:** ~2 min branch creation + seed. Acceptable for smoke (3-5 min total) and full suite (15-20 min).

### 2.4 Auth — Programmatic Clerk Login

```ts
// e2e/fixtures/auth.ts
export async function loginAs(page: Page, role: 'admin' | 'roaster' | 'cafe' | 'guest') {
  if (role === 'guest') return;
  
  // 1. Call Clerk API to create session token
  const token = await createClerkSessionToken(role);
  
  // 2. Set __clerk_client_jwt cookie
  await page.context().addCookies([{
    name: '__clerk_client_jwt',
    value: token,
    domain: 'localhost',
    path: '/',
  }]);
  
  // 3. Verify: page shows authenticated UI
  await page.goto('/');
  await expect(page.getByTestId('user-button')).toBeVisible();
}
```

**Requirements:**
- `CLERK_SECRET_KEY` in `.env.local`
- Test accounts pre-created in seed (see data-factory.ts)
- Session tokens short-lived (5 min) for security

### 2.5 Test Data Factory

```ts
// e2e/fixtures/data-factory.ts
export const TestDataFactory = {
  async createRoaster(overrides?: Partial<Roaster>) {
    return db.roaster.create({
      data: {
        name: 'Test Roastery',
        slug: `test-roastery-${Date.now()}`,
        country: 'Poland',
        countryCode: 'PL',
        city: 'Warsaw',
        status: 'VERIFIED',
        ...overrides,
      }
    });
  },
  
  async createCafe(overrides?: Partial<Cafe>) { /* ... */ },
  async createReview(overrides?: Partial<Review>) { /* ... */ },
  async createUserProfile(role: UserRole) { /* ... */ },
};
```

**Key rule:** Every factory function returns a cleanup callback:
```ts
const { roaster, cleanup } = await TestDataFactory.createRoaster();
afterEach(() => cleanup()); // or rely on branch deletion
```

---

## 3. Running Strategy

### 3.1 Test Categories

| Category | Count | Duration | When to Run | Trigger |
|----------|-------|----------|-------------|---------|
| **Smoke** | ~10 tests | 3-5 min | Every code change | CI (conditional) |
| **Journeys** | ~50 tests | 15-20 min | Weekly + pre-release | Manual / Cron |
| **Regression** | 1 per bug | <1 min each | When bug fixed | CI (on bugfix PR) |
| **Visual** | ~20 snapshots | 5 min | Pre-release | Manual |
| **A11y** | All pages | 3 min | Weekly | Cron |

### 3.2 CI/CD Triggers (Hybrid Approach)

```yaml
# .github/workflows/e2e-smoke.yml
on:
  pull_request:
    paths:
      - 'web/src/**'
      - 'web/prisma/**'
      - 'web/package.json'
      - 'web/next.config.ts'
      - '.github/workflows/**'

jobs:
  should-run:
    steps:
      - name: Check labels and files
        run: |
          # Skip if 'skip-smoke' label
          if echo "${{ github.event.pull_request.labels }}" | grep -q "skip-smoke"; then
            echo "run=false" >> $GITHUB_OUTPUT
            exit 0
          fi
          
          # Run if 'e2e-smoke' or 'e2e-full' label
          if echo "${{ github.event.pull_request.labels }}" | grep -q "e2e-"; then
            echo "run=true" >> $GITHUB_OUTPUT
            exit 0
          fi
          
          # Run if code files changed (already filtered by `paths`)
          echo "run=true" >> $GITHUB_OUTPUT
```

**Label conventions:**
| Label | Effect |
|-------|--------|
| *(no label, code changed)* | Run smoke tests |
| `skip-smoke` | Skip all E2E |
| `e2e-smoke` | Force run smoke (even for docs PR) |
| `e2e-full` | Run full journey suite (22 missions) |
| `visual-regression` | Run visual comparison tests |

### 3.3 Local Development

```bash
# Quick smoke check (uses local dev server + existing DB)
npm run e2e:smoke

# Single journey
npm run e2e -- journeys/01-guest.spec.ts

# Full suite (creates Neon branch)
npm run e2e:full

# Debug mode (headed, slow-mo)
npm run e2e:debug -- journeys/01-guest.spec.ts

# Update visual snapshots
npm run e2e:update-snapshots
```

---

## 4. Spec Categories in Detail

### 4.1 Smoke Tests (CI)

```ts
// e2e/specs/smoke/homepage.spec.ts
test.describe('Smoke: Homepage', () => {
  test('renders without errors', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Bean Map/i })).toBeVisible();
    await expect(page.getByText(/specialty coffee/i)).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Browse Roasters/i }).click();
    await expect(page).toHaveURL(/\/roasters/);
  });

  test('locale switcher changes language', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('locale-switcher').click();
    await page.getByText('Polski').click();
    await expect(page.getByText(/palarnie/i)).toBeVisible();
  });
});
```

### 4.2 Journey Tests (Full Suite)

Map 1:1 to `docs/testing/journeys/*.md`:

```ts
// e2e/specs/journeys/01-guest.spec.ts
test.describe('Journey 01: Guest', () => {
  test('Mission A: Discover roasters', async ({ page }) => {
    // Steps from docs/testing/journeys/01-guest.md
    await page.goto('/roasters');
    await page.getByPlaceholder(/Search/i).fill('hard beans');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Hard Beans')).toBeVisible();
  });

  test('Mission D: Cafe catalog', async ({ page }) => {
    await page.goto('/cafes');
    await expect(page.getByRole('heading', { name: /Cafes/i })).toBeVisible();
    // ... filter by country, click cafe, verify profile
  });
});
```

### 4.3 Regression Tests

```ts
// e2e/specs/regression/BUG-456-mobile-filters.spec.ts
test('mobile filters: search always visible', async ({ page }) => {
  // Reproduce exact bug scenario
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/roasters');
  
  // Search should be visible without expanding filters
  await expect(page.getByPlaceholder(/Search/i)).toBeVisible();
  
  // Other filters should be collapsed
  await expect(page.getByText(/Country/i)).not.toBeVisible();
});
```

---

## 5. Quality Checks Built-In

### 5.1 Accessibility (axe-core)

```ts
// Automatically run after each journey test
export async function runA11yCheck(page: Page) {
  const violations = await page.evaluate(() => {
    // @ts-ignore
    return axe.run(document.body);
  });
  expect(violations.violations).toHaveLength(0);
}
```

### 5.2 Visual Regression

```ts
test('homepage visual regression', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(await page.screenshot({ fullPage: true }))
    .toMatchSnapshot('homepage-desktop.png');
});
```

**Threshold:** 1% pixel diff allowed (font rendering differences across OS).

### 5.3 Performance Budget

```ts
export async function checkWebVitals(page: Page) {
  const metrics = await page.evaluate(() => {
    return {
      lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
      fid: performance.getEntriesByType('first-input')[0]?.processingStart,
      cls: performance.getEntriesByType('layout-shift').reduce((sum, e) => sum + e.value, 0),
    };
  });
  expect(metrics.lcp).toBeLessThan(2500); // < 2.5s
  expect(metrics.cls).toBeLessThan(0.1);   // < 0.1
}
```

---

## 6. Maintenance Strategy

### 6.1 Adding Tests for New Features

**Rule:** Every new user-facing feature MUST include E2E coverage.

Template for developer:
```ts
// When adding new page: /new-feature
// 1. Create e2e/pages/new-feature.page.ts
// 2. Add smoke test in e2e/specs/smoke/
// 3. If part of journey: extend e2e/specs/journeys/XX-*.spec.ts
// 4. Add data-testid attributes in component (not CSS classes)
```

### 6.2 Handling Flakiness

| Symptom | Fix |
|---------|-----|
| Race condition | Use `await expect(...).toBeVisible()` instead of `sleep()` |
| Dynamic data | Seed deterministic data (same slugs every run) |
| Network timeout | Increase `expect` timeout for slow pages (map) |
| Clerk session expiry | Refresh token mid-test if needed |
| Neon branch slow | Add retry logic (max 3 attempts) |

### 6.3 Test IDs Convention

```tsx
// In components — use data-testid (NOT CSS classes)
<button data-testid="save-cafe-button">Save</button>
<input data-testid="roaster-search-input" />
<div data-testid="roaster-card-{slug}">
```

Central registry in `e2e/utils/test-ids.ts`:
```ts
export const TestIds = {
  saveCafeButton: 'save-cafe-button',
  roasterSearchInput: 'roaster-search-input',
  roasterCard: (slug: string) => `roaster-card-${slug}`,
} as const;
```

---

## 7. Configuration

### 7.1 playwright.config.ts

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 3 : undefined,
  
  reporter: [
    ['html', { open: 'never' }],
    ['github'],
    ['list'],
  ],
  
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
});
```

### 7.2 Environment Variables

```bash
# .env.local (already exists, add these)
E2E_BASE_URL=http://localhost:3000
CLERK_SECRET_KEY=sk_test_...
NEON_API_KEY=...
NEON_PROJECT_ID=...
E2E_NEON_BRANCH_PREFIX=e2e-run
```

### 7.3 npm Scripts

```json
{
  "e2e": "playwright test",
  "e2e:smoke": "playwright test specs/smoke",
  "e2e:full": "playwright test specs/journeys",
  "e2e:debug": "playwright test --headed --project=chromium",
  "e2e:ui": "playwright test --ui",
  "e2e:update-snapshots": "playwright test --update-snapshots"
}
```

---

## 8. Implementation Phases

| Phase | Scope | Duration | Deliverables |
|-------|-------|----------|--------------|
| **1. Foundation** | Config + fixtures + auth + db | 2h | `playwright.config.ts`, `fixtures/`, `global-setup.ts` |
| **2. Page Objects** | All page classes | 3h | `pages/*.ts` with selectors |
| **3. Smoke Tests** | 10 critical tests | 2h | `specs/smoke/*.spec.ts` |
| **4. Journeys** | 22 missions across 5 roles | 6h | `specs/journeys/*.spec.ts` |
| **5. CI Integration** | GitHub Actions workflows | 2h | `.github/workflows/e2e-smoke.yml`, `e2e-full.yml` |
| **6. Polish** | Visual regression, a11y, docs | 2h | Snapshots, axe-core, `docs/testing/e2e/README.md` |

**Total:** ~17h (można podzielić na 2-3 sesje)

---

## 9. Out of Scope (for now)

- Load testing / stress testing (k6/Locust)
- Cross-browser testing on real devices (BrowserStack)
- API contract testing (Pact)
- Performance profiling (Lighthouse CI)

---

## 10. Acceptance Criteria

- [ ] Smoke tests pass in CI in < 5 minutes
- [ ] Full journey suite passes locally in < 20 minutes
- [ ] Each new feature PR gets smoke test coverage automatically
- [ ] Programmatic Clerk login works for all 4 roles
- [ ] Neon Preview Branch is created and destroyed per run
- [ ] Visual regression catches unintended UI changes
- [ ] Accessibility checks pass on all pages (0 violations)
- [ ] Test data factory creates deterministic entities
- [ ] CI skips E2E for docs/markdown changes
- [ ] Labels (`e2e-full`, `skip-smoke`) work as documented

---

## 11. Notes

- **Neon Free plan limit:** 10 branches — concurrent PRs + E2E runs could hit limit. Monitor via `gh run list`.
- **Clerk test tokens:** May need rate limit handling if many parallel workers.
- **ISR pages:** Tests should wait for revalidation or bypass cache with `?t=<timestamp>`.
- **Map (Leaflet):** Canvas rendering may need `deviceScaleFactor: 1` for consistent screenshots.

---

**Next step:** Write implementation plan (`docs/superpowers/plans/YYYY-MM-DD-e2e-testing.md`) and begin Phase 1.
