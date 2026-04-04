// Journey 05-B: Cafe Review Submission
// Tests for public review form on cafe profiles
// Reference: docs/testing/journeys/05-reviewer.md - Misja B
//
// NOTE: Cafe review form uses the same shared component as roaster review form
// (shared/ReviewForm.tsx). Same selectors, same UX (star hover, vertical layout).

import { test, expect } from '@playwright/test';

test.describe('Journey 05-B: Cafe Review Submission', () => {
  test.skip('submits review on cafe profile', async ({ page }) => {
    // TODO: Implement test
    // Steps from journey 05-B:
    // 1. Navigate to /cafes/[slug] (VERIFIED cafe)
    // 2. Find "Leave a Review" form (shared/ReviewForm — same as roaster profile)
    // 3. Enter name in "Your Name" field
    // 4. Hover over 5th star → stars 1-5 light up amber-500
    // 5. Click 5th star to select rating
    // 6. Enter comment in "Comment (optional)" field
    // 7. Click "Submit Review"
    // 8. Verify success message: "Thank you for your review! It will appear after moderation."
    // 9. Verify review NOT visible in public reviews (PENDING)
    // Hidden effects: Review created with PENDING status, cafeId set
  });

  test.skip('shows validation error when name is empty', async ({ page }) => {
    // TODO: Implement test
    // Edge case from journey
    // Expected: "Name must be at least 2 characters"
  });

  test.skip('shows validation error for name too short', async ({ page }) => {
    // TODO: Implement test
    // 1 character name → validation error
  });

  test.skip('shows validation error when rating not selected', async ({ page }) => {
    // TODO: Implement test
    // Submit without rating → "Please select a rating"
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
// - Uses shared/ReviewForm.tsx — same component as roaster review form
// - Star rating: hover before click, amber-500 for selected stars