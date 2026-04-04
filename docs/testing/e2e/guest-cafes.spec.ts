// Journey 01-D, 01-E, 01-C (map toggle): Cafe catalog, profile, and map
// Tests for guest interactions with cafe features
// Reference: docs/testing/journeys/01-guest.md - Misje D, E, C (toggle)

import { test, expect } from '@playwright/test';

test.describe('Journey 01-D: Cafe Catalog', () => {
  test.skip('displays cafes in catalog', async ({ page }) => {
    // TODO: Implement test
    // Steps from journey 01-D:
    // 1. Navigate to /cafes
    // 2. Verify cafe cards visible (name, city, country, roaster count)
    // 3. Verify average rating displayed (if any)
  });

  test.skip('navigates from cafe card to cafe profile', async ({ page }) => {
    // TODO: Implement test
    // 1. Click cafe card
    // 2. Verify redirect to /cafes/[slug]
  });

  test.skip('displays empty state when no verified cafes', async ({ page }) => {
    // TODO: Implement test
    // Edge case: empty catalog
  });
});

test.describe('Journey 01-E: Cafe Profile', () => {
  test.skip('displays cafe details', async ({ page }) => {
    // TODO: Implement test
    // Steps from journey 01-E:
    // 1. Navigate to /cafes/[slug]
    // 2. Verify name, city, country, description
    // 3. Verify average rating (if any)
    // 4. Verify contact links (website, instagram, phone)
  });

  test.skip('displays roasters served by cafe', async ({ page }) => {
    // TODO: Implement test
    // 1. Navigate to cafe profile
    // 2. Verify "Roasters we serve" section
    // 3. Verify roaster links work
  });

  test.skip('displays review form on cafe profile', async ({ page }) => {
    // TODO: Implement test
    // 1. Navigate to cafe profile
    // 2. Verify "Leave a Review" section visible (shared/ReviewForm)
    // 3. Verify form fields: "Your Name" textbox, star rating buttons (1-5 ★), "Comment (optional)" textarea, "Submit Review" button
    // 4. Verify star hover: hover over star → amber-500 highlight
    // 5. Verify review list above form uses same layout as roaster profile (shared/ReviewList)
  });

  test.skip('returns 404 for non-existent cafe slug', async ({ page }) => {
    // TODO: Implement test
    // Edge case from journey
  });
});

test.describe('Journey 01-C: Map Cafe Toggle', () => {
  test.skip('displays cafe markers on map when toggle enabled', async ({ page }) => {
    // TODO: Implement test
    // Steps from journey 01-C (extended):
    // 1. Navigate to /map
    // 2. Find cafe toggle
    // 3. Click toggle to show cafes
    // 4. Verify cafe markers appear (different icon/color than roasters)
  });

  test.skip('displays cafe popup with link to profile', async ({ page }) => {
    // TODO: Implement test
    // 1. Toggle cafes on map
    // 2. Click cafe marker
    // 3. Verify popup shows cafe name, city, country
    // 4. Click link → navigate to /cafes/[slug]
  });
});

// Setup notes:
// - No auth required
// - DB: Min 3 VERIFIED cafes with lat/lng
// - DB: Min 1 VERIFIED cafe with website, instagram, phone
// - Review form on cafe profile uses shared/ReviewForm.tsx (same as roaster profile)
// - Review list uses shared/ReviewList.tsx (same as roaster profile)