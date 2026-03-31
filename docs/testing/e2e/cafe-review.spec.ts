// Journey 05-B: Cafe Review Submission
// Tests for public review form on cafe profiles
// Reference: docs/testing/journeys/05-reviewer.md - Misja B

import { test, expect } from '@playwright/test';

test.describe('Journey 05-B: Cafe Review Submission', () => {
  test.skip('submits review on cafe profile', async ({ page }) => {
    // TODO: Implement test
    // Steps from journey 05-B:
    // 1. Navigate to /cafes/[slug] (VERIFIED cafe)
    // 2. Find "Leave a review" form
    // 3. Enter name
    // 4. Select rating (1-5 stars)
    // 5. Enter comment (optional)
    // 6. Click "Submit"
    // 7. Verify success message
    // 8. Verify review NOT visible in public reviews (PENDING)
    // Hidden effects: Review created with PENDING status, cafeId set
  });

  test.skip('shows validation error when name is empty', async ({ page }) => {
    // TODO: Implement test
    // Edge case from journey
  });

  test.skip('shows validation error for name too short', async ({ page }) => {
    // TODO: Implement test
    // 1 character name → validation error
  });

  test.skip('shows validation error when rating not selected', async ({ page }) => {
    // TODO: Implement test
    // Submit without rating → validation error
  });

  test.skip('shows validation error for rating out of range', async ({ page }) => {
    // TODO: Implement test
    // Rating 0 or 6 → validation error
  });

  test.skip('accepts review without comment', async ({ page }) => {
    // TODO: Implement test
    // Submit with just name + rating → success
  });

  test.skip('hides review form on PENDING cafe profile', async ({ page }) => {
    // TODO: Implement test
    // Navigate to cafe with PENDING status
    // Verify review form not visible or disabled
  });
});

// Setup notes:
// - No auth required (public form)
// - DB: Min 1 VERIFIED cafe
// - DB: Clear reviews after tests