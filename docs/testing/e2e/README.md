# E2E Testing — BeenMap

> **Status:** Phase 1-2 complete (foundation + smoke tests)  
> **Location:** `web/e2e/`  
> **Framework:** Playwright  
> **Last updated:** 2026-04-24

---

## Quick Start

```bash
cd web

# Run smoke tests against production
E2E_BASE_URL=https://beanmap-web.vercel.app npm run e2e:smoke

# Run all E2E tests locally (needs dev server on :3000)
npm run e2e

# Debug mode (headed, slow-mo)
npm run e2e:debug -- e2e/specs/smoke/homepage.spec.ts

# Update visual regression snapshots
npm run e2e:update-snapshots
```

---

## Architecture

```
web/e2e/
├── fixtures/
│   ├── auth.ts              # Programmatic Clerk login stubs
│   └── data-factory.ts      # CreateRoaster(), CreateCafe(), CreateReview()
├── pages/
│   ├── base.page.ts         # Shared: waitForLoad, screenshot
│   ├── home.page.ts
│   ├── roasters.page.ts
│   ├── roaster-profile.page.ts
│   ├── cafes.page.ts
│   └── map.page.ts
├── specs/
│   ├── smoke/               # CI — 3-5 min
│   │   ├── homepage.spec.ts
│   │   ├── roasters.spec.ts
│   │   ├── cafes.spec.ts
│   │   └── map.spec.ts
│   ├── journeys/            # Full user journeys (TODO)
│   └── regression/          # Bug fixes (TODO)
├── global-setup.ts          # Env verification
├── global-teardown.ts       # Cleanup
└── playwright.config.ts     # 5 browsers, parallel execution
```

### Page Object Model (POM)

Every page has a corresponding `.page.ts` file:

```ts
import { HomePage } from "../../pages/home.page";

test("homepage renders", async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await home.expectHeroVisible();
});
```

### Test Data Factory

```ts
import { TestDataFactory } from "../../fixtures/data-factory";

const { roaster, cleanup } = await TestDataFactory.createRoaster({
  name: "Test Roastery",
  status: "VERIFIED",
});
afterEach(() => cleanup());
```

---

## Test Categories

| Category | Count | Duration | When to Run |
|----------|-------|----------|-------------|
| **Smoke** | 9 | ~15s | Every code change (CI conditional) |
| **Journeys** | 0 (planned 50) | ~15-20 min | Weekly + pre-release |
| **Regression** | 0 | — | Per bug fix |

### Smoke Tests (Implemented)

| Spec | Tests | Coverage |
|------|-------|----------|
| `smoke/homepage.spec.ts` | 3 | Hero, navigation, title |
| `smoke/roasters.spec.ts` | 3 | Heading, cards, profile link |
| `smoke/cafes.spec.ts` | 2 | Heading, cards |
| `smoke/map.spec.ts` | 1 | Leaflet container |

### Journey Tests (Planned)

Map 1:1 to `docs/testing/journeys/*.md`:

| Spec | Journey | Role | Priority |
|------|---------|------|----------|
| `journeys/01-guest.spec.ts` | [01-guest](../journeys/01-guest.md) | Guest | P2 |
| `journeys/02-roaster.spec.ts` | [02-roaster](../journeys/02-roaster.md) | Roaster owner | P2 |
| `journeys/03-cafe.spec.ts` | [03-cafe](../journeys/03-cafe.md) | Cafe owner | P2 |
| `journeys/04-admin.spec.ts` | [04-admin](../journeys/04-admin.md) | Admin | P1 |
| `journeys/05-reviewer.spec.ts` | [05-reviewer](../journeys/05-reviewer.md) | Reviewer | P2 |

---

## CI/CD Integration

### Hybrid Triggers (Recommended)

```yaml
# .github/workflows/e2e-smoke.yml (TO BE IMPLEMENTED)
on:
  pull_request:
    paths:
      - 'web/src/**'
      - 'web/prisma/**'
      - 'web/package.json'

jobs:
  e2e-smoke:
    if: |
      !contains(github.event.pull_request.labels, 'skip-smoke')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npx playwright install chromium
      - run: npm run e2e:smoke
        env:
          E2E_BASE_URL: ${{ github.event.deployment_status.target_url || 'http://localhost:3000' }}
```

### Labels

| Label | Effect |
|-------|--------|
| *(none, code changed)* | Run smoke tests |
| `skip-smoke` | Skip all E2E |
| `e2e-smoke` | Force run smoke |
| `e2e-full` | Run full journey suite |

---

## Environment Variables

```bash
# Required
E2E_BASE_URL=http://localhost:3000    # or https://beanmap-web.vercel.app

# Optional (for tests requiring DB/auth)
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_...
```

---

## Adding New Tests

### 1. Create Page Object (if new page)

```ts
// e2e/pages/new-feature.page.ts
import { BasePage } from "./base.page";
export class NewFeaturePage extends BasePage {
  async expectHeading() {
    await expect(this.page.getByRole("heading")).toBeVisible();
  }
}
```

### 2. Create Spec

```ts
// e2e/specs/smoke/new-feature.spec.ts
import { test } from "@playwright/test";
import { NewFeaturePage } from "../../pages/new-feature.page";

test("new feature works", async ({ page }) => {
  const feature = new NewFeaturePage(page);
  await feature.goto();
  await feature.expectHeading();
});
```

### 3. Add `data-testid` to component (preferred over CSS selectors)

```tsx
<button data-testid="save-cafe-button">Save</button>
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `browserType.launch: Executable doesn't exist` | Run `npx playwright install chromium` |
| `DATABASE_URL not set` | Tests work without DB (smoke tests). For DB tests, set env var or create `.env.local` |
| Strict mode violation (multiple elements) | Use `.first()`, `.nth(n)`, or more specific selector |
| Test flaky on CI | Add `retries: 2` in playwright.config.ts |

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-24 | Page Object Model over flat specs | Reusability, maintainability as project grows |
| 2026-04-24 | Production testing as default | No local dev server needed, tests real deployment |
| 2026-04-24 | data-testid over CSS classes | Resilient to design changes |
| 2026-04-24 | 5 browsers in config, smoke only on chromium | Fast feedback for dev, full coverage on demand |
| 2026-04-24 | Hybrid CI triggers (path-based + labels) | Skip E2E for docs/markdown PRs |

---

## Next Steps

1. [ ] Journey tests: 01-guest (homepage → catalog → profile → map)
2. [ ] Journey tests: 04-admin (verify/reject roasters + cafes)
3. [ ] CI workflow: `.github/workflows/e2e-smoke.yml`
4. [ ] Visual regression: baseline snapshots
5. [ ] Accessibility: axe-core integration
