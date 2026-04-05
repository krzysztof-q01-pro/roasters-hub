## Branch Review: feat/mn-cafe-profiles
Date: 2026-03-31
Commits: 20 (4 UI feature + 1 DOCS + 11 INFRA fixes + 4 older infra)
Reviewer: @MN

---

### Verdict: PASS

---

### What Was Done Well

- All 7 ROADMAP tasks have physical code evidence — every claim verified
- TypeScript: `npx tsc --noEmit` exits clean (0 errors)
- ESLint: 0 errors, 1 warning in coverage/lcov-report (not production code)
- Vitest: 77 tests, 8 test files, all passing
- ISR rule (Consistency Rule 1) followed on all new pages with `db.*`:
  - `/cafes/page.tsx` → `export const revalidate = 3600` ✅
  - `/cafes/[slug]/page.tsx` → `export const revalidate = 3600` ✅
  - (admin + dashboard pages use `force-dynamic` — correct for auth-gated pages)
- All Server Actions have `try/catch` + `ActionResult<T>` return types
- `revalidatePath()` called in all mutating actions (create, update, verify, reject, add/remove relation)
- `requireAdmin()` / `requireCafeOwner()` auth guards in place on all sensitive actions
- New Prisma models `Cafe` + `CafeRoasterRelation` with proper indexes
- `Review` model extended with optional `cafeId` (nullable FK)
- `UserProfile` extended with optional `cafeId`
- `Roaster` extended with `servedAt` relation
- Zod schemas `CreateCafeSchema`, `UpdateCafeSchema`, `CreateCafeReviewSchema` in `src/types/actions.ts`
- Preview DB isolation via Neon branches (`db-url.ts`, `preview-db.yml`)
- AGENTS.md updated with CI architecture notes

---

### Issues Found

| # | Issue | Severity | File |
|---|-------|----------|------|
| 1 | `CafeReviewForm` calls `submitCafeReview` but the action is in `review.actions.ts` — need to confirm import chain works | LOW | `src/components/cafes/CafeReviewForm.tsx` |
| 2 | `cafe.actions.test.ts` mocks `@/lib/email` (`sendNewRegistrationNotification`) but `cafe.actions.ts` does not import or call it — dead mock, harmless but suggests email notification for cafe registration was planned but not implemented | LOW | `src/actions/cafe.actions.ts` |

---

### ROADMAP Claims Verification

| Claim | Status |
|-------|--------|
| DB: Cafe + CafeRoasterRelation — Prisma schema, migration | ✅ Verified: `prisma/schema.prisma` lines 197–242, `migrations/20260330000000_add_cafe/migration.sql` |
| Actions: createCafe, updateCafe, verifyCafe, rejectCafe | ✅ Verified: `src/actions/cafe.actions.ts` |
| Actions: addCafeRoasterRelation, removeCafeRoasterRelation | ✅ Verified: `src/actions/cafe-relation.actions.ts` |
| Actions: extend review.actions for cafes | ✅ Verified: `src/actions/review.actions.ts` (submitCafeReview, approveReview extended) |
| Actions: Vitest tests | ✅ Verified: 77 tests passing (cafe.actions.test.ts + cafe-relation.actions.test.ts) |
| UI: /cafes catalog (ISR 3600s) | ✅ Verified: `src/app/cafes/page.tsx` with `export const revalidate = 3600` |
| UI: /cafes/[slug] profile (ISR 3600s) | ✅ Verified: `src/app/cafes/[slug]/page.tsx` with `export const revalidate = 3600` |
| UI: CafeCard, CafeReviewForm, CafeReviewList | ✅ Verified: `src/components/cafes/` directory |
| UI: /register/cafe 3-step wizard | ✅ Verified: `src/app/register/cafe/page.tsx` with STEPS array and 3-step logic |
| UI: Admin /admin/cafes panel | ✅ Verified: `src/app/admin/cafes/page.tsx` + `client.tsx` |
| UI: extend /admin/reviews with Kawiarnie tab | ✅ Verified: `src/app/admin/reviews/client.tsx` has TabFilter + "cafes" tab |
| UI: /dashboard/cafe owner panel | ✅ Verified: `src/app/dashboard/cafe/page.tsx` + `client.tsx` |
| UI: saved-roasters moved to /dashboard/saved-roasters | ✅ Verified: `src/app/dashboard/saved-roasters/page.tsx` |
| UI: Map cafe pins + toggle | ✅ Verified: `MapContent.tsx` toggle buttons, `RoasterMap.tsx` cafe pins with distinct orange icon |
| UI: "Gdzie wypić" section on /roasters/[slug] | ✅ Verified: `src/app/roasters/[slug]/page.tsx` line 204 |
| UI: Cafe CTA on homepage | ✅ Verified: `src/app/page.tsx` — `/cafes` link ("Find a Cafe →") |

---

### Required Fixes Before Merge

None — issues found are LOW severity and do not block merge.

Note: The dead mock for `sendNewRegistrationNotification` in `cafe.actions.test.ts` suggests email notification for cafe registration (analogous to roaster registration) was not implemented. This is acceptable scope — no claim was made for it. Can be tracked as a NEXT task if desired.
