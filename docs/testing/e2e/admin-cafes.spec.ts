// Journey 04-D, 04-E: Admin Cafe Moderation
// Tests for admin verification and rejection of cafe applications
// Reference: docs/testing/journeys/04-admin.md - Misje D, E

import { test, expect } from '@playwright/test';

test.describe('Journey 04-D: Admin Cafe Verification', () => {
  test.skip('verifies pending cafe application', async ({ page }) => {
    // TODO: Implement test
    // Steps from journey 04-D:
    // 1. Login as admin
    // 2. Navigate to /admin/cafes
    // 3. Verify pending cafes list visible
    // 4. Click "Verify" on a cafe
    // 5. Verify success message
    // 6. Verify cafe removed from pending list
    // 7. Navigate to /cafes
    // 8. Verify cafe visible in catalog
    // Hidden effects: Cafe.status = VERIFIED, email sent to owner, ISR revalidation
  });

  test.skip('displays empty state when no pending cafes', async ({ page }) => {
    // TODO: Implement test
    // Edge case from journey
  });

  test.skip('requires admin role to access /admin/cafes', async ({ page }) => {
    // TODO: Implement test
    // 1. Try to access /admin/cafes without login → redirect to /sign-in
    // 2. Try to access as ROASTER or CAFE → 403 or redirect
  });
});

test.describe('Journey 04-E: Admin Cafe Rejection', () => {
  test.skip('rejects pending cafe application with reason', async ({ page }) => {
    // TODO: Implement test
    // Steps from journey 04-E:
    // 1. Login as admin
    // 2. Navigate to /admin/cafes
    // 3. Click "Reject" on a cafe
    // 4. Enter rejection reason
    // 5. Confirm rejection
    // 6. Verify success message
    // 7. Verify cafe removed from pending list
    // 8. Verify cafe NOT visible in /cafes
    // Hidden effects: Cafe.status = REJECTED, reason saved, email sent to owner
  });

  test.skip('shows validation error when rejection reason is empty', async ({ page }) => {
    // TODO: Implement test
    // Edge case from journey
  });

  test.skip('allows cancelling rejection', async ({ page }) => {
    // TODO: Implement test
    // 1. Open rejection modal
    // 2. Click "Cancel"
    // 3. Verify modal closed, cafe unchanged
  });
});

// Setup notes:
// - Auth: Clerk Testing Token for ADMIN role (admin@test.beanmap)
// - DB: Min 1 PENDING cafe before each test
// - DB: Clear PENDING cafes after tests